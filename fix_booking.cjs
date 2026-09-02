const fs = require('fs');
let content = fs.readFileSync('src/pages/Booking.tsx', 'utf8');

if (!content.includes("import ResponsiveImage from '../components/ResponsiveImage';")) {
  content = content.replace("import React,", "import React,\nimport ResponsiveImage from '../components/ResponsiveImage';");
}

content = content.replace(
  /<img loading="lazy" decoding="async"\s*src=\{vehicle\.imageUrl \|\| getCarImage\(vehicle\.name\)\}\s*alt=\{vehicle\.name\}\s*className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"\s*\/>/g,
  '<ResponsiveImage src={vehicle.imageUrl || getCarImage(vehicle.name)} alt={vehicle.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />'
);

fs.writeFileSync('src/pages/Booking.tsx', content);
