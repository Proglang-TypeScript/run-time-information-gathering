const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'tracer-smoke-'));
try {
  const entry = path.join(work, 'client.js');
  fs.writeFileSync(entry, 'function add(left, right) { return left + right; } add(1, 2);');
  const original = fs.readFileSync(entry, 'utf8');
  const analyses = require('../analysis-files.json').flatMap(filename => ['--analysis', path.join(root, filename)]);
  const result = spawnSync(process.execPath, [path.join(root, 'jalangi-command.cjs'), '--inlineIID', '--inlineSource', ...analyses, entry], {cwd: work, env: {...process.env, KAFKA_ENABLED: 'false', TRACE_TARGET_ROOT: work, TRACE_WORK_DIR: work}, encoding: 'utf8', timeout: 30000});
  assert.equal(result.status, 0, result.stderr);
  const trace = JSON.parse(result.stdout);
  assert.ok(Object.keys(trace).length > 0);
  assert.equal(fs.readFileSync(entry, 'utf8'), original);
  const offline = path.join(work, 'offline');
  const source = path.join(work, 'source');
  fs.mkdirSync(source);
  const standalone = path.join(source, 'standalone.js');
  fs.writeFileSync(standalone, 'const add = (left, right) => left + right; if (add(1, 2) !== 3) throw new Error("Wrong result");');
  const instrumentation = spawnSync(process.execPath, [path.join(root, 'scripts/instrument.cjs'), standalone, offline], {encoding: 'utf8', timeout: 30000});
  assert.equal(instrumentation.status, 0, instrumentation.stderr);
  const execution = spawnSync(process.execPath, [path.join(offline, 'standalone.js')], {encoding: 'utf8', timeout: 30000});
  assert.equal(execution.status, 0, execution.stderr);
  console.log('Genuine Jalangi calculator trace passes; original source unchanged.');
} finally {
  fs.rmSync(work, {recursive: true, force: true});
}
