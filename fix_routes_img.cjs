const fs = require('fs');
let content = fs.readFileSync('src/pages/RoutesRates.tsx', 'utf8');

// Replace all remaining <img ... /> with <ResponsiveImage ... /> if applicable
content = content.replace(/<img[^>]+src=\{vehicle\.image\}[^>]*\/>/g, '<ResponsiveImage src={vehicle.image} alt={vehicle.name} className="w-full h-auto max-h-36 object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-500" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />');

fs.writeFileSync('src/pages/RoutesRates.tsx', content);
