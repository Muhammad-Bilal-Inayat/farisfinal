import fs from 'fs';

const path = './src/components/ZiyaratMap.tsx';
let content = fs.readFileSync(path, 'utf8');

const replacements = {
  'haram-makkah': 'https://images.unsplash.com/photo-1565552643982-2d18fa037e90?auto=format&fit=crop&w=800&q=80',
  'jabal-al-nour': 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=800&q=80',
  'jabal-thawr': 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=800&q=80',
  'mina-jamarat': 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80',
  'muzdalifah': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
  'mount-arafat': 'https://images.unsplash.com/photo-1608226065600-4740e7cb003b?auto=format&fit=crop&w=800&q=80',
  'masjid-aisha': 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80',
  'jannat-al-mualla': 'https://images.unsplash.com/photo-1565552643982-2d18fa037e90?auto=format&fit=crop&w=800&q=80',
  'masjid-nabawi': 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=800&q=80',
  'masjid-quba': 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80',
  'mount-uhud': 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=800&q=80',
  'masjid-qiblatayn': 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80',
  'seven-mosques': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
  'bir-ali': 'https://images.unsplash.com/photo-1608226065600-4740e7cb003b?auto=format&fit=crop&w=800&q=80',
  'date-gardens': 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=800&q=80',
};

for (const [id, url] of Object.entries(replacements)) {
  const regex = new RegExp(`(id:\\s*'${id}'[\\s\\S]*?imageUrl:\\s*')[^']+(')`);
  content = content.replace(regex, `$1${url}$2`);
}

fs.writeFileSync(path, content);
console.log('Updated ZiyaratMap.tsx');
