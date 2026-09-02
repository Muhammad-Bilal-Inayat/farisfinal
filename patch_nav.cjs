const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Dashboard.tsx', 'utf8');

// replace VehiclesAdmin import with ManageVehicles
code = code.replace("import VehiclesAdmin from './VehiclesAdmin';", "import ManageVehicles from './ManageVehicles';");

// replace the tab rendering
code = code.replace("{activeTab === 'vehicles' && <VehiclesAdmin />}", "{activeTab === 'vehicles' && <ManageVehicles />}");

fs.writeFileSync('src/pages/admin/Dashboard.tsx', code);
