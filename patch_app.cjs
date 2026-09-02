const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/className="flex flex-col min-h-screen pb-20 md:pb-0"/g, 'className="flex flex-col min-h-screen pb-[90px] md:pb-0"');

fs.writeFileSync('src/App.tsx', code);
