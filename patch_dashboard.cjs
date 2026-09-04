const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/Dashboard.tsx', 'utf8');

if (!content.includes("import CodingAdmin")) {
  content = content.replace(
    `import AdminGuideTab from './AdminGuideTab';`,
    `import AdminGuideTab from './AdminGuideTab';
import CodingAdmin from './CodingAdmin';
import DriverPerformanceAdmin from './DriverPerformanceAdmin';`
  );
}

if (!content.includes("{ id: 'coding', label:")) {
  // We need to add the menu items. Let's see how they are structured.
  const menuTarget = `    { id: 'settings', label: isAr ? 'الإعدادات' : 'Settings', icon: <Settings size={20} /> }`;
  const menuReplace = `    { id: 'settings', label: isAr ? 'الإعدادات' : 'Settings', icon: <Settings size={20} /> },
    { id: 'driver_performance', label: isAr ? 'أداء السائقين' : 'Driver Performance', icon: <UserCheck size={20} /> },
    { id: 'coding', label: isAr ? 'البرمجة' : 'Coding', icon: <Code size={20} /> }`;
  content = content.replace(menuTarget, menuReplace);
}

if (!content.includes("activeTab === 'coding'")) {
  // Add the components to the render switch
  const renderTarget = `{activeTab === 'settings' && <SettingsAdmin />}`;
  const renderReplace = `{activeTab === 'settings' && <SettingsAdmin />}
            {activeTab === 'coding' && <CodingAdmin />}
            {activeTab === 'driver_performance' && <DriverPerformanceAdmin />}`;
  content = content.replace(renderTarget, renderReplace);
}

fs.writeFileSync('src/pages/admin/Dashboard.tsx', content);
console.log("Dashboard patched");
