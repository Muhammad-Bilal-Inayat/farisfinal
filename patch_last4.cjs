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

updateLocation('masjid-qiblatayn', {
  lat: 24.4845,
  lng: 39.5785,
  imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Masjid_al-Qiblatayn.jpg'
});

updateLocation('seven-mosques', {
  lat: 24.4756,
  lng: 39.5931,
  imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Mosque_Salman_Al_farissi.jpg'
});

updateLocation('bir-ali', {
  lat: 24.4137,
  lng: 39.5439,
  imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Masjid-u-Shajarah_-_Abiar_Ali_Mosque_-_Miqats.jpg'
});

updateLocation('date-gardens', {
  lat: 24.4608,
  lng: 39.6053,
  imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Ripe_and_dry_dates_fruit_bunches.jpg'
});

// Also fix Haram Makkah because it's currently a broken HTML link
updateLocation('haram-makkah', {
  imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/The_Kaaba_during_Hajj_-_edited.jpg'
});

fs.writeFileSync('src/components/ZiyaratMap.tsx', code);
