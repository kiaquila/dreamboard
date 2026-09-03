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
  assert.match(script, /baseline-checks/);
  assert.match(script, /osv-scan/);
  assert.match(script, /--network none/);
  assert.match(script, /mv -Tf \"\$next_link\" \"\$current_link\"/);
});

test("cz Nginx host serves the canonical domain with the security baseline", () => {
  const nginx = read("deploy/cz/nginx.conf");

  assert.match(nginx, /server_name dreamboard\.ks-design\.art;/);
  assert.match(nginx, /root \/srv\/dreamboard\/current;/);
  assert.match(nginx, /Content-Security-Policy/);
  assert.match(nginx, /Cache-Control "public, max-age=0, must-revalidate"/);
  assert.match(nginx, /Strict-Transport-Security/);
  assert.match(nginx, /X-Content-Type-Options/);
  assert.match(nginx, /try_files \$uri \$uri\/ \/index\.html;/);
});

test("cz deploy timer polls continuously without a resident runner", () => {
  const service = read("deploy/cz/dreamboard-deploy.service");
  const timer = read("deploy/cz/dreamboard-deploy.timer");

  assert.match(service, /ExecStart=\/usr\/local\/sbin\/dreamboard-deploy/);
  assert.match(service, /ProtectSystem=strict/);
  assert.match(timer, /OnUnitActiveSec=1min/);
  assert.match(timer, /Persistent=true/);
});
