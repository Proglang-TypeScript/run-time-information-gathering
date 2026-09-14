const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const target = process.argv[2];
if (!target) {
  console.error('Usage: bin/run TARGET.js [BLACKLIST.json]');
  process.exit(1);
}
const entry = fs.realpathSync(target);
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'jalangi-run-'));
const analyses = require('../analysis-files.json').flatMap(filename => ['--analysis', path.join(root, filename)]);
try {
  const args = [path.join(root, 'jalangi-command.cjs'), '--inlineIID', '--inlineSource', ...analyses];
  if (process.argv[3]) args.push('--blacklistedModules', fs.realpathSync(process.argv[3]));
  args.push(entry);
  const result = spawnSync(process.execPath, args, {stdio: 'inherit', env: {...process.env, TRACE_TARGET_ROOT: path.dirname(entry), TRACE_WORK_DIR: work}, timeout: 60000});
  if (result.error) console.error(result.error.message);
  process.exitCode = result.status ?? 1;
} finally {
  fs.rmSync(work, {recursive: true, force: true});
}
