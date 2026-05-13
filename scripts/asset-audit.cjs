const fs = require('fs');
const path = require('path');

function walkDir(dir, exts, out) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      walkDir(full, exts, out);
    } else if (e.isFile()) {
      const ext = path.extname(e.name).replace('.', '').toLowerCase();
      if (exts.includes(ext)) out.push(full);
    }
  }
}

function listAssetFiles() {
  const assetDirs = [path.join(__dirname, '..', 'src', 'assets')];
  const exts = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'];
  const files = [];
  assetDirs.forEach((d) => {
    if (!fs.existsSync(d)) return;
    walkDir(d, exts, files);
  });
  return files;
}

function listSourceFiles(root) {
  const exts = ['.ts', '.tsx', '.js', '.jsx'];
  const files = [];
  function walk(d) {
    const entries = fs.readdirSync(d, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) {
        walk(full);
      } else if (e.isFile() && exts.includes(path.extname(e.name))) {
        files.push(full);
      }
    }
  }
  walk(path.join(root, 'src'));
  return files;
}

function scan() {
  const root = path.join(__dirname, '..');
  const srcFiles = listSourceFiles(root);
  const assets = listAssetFiles();

  const report = [];

  assets.forEach((asset) => {
    const fileName = path.basename(asset);
    const rel = asset.replace(root + path.sep, '');
    let found = false;
    for (const sf of srcFiles) {
      const content = fs.readFileSync(sf, 'utf8');
      if (content.includes(fileName) || content.includes(rel)) {
        found = true;
        break;
      }
    }
    if (!found) report.push(rel);
  });

  if (report.length === 0) {
    console.log('No unused assets found.');
    return 0;
  }

  console.log('Unused assets:');
  report.forEach((r) => console.log('- ' + r));
  return 0;
}

process.exitCode = scan();
