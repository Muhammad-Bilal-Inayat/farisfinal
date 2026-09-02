const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/RatesAdmin.tsx', 'utf8');

code = code.replace(
  "if (resR.ok) setRates(await resR.json());\n      if (resV.ok) setVehicles(await resV.json());\n      if (resRoutes.ok) setRoutes(await resRoutes.json());",
  "if (resR.ok) { const d = await resR.json(); setRates(Array.isArray(d) ? d : []); }\n      if (resV.ok) { const d = await resV.json(); setVehicles(Array.isArray(d) ? d : []); }\n      if (resRoutes.ok) { const d = await resRoutes.json(); setRoutes(Array.isArray(d) ? d : []); }"
);

fs.writeFileSync('src/pages/admin/RatesAdmin.tsx', code);
