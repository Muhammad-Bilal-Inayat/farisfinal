import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Replace the Range Rover image (Fleet Specs)
content = content.replace(/https:\/\/images.unsplash.com\/photo-1563720223185-11003d516935\?auto=format&fit=crop&w=1000&q=80/g, 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=80');

// Replace the Vegetables image (Transparent Rates / Airport Transfers)
content = content.replace(/https:\/\/images.unsplash.com\/photo-1542838132-92c53300491e\?auto=format&fit=crop&w=1000&q=80/g, 'https://images.unsplash.com/photo-1502877338593-d286ae718eff?auto=format&fit=crop&w=1000&q=80');

// Replace the mini floating car badge image
content = content.replace(/https:\/\/images.unsplash.com\/photo-1549317661-bd32c8ce0db2\?auto=format&fit=crop&w=200&q=80/g, 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=200&q=80');

fs.writeFileSync('src/pages/Home.tsx', content);
console.log('Images replaced.');
