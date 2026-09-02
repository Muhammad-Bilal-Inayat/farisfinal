const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/BookingsAdmin.tsx', 'utf8');

code = code.replace(
  "if (bRes.ok) setBookings(await bRes.json());\n      if (vRes.ok) setVehicles(await vRes.json());",
  "if (bRes.ok) { const d = await bRes.json(); setBookings(Array.isArray(d) ? d : []); }\n      if (vRes.ok) { const d = await vRes.json(); setVehicles(Array.isArray(d) ? d : []); }"
);

fs.writeFileSync('src/pages/admin/BookingsAdmin.tsx', code);
