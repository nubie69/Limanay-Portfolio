import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';

const root = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const assets = new Set(['index.html', 'styles.css', 'script.js', 'favicon.svg']);
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
if (new Set(ids).size !== ids.length) throw new Error('Duplicate HTML IDs.');

for (const [, value] of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
  if (value.startsWith('#')) {
    if (value.length > 1 && !ids.includes(value.slice(1))) throw new Error(`Missing anchor: ${value}`);
  } else if (!/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(value)) {
    const local = decodeURIComponent(value.split(/[?#]/)[0]).replace(/^\.\//, '');
    if (local) assets.add(local);
  }
}
for (const [, value] of css.matchAll(/url\(['"]?([^'"\)]+)['"]?\)/g)) {
  if (!/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(value)) assets.add(decodeURIComponent(value));
}

for (const asset of assets) {
  const target = path.resolve(root, asset);
  if (!target.startsWith(root + path.sep)) throw new Error(`Asset outside project: ${asset}`);
  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) throw new Error(`Missing asset: ${asset}`);
  // Linux hosts require the exact letter case, even when building on Windows.
  let directory = root;
  for (const part of asset.split(/[\\/]/)) {
    if (!fs.readdirSync(directory).includes(part)) throw new Error(`Incorrect asset letter case: ${asset}`);
    directory = path.join(directory, part);
  }
}
new Script(fs.readFileSync(path.join(root, 'script.js'), 'utf8'), { filename: 'script.js' });
for (const [, inline] of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
  new Script(inline, { filename: 'inline script' });
}
if ((css.match(/\{/g) || []).length !== (css.match(/\}/g) || []).length) throw new Error('Unbalanced CSS rules.');
console.log(`Validated ${assets.size} website files, internal anchors, filename case, and JavaScript syntax.`);

if (!process.argv.includes('--check')) {
  const output = path.resolve(root, 'public');
  // Verify the cleanup target is the project's own output directory.
  if (path.dirname(output) !== root || path.basename(output) !== 'public') throw new Error('Unsafe output directory.');
  if (fs.existsSync(output)) {
    if (fs.lstatSync(output).isSymbolicLink() || fs.realpathSync(output) !== output) throw new Error('Output directory must not be a link.');
    fs.rmSync(output, { recursive: true });
  }
  for (const asset of assets) {
    const destination = path.join(output, asset);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(path.join(root, asset), destination);
  }
  fs.writeFileSync(path.join(output, '.nojekyll'), '');
  console.log('Deployment files are ready in public/.');
}
