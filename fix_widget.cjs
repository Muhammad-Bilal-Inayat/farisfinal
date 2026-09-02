const fs = require('fs');
let content = fs.readFileSync('src/components/BookingWidget.tsx', 'utf8');

if (!content.includes("import ResponsiveImage from './ResponsiveImage';")) {
  content = content.replace("import React,", "import React,\nimport ResponsiveImage from './ResponsiveImage';");
}

content = content.replace(
  /<img loading="lazy" decoding="async"\s*src=\{selectedVehicleObj\.imageUrl \|\| getCarImage\(selectedVehicleObj\.name\)\}\s*alt=\{selectedVehicleObj\.name\}\s*className="w-full h-full object-cover"\s*\/>/g,
  '<ResponsiveImage src={selectedVehicleObj.imageUrl || getCarImage(selectedVehicleObj.name)} alt={selectedVehicleObj.name} className="w-full h-full object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />'
);

fs.writeFileSync('src/components/BookingWidget.tsx', content);
