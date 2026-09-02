const fs = require('fs');
let indexHtml = fs.readFileSync('index.html', 'utf8');

if (!indexHtml.includes('manifest.json')) {
  indexHtml = indexHtml.replace('</title>', '</title>\n    <link rel="manifest" href="/manifest.json" />');
  fs.writeFileSync('index.html', indexHtml);
  console.log('Manifest linked in index.html');
}

let indexCss = fs.readFileSync('src/index.css', 'utf8');
if (!indexCss.includes('fonts.googleapis.com')) {
  indexCss = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Cairo:wght@400;500;600;700;800&display=swap');\n` + indexCss;
  fs.writeFileSync('src/index.css', indexCss);
  console.log('Google Fonts imported in index.css with display=swap');
}
