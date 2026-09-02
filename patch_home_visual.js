import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

if (!content.includes('VisualText')) {
  content = `import { VisualText, VisualSection, VisualImage } from '../components/VisualElements';\n` + content;
  
  // Hero section replacements
  content = content.replace(/<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-4 lg:mb-6">([^<]+)<\/h1>/, `<VisualText as="h1" id="hero_title" className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-4 lg:mb-6">$1</VisualText>`);
  
  content = content.replace(/<p className="text-lg sm:text-xl md:text-2xl text-gray-100 font-medium mb-8 sm:mb-10 max-w-2xl leading-relaxed drop-shadow-sm">([^<]+)<\/p>/, `<VisualText as="p" id="hero_subtitle" className="text-lg sm:text-xl md:text-2xl text-gray-100 font-medium mb-8 sm:mb-10 max-w-2xl leading-relaxed drop-shadow-sm">$1</VisualText>`);
  
  content = content.replace(/<span className="text-xs uppercase font-bold tracking-\[0\.2em\] text-\[var\(--color-saudi-green\)\] block mb-1">\s*\{t\('premium_fleet'\)\}\s*<\/span>/, `<VisualText as="span" id="fleet_tag" className="text-xs uppercase font-bold tracking-[0.2em] text-[var(--color-saudi-green)] block mb-1">{t('premium_fleet')}</VisualText>`);
  
  content = content.replace(/<h2 className="text-2xl sm:text-3xl font-extrabold text-\[var\(--color-dark-charcoal\)\]">\s*\{t\('explore_fleet'\)\}\s*<\/h2>/, `<VisualText as="h2" id="fleet_title" className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark-charcoal)]">{t('explore_fleet')}</VisualText>`);
  
  content = content.replace(/<p className="mt-1\.5 text-sm text-\[var\(--color-dark-charcoal\)\]\/60 font-medium">\s*\{t\('fleet_subtitle'\)\}\s*<\/p>/, `<VisualText as="p" id="fleet_subtitle" className="mt-1.5 text-sm text-[var(--color-dark-charcoal)]/60 font-medium">{t('fleet_subtitle')}</VisualText>`);

  // Sections
  content = content.replace(/<section style=\{getSectionStyle\('hero', 1\)\} className="relative pt-3 pb-6 sm:pt-6 sm:pb-10 lg:pt-10 lg:pb-14 overflow-hidden flex items-center min-h-\[500px\] border-b border-gray-200\/70">/, `<VisualSection id="hero_section" style={getSectionStyle('hero', 1)} className="relative pt-3 pb-6 sm:pt-6 sm:pb-10 lg:pt-10 lg:pb-14 overflow-hidden flex items-center min-h-[500px] border-b border-gray-200/70">`);
  
  content = content.replace(/<\/section>\s*\{\/\* 2\. BOOKING WIDGET/, `</VisualSection>\n      {/* 2. BOOKING WIDGET`);
  
  content = content.replace(/<section style=\{getSectionStyle\('fleet_specs', 2\)\} className="py-8 md:py-12 bg-white border-b border-emerald-50">/, `<VisualSection id="fleet_specs_section" style={getSectionStyle('fleet_specs', 2)} className="py-8 md:py-12 bg-white border-b border-emerald-50">`);
  content = content.replace(/<\/section>\s*\{\/\* 4\. FIXED ROUTES/, `</VisualSection>\n      {/* 4. FIXED ROUTES`);
  
  content = content.replace(/<section style=\{getSectionStyle\('routes', 4\)\} className="py-8 md:py-12 bg-\[#F7F7F5\] border-b border-emerald-50">/, `<VisualSection id="routes_section" style={getSectionStyle('routes', 4)} className="py-8 md:py-12 bg-[#F7F7F5] border-b border-emerald-50">`);
  content = content.replace(/<\/section>\s*\{\/\* 5\. ZIYARAT/, `</VisualSection>\n      {/* 5. ZIYARAT`);
  
  content = content.replace(/<section style=\{getSectionStyle\('ziyarat', 5\)\} className="py-8 md:py-12 bg-white border-b border-emerald-50">/, `<VisualSection id="ziyarat_section" style={getSectionStyle('ziyarat', 5)} className="py-8 md:py-12 bg-white border-b border-emerald-50">`);
  content = content.replace(/<\/section>\s*\{\/\* 6\. FEATURED VEHICLES/, `</VisualSection>\n      {/* 6. FEATURED VEHICLES`);

  content = content.replace(/<section style=\{getSectionStyle\('vehicles', 6\)\} className="py-8 md:py-12 bg-white">/, `<VisualSection id="vehicles_section" style={getSectionStyle('vehicles', 6)} className="py-8 md:py-12 bg-white">`);
  content = content.replace(/<\/section>\s*\{\/\* 6\. WHY CHOOSE/, `</VisualSection>\n      {/* 6. WHY CHOOSE`);
  
  content = content.replace(/<section style=\{getSectionStyle\('testimonials', 7\)\} className="py-8 md:py-12 bg-\[#F7F7F5\] border-t border-emerald-50">/, `<VisualSection id="testimonials_section" style={getSectionStyle('testimonials', 7)} className="py-8 md:py-12 bg-[#F7F7F5] border-t border-emerald-50">`);
  content = content.replace(/<\/section>\s*\{getCustomBlocks\(\)\}/, `</VisualSection>\n      {getCustomBlocks()}`);
  
  fs.writeFileSync('src/pages/Home.tsx', content);
  console.log('Home.tsx visual elements injected.');
}
