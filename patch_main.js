const fs = require('fs');
const content = fs.readFileSync('src/main.tsx', 'utf8');

const injection = `
// Detect stale Vite chunks or multiple React versions and force reload
window.addEventListener('error', (e) => {
  if (
    e.message.includes('Invalid hook call') ||
    e.message.includes("reading 'useContext'") ||
    e.message.includes("Cannot read properties of null (reading 'useState')") ||
    e.message.includes('Minified React error')
  ) {
    console.error('React version mismatch or stale chunk detected. Force reloading...');
    window.location.reload();
  }
});

window.addEventListener('unhandledrejection', (e) => {
  if (e.reason && e.reason.message && (e.reason.message.includes('Failed to fetch dynamically imported module') || e.reason.message.includes('Importing a module script failed'))) {
    console.error('Stale chunk detected. Force reloading...');
    window.location.reload();
  }
});
`;

if (!content.includes('window.addEventListener(\'error\'')) {
  const newContent = content.replace('// Initialize Service Worker', injection + '\n// Initialize Service Worker');
  fs.writeFileSync('src/main.tsx', newContent);
}
