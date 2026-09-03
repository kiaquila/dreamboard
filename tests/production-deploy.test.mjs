import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("Vercel keeps previews but does not deploy main", () => {
  const config = JSON.parse(read("vercel.json"));

  assert.equal(config.git.deploymentEnabled.main, false);
});

test("cz deployer is valid Bash and gates the merge revision", () => {
  const scriptPath = new URL("../deploy/cz/deploy.sh", import.meta.url);
  const syntax = spawnSync("bash", ["-n", fileURLToPath(scriptPath)], {
    encoding: "utf8",
  });
  const script = read("deploy/cz/deploy.sh");

  assert.equal(syntax.status, 0, syntax.stderr);
  assert.match(script, /refs\/heads\/main/);
  assert.match(script, /actions\/runs/);
  assert.match(script, /event=push/);
  assert.match(script, /head_sha=\$revision/);
  assert.match(script, /"CI": "\.github\/workflows\/ci\.yml"/);
  assert.match(script, /"OSV Scan": "\.github\/workflows\/osv-scan\.yml"/);
  assert.match(script, /run\.get\("event"\) == "push"/);
  assert.match(script, /run\.get\("head_branch"\) == "main"/);
  assert.match(script, /run\.get\("head_sha"\) == revision/);
  assert.match(script, /--network none/);
  assert.match(script, /find "\$stage_dir\/dist" -type l/);
  assert.match(script, /chmod 0755 "\$stage_dir"/);
  assert.match(script, /trap cleanup EXIT/);
  assert.match(script, /-f "\$current_release_dir\/\.deployed"/);
  assert.match(script, /switch_armed=true/);
  assert.match(script, /deployment interrupted; restored/);
  assert.match(script, /mv -Tf \"\$next_link\" \"\$current_link\"/);
  assert.match(script, /rm -rf --one-file-system "\$release_dir"/);
  assert.match(script, /touch "\$release_dir\/\.deployed"/);
});

test("cz Nginx host serves the canonical domain with the security baseline", () => {
  const nginx = read("deploy/cz/nginx.conf");

  assert.match(nginx, /server_name dreamboard\.ks-design\.art;/);
  assert.match(nginx, /listen 443 ssl http2;/);
  assert.match(nginx, /root \/srv\/dreamboard\/current;/);
  assert.match(nginx, /Content-Security-Policy/);
  assert.match(nginx, /Cache-Control "public, max-age=0, must-revalidate"/);
  assert.match(nginx, /Strict-Transport-Security/);
  assert.match(nginx, /X-Content-Type-Options/);
  assert.match(nginx, /try_files \$uri \$uri\/ \/index\.html;/);
});

test("cz deploy timer polls continuously without a resident runner", () => {
  const tmpfiles = read("deploy/cz/dreamboard.conf");
  const service = read("deploy/cz/dreamboard-deploy.service");
  const timer = read("deploy/cz/dreamboard-deploy.timer");

  assert.match(tmpfiles, /^d \/srv\/dreamboard 0755 root root -$/m);
  assert.match(service, /ExecStart=\/usr\/local\/sbin\/dreamboard-deploy/);
  assert.match(service, /ProtectSystem=strict/);
  assert.match(timer, /OnUnitActiveSec=1min/);
  assert.match(timer, /Persistent=true/);
});
