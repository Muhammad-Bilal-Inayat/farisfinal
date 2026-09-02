const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const missingAlts = [];

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
    const content = fs.readFileSync(filePath, 'utf8');
    // regex to find img or VisualImage tags
    const regex = /<(img|VisualImage)([^>]*?)>/g;
    let match;
    let count = 0;
    while ((match = regex.exec(content)) !== null) {
      const tagContent = match[2];
      if (!tagContent.includes('alt=')) {
        missingAlts.push({ file: filePath, match: match[0] });
        count++;
      }
    }
  }
});

console.log(JSON.stringify(missingAlts, null, 2));
