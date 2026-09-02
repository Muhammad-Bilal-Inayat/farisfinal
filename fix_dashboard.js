import fs from 'fs';
let content = fs.readFileSync('src/pages/admin/Dashboard.tsx', 'utf8');

// The messed up lines:
// {activeTab === 'settings' {activeTab === 'settings' && <SettingsAdmin />}{activeTab === 'settings' && <SettingsAdmin />} <SettingsAdmin />}
// {activeTab === 'page_builder' {activeTab === 'settings' && <SettingsAdmin />}{activeTab === 'settings' && <SettingsAdmin />} <PageBuilderAdmin />}

content = content.replace(/\{activeTab === 'settings'[^<]+<SettingsAdmin \/>\}[^<]+<SettingsAdmin \/>\} <SettingsAdmin \/>\}/g, "{activeTab === 'settings' && <SettingsAdmin />}");
content = content.replace(/\{activeTab === 'page_builder'[^<]+<SettingsAdmin \/>\}[^<]+<SettingsAdmin \/>\} <PageBuilderAdmin \/>\}/g, "{activeTab === 'page_builder' && <PageBuilderAdmin />}");

// Actually, let's just do a brutal replace of the whole block.
content = content.replace(/\{activeTab === 'settings'[^]*?<PageBuilderAdmin \/>\}/g, 
  "{activeTab === 'settings' && <SettingsAdmin />}\n            {activeTab === 'page_builder' && <PageBuilderAdmin />}");

fs.writeFileSync('src/pages/admin/Dashboard.tsx', content);
console.log('Fixed Dashboard.tsx');
