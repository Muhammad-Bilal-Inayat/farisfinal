const fs = require('fs');
let code = fs.readFileSync('src/pages/RoutesRates.tsx', 'utf8');

// Replace the bad setTimeout at top level
code = code.replace(
  /const vehicleFromUrl = searchParams\.get\('vehicle'\);\s*if \(vehicleFromUrl\) \{\s*setTimeout\(\(\) => \{\s*const el = document\.getElementById\('vehicle-card-' \+ vehicleFromUrl\);\s*if \(el\) el\.scrollIntoView\(\{ behavior: 'smooth', block: 'center' \}\);\s*\}, 500\);\s*\}/,
  `const vehicleFromUrl = searchParams.get('vehicle');`
);

// Add it into the existing useEffect
code = code.replace(
  /if \(pillFromUrl\) \{\s*setSelectedPillId\(pillFromUrl\);\s*\}/,
  `if (pillFromUrl) {
      setSelectedPillId(pillFromUrl);
    }
    const vehicleFromUrl = searchParams.get('vehicle');
    if (vehicleFromUrl) {
      setTimeout(() => {
        const el = document.getElementById('vehicle-card-' + vehicleFromUrl);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }`
);

fs.writeFileSync('src/pages/RoutesRates.tsx', code);
