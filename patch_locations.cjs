const fs = require('fs');
let code = fs.readFileSync('src/components/ZiyaratMap.tsx', 'utf8');

function updateLocation(id, updates) {
  const regex = new RegExp(`(id:\\s*'${id}',[\\s\\S]*?)(highlightBadge:\\s*'.*?'\\s*})`, 'g');
  code = code.replace(regex, (match) => {
    let block = match;
    for (const [key, value] of Object.entries(updates)) {
      if (key === 'lat') block = block.replace(/lat:\s*[0-9.-]+/, `lat: ${value}`);
      if (key === 'lng') block = block.replace(/lng:\s*[0-9.-]+/, `lng: ${value}`);
      if (key === 'imageUrl') block = block.replace(/imageUrl:\s*'.*?'/, `imageUrl: '${value}'`);
    }
    return block;
  });
}

// Ensure Haram Makkah is the Wiki image
updateLocation('haram-makkah', {
  lat: 21.422487,
  lng: 39.826206,
  imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Edited_Great_Mosque_of_Mecca1_5-2019-ccsa4.0_%28cropped%29.jpg'
});

// Aisha Mosque
updateLocation('masjid-aisha', {
  lat: 21.474444,
  lng: 39.787778,
  imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Masjid_Aisha_Taneem_Makkah.jpg' // I will replace this with the exact one from output
});

// Masjid Nabawi
updateLocation('masjid-nabawi', {
  lat: 24.4672,
  lng: 39.6111,
  imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Al-Masjid_an-Nabawi_202302.jpg'
});

// Bir Ali
updateLocation('bir-ali', {
  lat: 24.4144,
  lng: 39.5433,
  imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Masjid_Dzulhulaifah_%28Umroh_Ramadhan_2023%29-1.jpg'
});

fs.writeFileSync('src/components/ZiyaratMap.tsx', code);
