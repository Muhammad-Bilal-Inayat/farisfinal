const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/DashboardHome.tsx', 'utf8');

code = code.replace(
  /tickFormatter=\{v => \`\$\{v\} SAR\`\}/,
  "tickFormatter={v => `${v} ${t('sar')}`}"
);

code = code.replace(
  /formatter=\{\(v: any\) => \[\`\$\{v\} SAR\`\, isAr \? 'الإيراد' : 'Revenue'\]\}/,
  "formatter={(v: any) => [`${v} ${t('sar')}`, isAr ? 'الإيراد' : 'Revenue']}"
);

code = code.replace(
  /\{b.price\} SAR/,
  "{b.price} {t('sar')}"
);

code = code.replace(
  /Price SAR/,
  "Price (SAR)"
);

code = code.replace(
  /revenue distribution in SAR/,
  "revenue distribution in SAR"
);

fs.writeFileSync('src/pages/admin/DashboardHome.tsx', code);
