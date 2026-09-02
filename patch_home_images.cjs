const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(/<ResponsiveImage\s+src="https:\/\/images\.unsplash\.com\/photo-1436491865332/g, '<ResponsiveImage width="1000" height="800" src="https://images.unsplash.com/photo-1436491865332');
code = code.replace(/<ResponsiveImage\s+src=\{\(parsedConfig && parsedConfig\.find\(\(s: any\) => s\.id === 'fleet_specs'\)\?\.image\) \|\| "https:\/\/images\.unsplash\.com\/photo-1618843479313/g, '<ResponsiveImage width="1000" height="800" src={(parsedConfig && parsedConfig.find((s: any) => s.id === "fleet_specs")?.image) || "https://images.unsplash.com/photo-1618843479313');
code = code.replace(/<ResponsiveImage\s+src="https:\/\/images\.unsplash\.com\/photo-1591604129939/g, '<ResponsiveImage width="1000" height="800" src="https://images.unsplash.com/photo-1591604129939');

fs.writeFileSync('src/pages/Home.tsx', code);
