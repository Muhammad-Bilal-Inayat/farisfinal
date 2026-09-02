const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/PageBuilderAdmin.tsx', 'utf8');

if (!code.includes("id: 'booking_widget'")) {
  code = code.replace(
    /const DEFAULT_LAYOUT: SectionConfig\[\] = \[/,
    `const DEFAULT_LAYOUT: SectionConfig[] = [\n  { id: 'booking_widget', type: 'booking_widget', enabled: true, titleEn: 'Booking Widget (Search)', titleAr: 'محرك الحجز' },`
  );
  fs.writeFileSync('src/pages/admin/PageBuilderAdmin.tsx', code);
}
