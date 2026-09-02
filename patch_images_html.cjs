const fs = require('fs');

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

content = content.replace(/<img\s+src={s\.image}/g, '<img loading="lazy" width="800" height="600" src={s.image}');
content = content.replace(/<img \n/g, '<img loading="lazy" \n');
// Also add loading="lazy" to VisualImage if they have it, actually wait, they use a custom component.
content = content.replace(/<VisualImage/g, '<VisualImage loading="lazy"');

fs.writeFileSync('src/pages/Home.tsx', content);
console.log('Patched Home.tsx images');
