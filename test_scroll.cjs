const fs = require('fs');
let code = fs.readFileSync('src/pages/RoutesRates.tsx', 'utf8');

// The original code has scroll logic inside useEffect:
// if (vehicleFromUrl) { setTimeout(() => { const el = document.getElementById('vehicle-card-' + vehicleFromUrl); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 500); }
// Let's remove it because we're showing the selected vehicle at the very top. So it doesn't need to scroll down.

code = code.replace(
  /if \(vehicleFromUrl\) \{\s*setTimeout\(\(\) => \{\s*const el = document\.getElementById\('vehicle-card-' \+ vehicleFromUrl\);\s*if \(el\) el\.scrollIntoView\(\{ behavior: 'smooth', block: 'center' \}\);\s*\}, 500\);\s*\}/,
  `// Scroll removed because selected vehicle is shown at top`
);

fs.writeFileSync('src/pages/RoutesRates.tsx', code);
