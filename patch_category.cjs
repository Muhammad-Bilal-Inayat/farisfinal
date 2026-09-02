const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageVehicles.tsx', 'utf8');

code = code.replace(
  /<option value="Executive Sedan">Executive Sedan<\/option>[\s\S]*?<option value="First Class Limousine">First Class Limousine<\/option>/,
  `<option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="luxury">Luxury / VIP</option>
                    <option value="van">Van</option>
                    <option value="bus">Bus</option>`
);

fs.writeFileSync('src/pages/admin/ManageVehicles.tsx', code);
