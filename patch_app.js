import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('VisualEditorProvider')) {
  content = `import { VisualEditorProvider } from './components/VisualEditorContext';\n` + content;
  
  // Find where Router is rendered
  content = content.replace(/<Router>/g, `<Router>\n      <VisualEditorProvider isEditMode={new URLSearchParams(window.location.search).get('visualEditor') === 'true'}>`);
  content = content.replace(/<\/Router>/g, `      </VisualEditorProvider>\n    </Router>`);
}

if (!content.includes('AdminHomeEditor')) {
  content = `import AdminHomeEditor from './pages/admin/AdminHomeEditor';\n` + content;
  content = content.replace(/<Route path="\/admin" element={<AdminDashboard \/>} \/>/, `<Route path="/admin" element={<AdminDashboard />} />\n          <Route path="/admin/home-editor" element={<AdminHomeEditor />} />`);
}

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx patched for visual editor');
