const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const t1 = `<img loading="lazy" 
    src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1000&q=80" 
    alt="Jeddah Airport Transfers" 
    className="w-full h-72 sm:h-96 object-cover group-hover:scale-102 transition-transform duration-500" 
  />`;
const r1 = `<ResponsiveImage 
    src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1000&q=80" 
    alt="Jeddah Airport Transfers" 
    className="w-full h-72 sm:h-96 object-cover group-hover:scale-102 transition-transform duration-500" 
    sizes="(max-width: 768px) 100vw, 50vw"
  />`;
content = content.replace(t1, r1);

const t2 = `<img loading="lazy" 
                  src={(parsedConfig && parsedConfig.find((s: any) => s.id === 'fleet_specs')?.image) || "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=80"} 
                  alt="Executive Mercedes and Luxury VIP Cars" 
                  className="w-full h-72 sm:h-96 object-cover rounded-xl"
                />`;
const r2 = `<ResponsiveImage 
                  src={(parsedConfig && parsedConfig.find((s: any) => s.id === 'fleet_specs')?.image) || "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=80"} 
                  alt="Executive Mercedes and Luxury VIP Cars" 
                  className="w-full h-72 sm:h-96 object-cover rounded-xl"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />`;
content = content.replace(t2, r2);

const t3 = `<img loading="lazy" 
                  src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1000&q=80" 
                  alt="Al-Masjid an-Nabawi Madinah and Ziyarat holy sites" 
                  className="w-full h-72 sm:h-96 object-cover group-hover:scale-102 transition-transform duration-500" 
                />`;
const r3 = `<ResponsiveImage 
                  src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1000&q=80" 
                  alt="Al-Masjid an-Nabawi Madinah and Ziyarat holy sites" 
                  className="w-full h-72 sm:h-96 object-cover group-hover:scale-102 transition-transform duration-500" 
                  sizes="(max-width: 768px) 100vw, 50vw"
                />`;
content = content.replace(t3, r3);

fs.writeFileSync('src/pages/Home.tsx', content);
