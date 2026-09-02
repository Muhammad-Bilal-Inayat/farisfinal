const fs = require('fs');
let adminCode = fs.readFileSync('src/pages/admin/PageBuilderAdmin.tsx', 'utf8');

const oldArray = `const DEFAULT_LAYOUT: SectionConfig[] = [
  { id: 'quick_routes', type: 'quick_routes', enabled: true, titleEn: 'Quick Route Pills', titleAr: 'روابط المسارات السريعة' },
  { id: 'hero', type: 'hero', enabled: true, titleEn: 'Hero Slider', titleAr: 'سلايدر' },
  { id: 'fleet_specs', type: 'fleet_specs', enabled: true, titleEn: 'Fleet Specs (Image+Text)', titleAr: 'مواصفات الأسطول', image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=80' },
  { id: 'routes', type: 'routes', enabled: true, titleEn: 'Fixed Routes (Image+Rates)', titleAr: 'المسارات الثابتة', image: 'https://images.unsplash.com/photo-1502877338593-d286ae718eff?auto=format&fit=crop&w=1000&q=80' },
  { id: 'vehicles', type: 'vehicles', enabled: true, titleEn: 'Featured Vehicles Grid', titleAr: 'شبكة السيارات' },
  { id: 'ziyarat', type: 'ziyarat', enabled: true, titleEn: 'Ziyarat Previews', titleAr: 'المزارات' },
  { id: 'testimonials', type: 'testimonials', enabled: true, titleEn: 'Testimonials', titleAr: 'التوصيات' },
];`;

const newArray = `const DEFAULT_LAYOUT: SectionConfig[] = [
  { id: 'hero', type: 'hero', enabled: true, titleEn: 'Hero Slider', titleAr: 'سلايدر' },
  { id: 'fleet_specs', type: 'fleet_specs', enabled: true, titleEn: 'Fleet Specs (Image+Text)', titleAr: 'مواصفات الأسطول', image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=80' },
  { id: 'quick_routes', type: 'quick_routes', enabled: true, titleEn: 'Quick Route Pills', titleAr: 'روابط المسارات السريعة' },
  { id: 'routes', type: 'routes', enabled: true, titleEn: 'Fixed Routes (Image+Rates)', titleAr: 'المسارات الثابتة', image: 'https://images.unsplash.com/photo-1502877338593-d286ae718eff?auto=format&fit=crop&w=1000&q=80' },
  { id: 'vehicles', type: 'vehicles', enabled: true, titleEn: 'Featured Vehicles Grid', titleAr: 'شبكة السيارات' },
  { id: 'ziyarat', type: 'ziyarat', enabled: true, titleEn: 'Ziyarat Previews', titleAr: 'المزارات' },
  { id: 'testimonials', type: 'testimonials', enabled: true, titleEn: 'Testimonials', titleAr: 'التوصيات' },
];`;

adminCode = adminCode.replace(oldArray, newArray);
fs.writeFileSync('src/pages/admin/PageBuilderAdmin.tsx', adminCode);
