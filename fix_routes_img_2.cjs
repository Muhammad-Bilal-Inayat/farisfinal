const fs = require('fs');
let content = fs.readFileSync('src/pages/RoutesRates.tsx', 'utf8');

const target = `<img 
                      src={vehicle.image} 
                      alt={vehicle.name}
                      loading="lazy"
                      className="max-h-40 w-auto object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-md"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=400&q=60";
                      }}
                    />`;
const replacement = `<ResponsiveImage 
                      src={vehicle.image} 
                      alt={vehicle.name}
                      className="max-h-40 w-auto object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-md"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onError={(e: any) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=400&q=60";
                      }}
                    />`;

content = content.replace(target, replacement);
fs.writeFileSync('src/pages/RoutesRates.tsx', content);
