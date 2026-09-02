const fs = require('fs');
let code = fs.readFileSync('src/components/ZiyaratMap.tsx', 'utf8');

function updateLocation(id, updates) {
  const regex = new RegExp(`(id:\\s*'${id}',[\\s\\S]*?)(highlightBadge:\\s*'.*?'\\s*})`, 'g');
  code = code.replace(regex, (match) => {
    let block = match;
    for (const [key, value] of Object.entries(updates)) {
      if (key === 'imageUrl') block = block.replace(/imageUrl:\s*'.*?'/, `imageUrl: '${value}'`);
    }
    return block;
  });
}

updateLocation('haram-makkah', {
  imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Edited_Great_Mosque_of_Mecca1_5-2019-ccsa4.0_%28cropped%29.jpg'
});

updateLocation('masjid-aisha', {
  imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Masjid_Aisha_Taneem_Makkah.jpg'
});

// Since Al-Masjid an-Nabawi 202302.jpg failed, I'll use a known good URL from Wikipedia.
updateLocation('masjid-nabawi', {
  imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Masjid_Nabawi._Medina%2C_Saudi_Arabia.jpg'
});

updateLocation('bir-ali', {
  imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Masjid_Dzulhulaifah_%28Umroh_Ramadhan_2023%29-1.jpg'
});

fs.writeFileSync('src/components/ZiyaratMap.tsx', code);
