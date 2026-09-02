import fs from 'fs';

const path = './src/pages/Home.tsx';
let content = fs.readFileSync(path, 'utf8');

// makkah-tower image: 1591604129939-f1efa4d9f7fa -> 1565552643982-2d18fa037e90
content = content.replace(/https:\/\/images.unsplash.com\/photo-1591604129939-f1efa4d9f7fa/g, 'https://images.unsplash.com/photo-1565552643982-2d18fa037e90');

// madinah-towers image: 1564769625905-50e93615e769 -> 1591604129939-f1efa4d9f7fa
content = content.replace(/https:\/\/images.unsplash.com\/photo-1564769625905-50e93615e769/g, 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa');

// jeddah-airport image: 1542296332-2e4473faf563 -> keep or change to a car? Let's use a nice car: 1563720223185-11003d516935 (Luxury Mercedes interior or car)
content = content.replace(/https:\/\/images.unsplash.com\/photo-1542296332-2e4473faf563/g, 'https://images.unsplash.com/photo-1563720223185-11003d516935');

// makkah-skyline image: 1565552645632-d725f8bfc19a -> 1608226065600-4740e7cb003b (Quran/Mosque)
content = content.replace(/https:\/\/images.unsplash.com\/photo-1565552645632-d725f8bfc19a/g, 'https://images.unsplash.com/photo-1608226065600-4740e7cb003b');

// There's a 1506012787146-f92b2d7d6d96 in Home.tsx. Replace it with 1542838132-92c53300491e
content = content.replace(/1506012787146-f92b2d7d6d96/g, '1542838132-92c53300491e');

fs.writeFileSync(path, content);
console.log('Updated Home.tsx images');
