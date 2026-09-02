const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Dashboard.tsx', 'utf8');

if (!code.includes("import AdminHomeEditor from './AdminHomeEditor';")) {
  code = code.replace("import PagesCodeEditorAdmin from \"./PagesCodeEditorAdmin\";", "import PagesCodeEditorAdmin from \"./PagesCodeEditorAdmin\";\nimport AdminHomeEditor from './AdminHomeEditor';");
}

if (!code.includes("id: 'visual_editor'")) {
  code = code.replace(
    "{ id: 'pages_code_editor'",
    "{ id: 'visual_editor', icon: Eye, label: i18n.language === 'ar' ? 'المحرر المرئي الذكي' : 'Smart Visual Editor' },\n        { id: 'pages_code_editor'"
  );
}

if (!code.includes("activeTab === 'visual_editor'")) {
  code = code.replace(
    "{activeTab === 'pages_code_editor' && <PagesCodeEditorAdmin />}",
    "{activeTab === 'visual_editor' && <div className=\"h-[calc(100vh-4rem)] -m-4 sm:-m-6 lg:-m-8\"><AdminHomeEditor /></div>}\n            {activeTab === 'pages_code_editor' && <PagesCodeEditorAdmin />}"
  );
}

if(!code.includes("Eye,")) {
    code = code.replace("ExternalLink, Menu, X,", "ExternalLink, Menu, X, Eye,")
}

fs.writeFileSync('src/pages/admin/Dashboard.tsx', code);
