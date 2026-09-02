import fs from 'fs';

const path = './src/pages/RoutesRates.tsx';
let content = fs.readFileSync(path, 'utf8');

// replace 1549399542-7e3f8b79c341 with 1549317661-bd32c8ce0db2
content = content.replace(/1549399542-7e3f8b79c341/g, '1549317661-bd32c8ce0db2');
// replace 1582293041079-7814c2f12063 with 1621007947382-bb3c399b52c5
content = content.replace(/1582293041079-7814c2f12063/g, '1621007947382-bb3c399b52c5');

fs.writeFileSync(path, content);
console.log('Updated RoutesRates.tsx images');
