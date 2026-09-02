const fs = require('fs');
let content = fs.readFileSync('src/components/ZiyaratMap.tsx', 'utf8');

if (!content.includes("import ResponsiveImage from '../components/ResponsiveImage';")) {
  content = content.replace("import React,", "import React,\nimport ResponsiveImage from './ResponsiveImage';");
}

content = content.replace(
  /<img loading="lazy" decoding="async"\s*src=\{activeLocation\.imageUrl\}\s*alt=\{activeLocation\.name\}\s*className="w-full h-full object-cover"\s*\/>/g,
  '<ResponsiveImage src={activeLocation.imageUrl} alt={activeLocation.name} className="w-full h-full object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />'
);

fs.writeFileSync('src/components/ZiyaratMap.tsx', content);
