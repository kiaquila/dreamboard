# Plan 013: Dependabot Cooldown and Update Groups

## Approach

Update only `.github/dependabot.yml`. The two `updates` entries keep separate
group definitions because Dependabot groups version updates per ecosystem.

## Changes

1. Remove the three SemVer-specific cooldown keys from `github-actions` while
   preserving `default-days: 7`.
2. Add a `minor-and-patch` group under each ecosystem with
   `applies-to: version-updates` and `update-types` of `minor` and `patch`.
3. Record the supported cooldown and grouping policy in the DevOps playbook.
4. Add feature memory for the configuration change.

## Verification

- Parse `.github/dependabot.yml` as YAML.
- Assert the GitHub Actions entry has only `default-days` under `cooldown`.
- Assert each ecosystem has its own `minor-and-patch` group with only minor
  and patch update types.
- Run the repository preflight check.
