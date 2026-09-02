const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/const fs = fs;\n\s*const path = path;/g, '');
code = code.replace(/const crypto = crypto;/g, '');
fs.writeFileSync('server.ts', code);
