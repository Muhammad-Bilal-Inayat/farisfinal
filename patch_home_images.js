import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Replace the hardcoded fleet specs image with dynamic config
content = content.replace(/<img\s*src="https:\/\/images\.unsplash\.com\/photo-1618843479313-40f8afb4b4d8\?auto=format\&fit=crop\&w=1000\&q=80"\s*alt="Executive Mercedes and Luxury VIP Cars"/g, `<img 
                  src={(parsedConfig && parsedConfig.find((s: any) => s.id === 'fleet_specs')?.image) || "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=80"} 
                  alt="Executive Mercedes and Luxury VIP Cars"`);

// Replace the hardcoded routes image with dynamic config
content = content.replace(/<img\s*src="https:\/\/images\.unsplash\.com\/photo-1502877338593-d286ae718eff\?auto=format\&fit=crop\&w=1000\&q=80"\s*alt="Makkah Clock Tower & Holy Mosque transfers"/g, `<img 
                  src={(parsedConfig && parsedConfig.find((s: any) => s.id === 'routes')?.image) || "https://images.unsplash.com/photo-1502877338593-d286ae718eff?auto=format&fit=crop&w=1000&q=80"} 
                  alt="Makkah Clock Tower & Holy Mosque transfers"`);

fs.writeFileSync('src/pages/Home.tsx', content);
console.log('Home.tsx images dynamic mapped');
