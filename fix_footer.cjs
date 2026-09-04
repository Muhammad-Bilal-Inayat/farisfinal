const fs = require('fs');
let content = fs.readFileSync('src/components/Footer.tsx', 'utf8');
if (!content.includes('</>')) {
  content = content.replace('</footer>\n  );\n}', '</footer>\n    </>\n  );\n}');
  fs.writeFileSync('src/components/Footer.tsx', content);
  console.log("Fixed footer closing tag");
}
