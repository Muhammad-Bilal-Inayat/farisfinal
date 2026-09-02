const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // very basic check: find "useSomething("
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    if (line.match(/\buse[A-Z]\w*\(/)) {
       // if it's inside a function component, it's fine. We can just print it.
       console.log(`${file}:${i+1}: ${line.trim()}`);
    }
  });
});
console.log("Done");
