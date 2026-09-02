const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/PageBuilderAdmin.tsx', 'utf8');

// Ensure that booking widget has an icon/title setup inside PageBuilderAdmin if there's any specialized rendering.
// Right now it just shows the titleEn / titleAr, which is fine.

