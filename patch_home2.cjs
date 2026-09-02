const fs = require('fs');
let homeCode = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// replace booking_widget with quick_routes
homeCode = homeCode.replace(
  /<VisualSection id="booking_widget_section" style=\{getSectionStyle\('booking_widget', 3\)\} className="booking-widget-wrapper">/,
  `<VisualSection id="quick_routes_section" style={getSectionStyle('quick_routes', 3)} className="booking-widget-wrapper">`
);
fs.writeFileSync('src/pages/Home.tsx', homeCode);

let adminCode = fs.readFileSync('src/pages/admin/PageBuilderAdmin.tsx', 'utf8');
adminCode = adminCode.replace(
  /{ id: 'booking_widget', type: 'booking_widget', enabled: true, titleEn: 'Booking Widget \(Search\)', titleAr: 'محرك الحجز' },/,
  `{ id: 'quick_routes', type: 'quick_routes', enabled: true, titleEn: 'Quick Route Pills', titleAr: 'روابط المسارات السريعة' },`
);
fs.writeFileSync('src/pages/admin/PageBuilderAdmin.tsx', adminCode);

