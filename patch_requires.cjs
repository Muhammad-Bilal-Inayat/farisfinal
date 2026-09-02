const fs = require('fs');
const file = 'server.ts';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('import crypto from "crypto"')) {
  code = code.replace('import fs from "fs";', 'import fs from "fs";\nimport crypto from "crypto";\nimport sharp from "sharp";');
}

code = code.replace(/require\('path'\)/g, 'path');
code = code.replace(/require\('fs'\)/g, 'fs');
code = code.replace(/const fs = require\('fs'\);/g, '');
code = code.replace(/const path = require\('path'\);/g, '');
code = code.replace(/const sharp = require\('sharp'\);/g, '');
code = code.replace(/const crypto = require\('crypto'\);/g, '');

fs.writeFileSync(file, code);
