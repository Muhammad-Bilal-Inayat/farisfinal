const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/PageBuilderAdmin.tsx', 'utf8');

code = code.replace(
  /setSections\(JSON\.parse\(data\.homePageConfig\)\);/,
  `let parsed = JSON.parse(data.homePageConfig);
            DEFAULT_LAYOUT.forEach(def => {
              if (!parsed.find(p => p.id === def.id)) {
                parsed.push(def);
              }
            });
            setSections(parsed);`
);
fs.writeFileSync('src/pages/admin/PageBuilderAdmin.tsx', code);
