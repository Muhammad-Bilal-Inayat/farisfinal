const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Change the image link from /booking to /routes-rates
code = code.replace(
  /<Link to=\{\`\/booking\?vehicle=\$\{v\.id\}\`\} className="block aspect-\[16\/10\] relative overflow-hidden bg-gray-100 cursor-pointer">/g,
  `<Link to={\`/routes-rates?vehicle=\${v.id}\`} className="block aspect-[16/10] relative overflow-hidden bg-gray-100 cursor-pointer">`
);

fs.writeFileSync('src/pages/Home.tsx', code);
