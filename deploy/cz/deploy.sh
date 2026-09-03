#!/usr/bin/env bash

set -Eeuo pipefail

readonly repository_url="https://github.com/kiaquila/dreamboard.git"
readonly repository_dir="/srv/dreamboard/repository.git"
readonly releases_dir="/srv/dreamboard/releases"
readonly current_link="/srv/dreamboard/current"
readonly lock_file="/run/lock/dreamboard-deploy.lock"
readonly node_image="node@sha256:cadbfafeb6baf87eaaffa40b3640209c4b7fd38cebde65059d15bc39cd636b85"
readonly runs_url="https://api.github.com/repos/kiaquila/dreamboard/actions/runs"

log() {
  printf '[dreamboard-deploy] %s\n' "$*"
}

mkdir -p "$releases_dir"
exec 9>"$lock_file"

if ! flock -n 9; then
  log "another deployment is already running"
  exit 0
fi

if [[ ! -d "$repository_dir" ]]; then
  log "creating the local repository mirror"
  git clone --mirror "$repository_url" "$repository_dir"
fi

git --git-dir="$repository_dir" fetch --quiet --prune origin \
  "+refs/heads/main:refs/remotes/origin/main"

revision="$(git --git-dir="$repository_dir" rev-parse refs/remotes/origin/main)"
current_revision=""
current_target=""
current_release_dir=""

if [[ -L "$current_link" ]]; then
  current_target="$(readlink -f "$current_link")"
  current_release_dir="$(dirname "$current_target")"
  current_revision="$(basename "$current_release_dir")"
fi

if [[ "$revision" == "$current_revision" && -f "$current_release_dir/.deployed" ]]; then
  log "revision $revision is already live"
  exit 0
fi

if [[ "$revision" == "$current_revision" ]]; then
  log "revision $revision is live but unvalidated; retrying validation"
fi

runs_json="$(
  curl --fail --silent --show-error \
    --retry 3 \
    --retry-delay 2 \
    --header "Accept: application/vnd.github+json" \
    --header "User-Agent: dreamboard-cz-deployer" \
    "$runs_url?branch=main&event=push&head_sha=$revision&per_page=100"
)"

checks_state="$(
  python3 -c '
import json
import sys

revision = sys.argv[1]
required = {
    "CI": ".github/workflows/ci.yml",
    "OSV Scan": ".github/workflows/osv-scan.yml",
}
payload = json.load(sys.stdin)
found = {}

for run in payload.get("workflow_runs", []):
    name = run.get("name")
    if (
        name in required
        and run.get("path") == required[name]
        and run.get("event") == "push"
        and run.get("head_branch") == "main"
        and run.get("head_sha") == revision
        and name not in found
    ):
        found[name] = (run.get("status"), run.get("conclusion"))

missing = sorted(required.keys() - found.keys())
if missing:
    print("pending:" + ",".join(missing))
    raise SystemExit(0)

pending = sorted(
    name for name, (status, _conclusion) in found.items()
    if status != "completed"
)
if pending:
    print("pending:" + ",".join(pending))
    raise SystemExit(0)

failed = sorted(
    name for name, (_status, conclusion) in found.items()
    if conclusion != "success"
)
if failed:
    print("failed:" + ",".join(failed))
    raise SystemExit(0)

print("ready")
' "$revision" <<<"$runs_json"
)"

case "$checks_state" in
  ready)
    ;;
  pending:*)
    log "revision $revision is waiting for ${checks_state#pending:}"
    exit 0
    ;;
  failed:*)
    log "revision $revision has failed checks: ${checks_state#failed:}"
    exit 1
    ;;
  *)
    log "unexpected GitHub check state: $checks_state"
    exit 1
    ;;
esac

release_dir="$releases_dir/$revision"
stage_dir=""
previous_target=""
next_link="/srv/dreamboard/.current-next"
switch_armed=false

cleanup() {
  exit_status=$?
  trap - EXIT

  if [[ -n "$stage_dir" && -d "$stage_dir" ]]; then
    rm -rf --one-file-system "$stage_dir"
  fi

  rm -f "$next_link"

  if [[ "$switch_armed" == true && ! -f "$release_dir/.deployed" ]]; then
    active_target=""
    if [[ -L "$current_link" ]]; then
      active_target="$(readlink -f "$current_link")"
    fi

    if [[ "$active_target" == "$release_dir/dist" ]]; then
      if [[ -n "$previous_target" ]]; then
        ln -sfn "$previous_target" "$next_link"
        mv -Tf "$next_link" "$current_link"
        log "deployment interrupted; restored $previous_target"
      else
        rm -f "$current_link"
        log "initial deployment interrupted; removed the current link"
      fi
    fi

    if [[ -d "$release_dir" ]]; then
      rm -rf --one-file-system "$release_dir"
    fi
  fi

  exit "$exit_status"
}

trap cleanup EXIT

if [[ ! -d "$release_dir" ]]; then
  stage_dir="$(mktemp -d "$releases_dir/.staging-${revision}.XXXXXX")"
  git --git-dir="$repository_dir" archive "$revision" | tar -xf - -C "$stage_dir"

  docker run --rm \
    --network none \
    --volume "$stage_dir:/workspace" \
    --workdir /workspace \
    "$node_image" \
    node scripts/build-static.mjs

  test -s "$stage_dir/dist/index.html"
  test -d "$stage_dir/dist/src"

  symlink_path="$(find "$stage_dir/dist" -type l -print -quit)"
  if [[ -n "$symlink_path" ]]; then
    log "refusing to publish symlink: $symlink_path"
    exit 1
  fi

  printf '%s\n' "$revision" >"$stage_dir/dist/.revision"
  chmod 0755 "$stage_dir"
  find "$stage_dir/dist" -type d -exec chmod 0755 {} +
  find "$stage_dir/dist" -type f -exec chmod 0644 {} +

  mv "$stage_dir" "$release_dir"
  stage_dir=""
fi

if [[ -n "$current_release_dir" && -f "$current_release_dir/.deployed" ]]; then
  previous_target="$current_target"
fi

switch_armed=true
ln -sfn "$release_dir/dist" "$next_link"
mv -Tf "$next_link" "$current_link"

if ! curl --fail --silent --show-error \
  --resolve "dreamboard.ks-design.art:443:127.0.0.1" \
  "https://dreamboard.ks-design.art/" >/dev/null; then
  log "live smoke failed"
  exit 1
fi

touch "$release_dir/.deployed"
switch_armed=false
log "deployed $revision"

mapfile -t stale_releases < <(
  find "$releases_dir" -mindepth 1 -maxdepth 1 -type d \
    -name '[0-9a-f][0-9a-f]*' -exec test -f '{}/.deployed' \; \
    -printf '%T@ %p\n' \
    | sort -nr \
    | tail -n +11 \
    | cut -d' ' -f2-
)

for stale_release in "${stale_releases[@]}"; do
  if [[ "$stale_release" == "$releases_dir/"* && "$stale_release" != "$release_dir" ]]; then
    rm -rf --one-file-system "$stale_release"
  fi
done
