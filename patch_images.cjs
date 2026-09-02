const fs = require('fs');

function optimizeFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/w=2000&q=85/g, 'w=1200&q=60&fm=webp');
  content = content.replace(/w=800&q=80/g, 'w=600&q=60&fm=webp');
  fs.writeFileSync(file, content);
}

optimizeFile('src/pages/Home.tsx');
optimizeFile('src/data/fleetRoutesData.ts');
console.log('Optimized Unsplash image URLs');
