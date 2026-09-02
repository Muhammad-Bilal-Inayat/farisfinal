const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/VehiclesAdmin.tsx', 'utf8');

code = code.replace(
  ".then(data => { setVehicles(data); setLoading(false); })",
  ".then(data => { setVehicles(Array.isArray(data) ? data : []); setLoading(false); })"
);

fs.writeFileSync('src/pages/admin/VehiclesAdmin.tsx', code);
