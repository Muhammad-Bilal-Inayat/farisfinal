import fs from 'fs';

let content = fs.readFileSync('src/components/VisualEditorContext.tsx', 'utf8');

const replacement = `
  useEffect(() => {
    // Fetch initial overrides from server for ALL users (so public site sees them)
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.visualConfig) {
          try {
            setOverrides(JSON.parse(data.visualConfig));
          } catch(e) {}
        }
      });
      
    if (!isEditMode) return;
`;

content = content.replace(/useEffect\(\(\) => \{\n    if \(\!isEditMode\) return;/, replacement);

fs.writeFileSync('src/components/VisualEditorContext.tsx', content);
console.log('VisualEditorContext patched to fetch for public users');
