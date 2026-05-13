const fs = require('fs');
const path = require('path');
const glob = require('glob');

function listAssetFiles() {
  const assetDirs = [path.join(__dirname, '..', 'src', 'assets')];
  const exts = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'];
  const files = [];
  assetDirs.forEach((d) => {
    if (!fs.existsSync(d)) return;
    exts.forEach((ext) => {
      const matches = glob.sync(path.join(d, `**/*.${ext}`));
      files.push(...matches);
    });
  });
  return files;
}

function findReferences(filePath, rootDir) {
  const content = fs.readFileSync(filePath, 'utf8');
  return content;
}

function scan() {
  const root = path.join(__dirname, '..');
  const srcFiles = glob.sync(path.join(root, 'src', '**/*.{ts,tsx,js,jsx}'));
  const assets = listAssetFiles();

  const report = [];

  assets.forEach((asset) => {
    const fileName = path.basename(asset);
    const foundIn = [];
    srcFiles.forEach((sf) => {
      const content = fs.readFileSync(sf, 'utf8');
      if (content.includes(fileName) || content.includes(asset.replace(root + path.sep, ''))) {
        foundIn.push(sf.replace(root + path.sep, ''));
      }
    });
    if (foundIn.length === 0) {
      report.push({ asset: asset.replace(root + path.sep, ''), reason: 'unused' });
    }
  });

  if (report.length === 0) {
    console.log('No unused assets found.');
    return 0;
  }

  console.log('Unused assets:');
  report.forEach((r) => console.log('- ' + r.asset));
  return 0;
}

process.exitCode = scan();
