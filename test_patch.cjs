const fs = require('fs');
let code = fs.readFileSync('src/pages/RoutesRates.tsx', 'utf8');

// We need to split the grid into 'selectedVehicle' and 'otherVehicles'
