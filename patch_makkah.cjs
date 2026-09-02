const fs = require('fs');
let code = fs.readFileSync('src/components/ZiyaratMap.tsx', 'utf8');

// 1. Al-Masjid Al-Haram
code = code.replace(
  "lat: 21.4225,",
  "lat: 21.422487,"
);
code = code.replace(
  "lng: 39.8262,",
  "lng: 39.826206,"
);
// Image is already Kaaba, keep it.

// 2. Jabal Al-Nour
code = code.replace(
  "lat: 21.4578,",
  "lat: 21.457917,"
);
code = code.replace(
  "lng: 39.8594,",
  "lng: 39.859667,"
);
code = code.replace(
  "imageUrl: 'https://images.unsplash.com/photo-1519817914152-2a67e103cd58?auto=format&fit=crop&w=800&q=80',",
  "imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/57/Jabbal_An-Nour_%282024%29.jpg',"
);

// 3. Jabal Thawr
code = code.replace(
  "lat: 21.3764,",
  "lat: 21.3768,"
);
code = code.replace(
  "lng: 39.8492,",
  "lng: 39.8490,"
);
code = code.replace(
  "imageUrl: 'https://images.unsplash.com/photo-1588622156885-32e70cde5d27?auto=format&fit=crop&w=800&q=80',",
  "imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Jabele_thor_-_panoramio.jpg',"
);

// 4. Mina
code = code.replace(
  "lat: 21.4145,",
  "lat: 21.4146,"
);
code = code.replace(
  "lng: 39.8931,",
  "lng: 39.8933,"
);
code = code.replace(
  "imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',",
  "imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Mina_Overview.JPG',"
);

// 5. Muzdalifah
// lat 21.3892, lng 39.9325 is fine
code = code.replace(
  "imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',", // Note: The old code might have the same unsplash image reused
  "imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/35/Fajr_in_Muzdalifah.jpg',"
); // Wait, if there are multiple identical unsplash links, I need to be more precise.

fs.writeFileSync('patch_makkah.cjs', 'done');
