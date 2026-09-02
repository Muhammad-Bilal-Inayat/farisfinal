import fs from 'fs';

let content = fs.readFileSync('src/pages/admin/Dashboard.tsx', 'utf8');

// Add to sidebar items
content = content.replace(/\{ id: 'page_builder', icon: LayoutDashboard, label: i18n\.language === 'ar' \? 'منشئ الصفحات' : 'Page Builder' \},/, 
`{ id: 'page_builder', icon: LayoutDashboard, label: i18n.language === 'ar' ? 'منشئ الصفحات (قديم)' : 'Block Builder' },
        { id: 'visual_editor_link', icon: Monitor, label: i18n.language === 'ar' ? 'المحرر المرئي (جديد)' : 'Visual Editor' },`);

// When activeTab === 'visual_editor_link', we actually want to navigate to /admin/home-editor
content = content.replace(/setActiveTab\(item\.id\);/g, `
if (item.id === 'visual_editor_link') {
  window.location.href = '/admin/home-editor';
} else {
  setActiveTab(item.id);
}
`);

fs.writeFileSync('src/pages/admin/Dashboard.tsx', content);
console.log('Dashboard.tsx sidebar patched');
