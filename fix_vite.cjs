const fs = require('fs');
let content = fs.readFileSync('vite.config.ts', 'utf8');
content = content.replace(/manualChunks: \{[^\}]+\}/, 'manualChunks: undefined');
fs.writeFileSync('vite.config.ts', content);
