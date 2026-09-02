import fs from 'fs';
let content = fs.readFileSync('src/main.tsx', 'utf8');
content = `import { VisualEditorProvider } from './components/VisualEditorContext';\n` + content;
content = content.replace(/<App \/>/, `<VisualEditorProvider isEditMode={new URLSearchParams(window.location.search).get('visualEditor') === 'true'}>\n            <App />\n          </VisualEditorProvider>`);
fs.writeFileSync('src/main.tsx', content);
console.log('Fixed main.tsx');
