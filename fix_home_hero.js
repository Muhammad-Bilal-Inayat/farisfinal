import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

content = content.replace(/<h1 className="text-2xl sm:text-4xl md:text-5xl font-black leading-\[1\.15\] text-white mb-2 sm:mb-3 tracking-tight">\s*\{t\('hero_title'\)\}\s*<\/h1>/g, 
  `<VisualText as="h1" id="hero_title" className="text-2xl sm:text-4xl md:text-5xl font-black leading-[1.15] text-white mb-2 sm:mb-3 tracking-tight">{t('hero_title')}</VisualText>`);

content = content.replace(/<p className="text-sm sm:text-lg text-gray-200 font-medium max-w-lg mb-6 sm:mb-8 leading-relaxed">\s*\{t\('hero_subtitle'\)\}\s*<\/p>/g,
  `<VisualText as="p" id="hero_subtitle" className="text-sm sm:text-lg text-gray-200 font-medium max-w-lg mb-6 sm:mb-8 leading-relaxed">{t('hero_subtitle')}</VisualText>`);

fs.writeFileSync('src/pages/Home.tsx', content);
console.log('Fixed hero visual text');
