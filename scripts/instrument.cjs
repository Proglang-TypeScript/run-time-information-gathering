const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
global.acorn = require('acorn-legacy');
global.esotope = require('esotope');
const vendor = path.resolve(__dirname, '../vendor/jalangi2');
require(path.join(vendor, 'src/js/headers')).headerSources.forEach(filename => require(path.join(vendor, filename)));
const source = fs.realpathSync(process.argv[2]);
const destination = path.resolve(process.argv[3]);
const directory = fs.statSync(source).isDirectory();
const root = directory ? source : path.dirname(source);
if (destination === root || destination.startsWith(root + path.sep)) throw new Error('Output must be outside the source directory');
fs.mkdirSync(destination, {recursive: true});
fs.cpSync(vendor, path.join(destination, '.jalangi'), {recursive: true});
function instrument(filename) {
  const relative = path.relative(root, filename);
  const output = path.join(destination, relative);
  fs.mkdirSync(path.dirname(output), {recursive: true});
  const sourceCode = fs.readFileSync(filename, 'utf8');
  const transformed = ts.transpileModule(sourceCode, {fileName: filename, compilerOptions: {target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS, sourceMap: true}});
  const result = J$.instrumentCode({code: transformed.outputText, isEval: false, origCodeFileName: filename, instCodeFileName: output, inlineSourceMap: true, inlineSource: true});
  const runtime = './' + path.relative(path.dirname(output), path.join(destination, '.jalangi')).split(path.sep).join('/');
  const bootstrap = `require(${JSON.stringify(runtime + '/src/js/headers')}).headerSources.forEach(filename => require(${JSON.stringify(runtime + '/')} + filename));\n`;
  fs.writeFileSync(output, bootstrap + result.code);
  fs.writeFileSync(output + '.map', transformed.sourceMapText);
}
function visit(current) {
  for (const entry of fs.readdirSync(current, {withFileTypes: true})) {
    if (entry.isSymbolicLink() || ['.git', 'node_modules'].includes(entry.name)) continue;
    const filename = path.join(current, entry.name);
    if (entry.isDirectory()) visit(filename);
    else if (entry.name.endsWith('.js')) instrument(filename);
  }
}
if (directory) visit(source);
else if (source.endsWith('.js')) instrument(source);
else throw new Error('The maintained offline profile supports JavaScript; HTML rewriting remains legacy-only');
