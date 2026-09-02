const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace("import ScrollToTop from './components/ScrollToTop';", "import ScrollToTop from './components/ScrollToTop';\nimport TopProgressBar from './components/TopProgressBar';");

code = code.replace("<ScrollToTop />", "<ScrollToTop />\n      <TopProgressBar />");

fs.writeFileSync('src/App.tsx', code);
