const fs = require('fs');

let content = fs.readFileSync('vite.config.ts', 'utf8');

if (!content.includes('manualChunks')) {
  content = content.replace('build: {', `build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'lucide': ['lucide-react'],
            'motion': ['motion/react'],
            'i18n': ['i18next', 'react-i18next'],
          }
        }
      },`);
  fs.writeFileSync('vite.config.ts', content);
  console.log('Patched vite.config.ts');
}
