import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// The h2 elements that need replacing
content = content.replace(/<h2 className="text-2xl sm:text-3xl font-extrabold text-\[var\(--color-dark-charcoal\)\] mb-3 leading-tight">\s*\{t\('makkah_tours_title'\)\}\s*<\/h2>/,
  `<VisualText as="h2" id="makkah_tours_title" className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark-charcoal)] mb-3 leading-tight">{t('makkah_tours_title')}</VisualText>`);

content = content.replace(/<p className="text-sm text-\[var\(--color-dark-charcoal\)\]\/70 leading-relaxed font-medium mb-5">\s*\{t\('makkah_tours_desc'\)\}\s*<\/p>/,
  `<VisualText as="p" id="makkah_tours_desc" className="text-sm text-[var(--color-dark-charcoal)]/70 leading-relaxed font-medium mb-5">{t('makkah_tours_desc')}</VisualText>`);

content = content.replace(/<span className="text-xs uppercase font-bold tracking-\[0\.2em\] text-\[var\(--color-saudi-green\)\] block mb-2">\s*\{t\('airport_transfers_tag'\)\}\s*<\/span>/,
  `<VisualText as="span" id="airport_transfers_tag" className="text-xs uppercase font-bold tracking-[0.2em] text-[var(--color-saudi-green)] block mb-2">{t('airport_transfers_tag')}</VisualText>`);

content = content.replace(/<h2 className="text-2xl sm:text-3xl font-extrabold text-\[var\(--color-dark-charcoal\)\] mb-3 leading-tight">\s*\{t\('jeddah_makkah_title'\)\}\s*<\/h2>/,
  `<VisualText as="h2" id="jeddah_makkah_title" className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark-charcoal)] mb-3 leading-tight">{t('jeddah_makkah_title')}</VisualText>`);

content = content.replace(/<p className="text-sm text-\[var\(--color-dark-charcoal\)\]\/70 leading-relaxed font-medium mb-5">\s*\{t\('jeddah_makkah_desc'\)\}\s*<\/p>/,
  `<VisualText as="p" id="jeddah_makkah_desc" className="text-sm text-[var(--color-dark-charcoal)]/70 leading-relaxed font-medium mb-5">{t('jeddah_makkah_desc')}</VisualText>`);

content = content.replace(/<span className="text-xs uppercase font-bold tracking-\[0\.2em\] text-\[var\(--color-saudi-green\)\] block mb-2">\s*\{t\('sacred_tours_tag'\)\}\s*<\/span>/,
  `<VisualText as="span" id="sacred_tours_tag" className="text-xs uppercase font-bold tracking-[0.2em] text-[var(--color-saudi-green)] block mb-2">{t('sacred_tours_tag')}</VisualText>`);

content = content.replace(/<h2 className="text-2xl sm:text-3xl font-extrabold text-\[var\(--color-dark-charcoal\)\] mb-3 leading-tight">\s*\{t\('madinah_ziyarat_title'\)\}\s*<\/h2>/,
  `<VisualText as="h2" id="madinah_ziyarat_title" className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark-charcoal)] mb-3 leading-tight">{t('madinah_ziyarat_title')}</VisualText>`);

content = content.replace(/<p className="text-sm text-\[var\(--color-dark-charcoal\)\]\/70 leading-relaxed font-medium mb-5">\s*\{t\('madinah_ziyarat_desc'\)\}\s*<\/p>/,
  `<VisualText as="p" id="madinah_ziyarat_desc" className="text-sm text-[var(--color-dark-charcoal)]/70 leading-relaxed font-medium mb-5">{t('madinah_ziyarat_desc')}</VisualText>`);

content = content.replace(/<h2 className="text-2xl sm:text-3xl font-bold text-\[var\(--color-dark-charcoal\)\]">\{t\('what_guests_say'\)\}<\/h2>/,
  `<VisualText as="h2" id="what_guests_say" className="text-2xl sm:text-3xl font-bold text-[var(--color-dark-charcoal)]">{t('what_guests_say')}</VisualText>`);

// Images for left/right split sections
// <img src="/makkah-clock-tower.jpg" ...
content = content.replace(/<img\s+src="\/makkah-clock-tower\.jpg"\s+alt="Makkah Clock Tower & Holy Mosque transfers"\s+className="([^"]+)"\s*\/>/,
  `<VisualImage id="makkah_clock_tower_img" src="/makkah-clock-tower.jpg" alt="Makkah Clock Tower & Holy Mosque transfers" className="$1" />`);

// <img src="/vip-mercedes.jpg" ...
content = content.replace(/<img\s+src="\/vip-mercedes\.jpg"\s+alt="VIP Mercedes Umrah Transport"\s+className="([^"]+)"\s*\/>/,
  `<VisualImage id="vip_mercedes_img" src="/vip-mercedes.jpg" alt="VIP Mercedes Umrah Transport" className="$1" />`);

// <img src="/madinah.jpg" ...
content = content.replace(/<img\s+src="\/madinah\.jpg"\s+alt="Madinah Prophet Mosque Ziyarat"\s+className="([^"]+)"\s*\/>/,
  `<VisualImage id="madinah_ziyarat_img" src="/madinah.jpg" alt="Madinah Prophet Mosque Ziyarat" className="$1" />`);

// Quick links for Buttons!
content = content.replace(/<Link \s*to="\/routes-rates"\s*className="([^"]+)"\s*>\s*\{t\('view_all_routes'\)\}\s*<\/Link>/g,
  `<VisualButton as={Link} id="view_all_routes_btn" to="/routes-rates" className="$1">{t('view_all_routes')}</VisualButton>`);

content = content.replace(/<Link \s*to="\/booking"\s*className="([^"]+)"\s*>\s*\{t\('book_transfer_now'\)\}\s*<\/Link>/g,
  `<VisualButton as={Link} id="book_transfer_now_btn" to="/booking" className="$1">{t('book_transfer_now')}</VisualButton>`);

content = content.replace(/<Link \s*to="\/ziyarat"\s*className="([^"]+)"\s*>\s*\{t\('explore_ziyarat'\)\}\s*<\/Link>/g,
  `<VisualButton as={Link} id="explore_ziyarat_btn" to="/ziyarat" className="$1">{t('explore_ziyarat')}</VisualButton>`);

fs.writeFileSync('src/pages/Home.tsx', content);
console.log('Converted more elements');
