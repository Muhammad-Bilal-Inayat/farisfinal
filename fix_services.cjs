const fs = require('fs');
let content = fs.readFileSync('src/pages/Services.tsx', 'utf8');

if (!content.includes("import ResponsiveImage from '../components/ResponsiveImage';")) {
  content = content.replace("import React,", "import React,\nimport ResponsiveImage from '../components/ResponsiveImage';");
}

content = content.replace(
  /<img loading="lazy" decoding="async"\s*src=\{dest\.image\}\s*alt=\{isAr \? dest\.nameAr : dest\.nameEn\}\s*referrerPolicy="no-referrer"\s*className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"\s*\/>/g,
  '<ResponsiveImage src={dest.image} alt={isAr ? dest.nameAr : dest.nameEn} referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />'
);

content = content.replace(
  /<img loading="lazy" decoding="async"\s*src=\{service\.image\}\s*alt=\{service\.title\}\s*referrerPolicy="no-referrer"\s*className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"\s*\/>/g,
  '<ResponsiveImage src={service.image} alt={service.title} referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />'
);

fs.writeFileSync('src/pages/Services.tsx', content);
