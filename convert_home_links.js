import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Ensure VisualButton import
if (!content.includes('VisualButton')) {
  content = content.replace(/VisualDiv \} from '\.\.\/components\/VisualElements';/, 
    "VisualDiv, VisualButton } from '../components/VisualElements';");
}

// 1. WhatsApp Button in Vehicle Card
// <a href={`https://wa.me/...`} ... className="..."><PhoneCall size={14} /></a>
content = content.replace(/<a \s*href=\{`https:\/\/wa\.me([^`]+)`\}\s*target="_blank"\s*rel="noopener noreferrer"\s*className="text-lg md:text-base font-bold text-white bg-\[var\(--color-saudi-green\)\] hover:bg-\[var\(--color-saudi-emerald\)\] px-3 py-1\.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm"\s*aria-label="Book via WhatsApp"\s*>\s*<PhoneCall size=\{14\} \/>\s*<\/a>/g,
  `<VisualButton as="a" id={\`vehicle_wa_\${v.id}\`} href={\`https://wa.me$1\`} target="_blank" rel="noopener noreferrer" className="text-lg md:text-base font-bold text-white bg-[var(--color-saudi-green)] hover:bg-[var(--color-saudi-emerald)] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm" aria-label="Book via WhatsApp"><PhoneCall size={14} /></VisualButton>`);

// 2. Book Now Link in Vehicle Card
// <Link to={`/booking?vehicle=${v.id}`} className="..."> {t('book_now')} <span className="rtl:rotate-180">➔</span> </Link>
content = content.replace(/<Link \s*to=\{`\/booking\?vehicle=\$\{v\.id\}`\}\s*className="([^"]+)"\s*>\s*\{t\('book_now'\)\} <span className="rtl:rotate-180">➔<\/span>\s*<\/Link>/g,
  `<VisualButton as={Link} id={\`vehicle_book_\${v.id}\`} to={\`/booking?vehicle=\${v.id}\`} className="$1">{t('book_now')} <span className="rtl:rotate-180">➔</span></VisualButton>`);

// 3. View Full Fleet Button
content = content.replace(/<Link to="\/vehicles" className="inline-block bg-\[var\(--color-saudi-green\)\] text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-\[var\(--color-saudi-emerald\)\] transition-colors shadow-md">\s*\{t\('view_full_fleet'\)\}\s*<\/Link>/,
  `<VisualButton as={Link} id="view_full_fleet_btn" to="/vehicles" className="inline-block bg-[var(--color-saudi-green)] text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[var(--color-saudi-emerald)] transition-colors shadow-md">{t('view_full_fleet')}</VisualButton>`);

// Let's check Images!
content = content.replace(/<img \s*src=\{getVehicleImage\(v\.name\)\}\s*alt=\{v\.name\}\s*className="([^"]+)"\s*\/>/g,
  `<VisualImage id={\`vehicle_img_\${v.id}\`} src={getVehicleImage(v.name)} alt={v.name} className="$1" />`);

fs.writeFileSync('src/pages/Home.tsx', content);
console.log('Replaced links and images in Home.tsx');
