const fs = require('fs');
let code = fs.readFileSync('src/utils/reportWebVitals.ts', 'utf8');
code = code.replace(/onFID/g, 'onINP');
fs.writeFileSync('src/utils/reportWebVitals.ts', code);
