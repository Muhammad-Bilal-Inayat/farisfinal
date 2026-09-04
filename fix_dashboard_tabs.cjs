const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/Dashboard.tsx', 'utf8');

const targetMenu = `{ id: 'settings', icon: Settings, label: t('admin_settings') }`;
const replacementMenu = `{ id: 'settings', icon: Settings, label: t('admin_settings') },
        { id: 'driver_performance', icon: UserCheck, label: isAr ? 'أداء السائقين' : 'Driver Performance' },
        { id: 'coding', icon: Code, label: isAr ? 'البرمجة' : 'Coding' }`;

if (content.includes(targetMenu) && !content.includes("id: 'coding'")) {
  content = content.replace(targetMenu, replacementMenu);
  fs.writeFileSync('src/pages/admin/Dashboard.tsx', content);
  console.log("Added coding and driver tabs to sidebar");
} else {
  console.log("Could not find target menu or already added");
}
