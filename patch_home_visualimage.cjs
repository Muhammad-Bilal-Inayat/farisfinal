const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(/<VisualImage loading="lazy" id=\{`vehicle_img_\$\{v\.id\}`\} src=\{getVehicleImage\(v\.name\)\}/g, '<VisualImage width="400" height="250" loading="lazy" id={`vehicle_img_${v.id}`} src={getVehicleImage(v.name)}');

fs.writeFileSync('src/pages/Home.tsx', code);
