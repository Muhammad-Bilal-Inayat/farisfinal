import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Ensure imports
if (!content.includes('VisualDiv')) {
  content = content.replace(/import \{ VisualText, VisualSection, VisualImage \} from '\.\.\/components\/VisualElements';/, 
    "import { VisualText, VisualSection, VisualImage, VisualDiv } from '../components/VisualElements';");
}

// 1. Vehicle Cards
// <div key={v.id} className="bg-white rounded-xl ... group">
content = content.replace(/<div key=\{v\.id\} className="bg-white rounded-xl([^"]*)"/g, 
  `<VisualDiv id={\`vehicle_card_\${v.id}\`} key={v.id} className="bg-white rounded-xl$1"`);

// vehicle title
// <h3 className="text-base font-bold ...">{v.name}</h3>
content = content.replace(/<h3 className="text-base font-bold([^"]*)">\{v\.name\}<\/h3>/g, 
  `<VisualText as="h3" id={\`vehicle_title_\${v.id}\`} className="text-base font-bold$1">{v.name}</VisualText>`);

// 2. Testimonials
// <div key={i} className="bg-white p-5 rounded-xl shadow-xs border border-gray-200 relative group hover:border-\[var\(--color-luxury-gold\)\]\/40 transition-colors">
content = content.replace(/<div key=\{i\} className="bg-white p-5 rounded-xl shadow-xs border border-gray-200 relative group([^"]*)"/g,
  `<VisualDiv id={\`testimonial_card_\${i}\`} key={i} className="bg-white p-5 rounded-xl shadow-xs border border-gray-200 relative group$1"`);

// testimonial text
content = content.replace(/<p className="text-\[var\(--color-dark-charcoal\)\]\/80 leading-relaxed font-medium italic mb-4 text-xs">"\{review\.text\}"<\/p>/g,
  `<VisualText as="p" id={\`testimonial_text_\${i}\`} className="text-[var(--color-dark-charcoal)]/80 leading-relaxed font-medium italic mb-4 text-xs">"{review.text}"</VisualText>`);
  
// testimonial name
content = content.replace(/<h4 className="font-bold text-\[var\(--color-dark-charcoal\)\] text-xs">\{review\.customerName\}<\/h4>/g,
  `<VisualText as="h4" id={\`testimonial_name_\${i}\`} className="font-bold text-[var(--color-dark-charcoal)] text-xs">{review.customerName}</VisualText>`);

// 3. Features
// <div key={i} className="bg-white p-5 rounded-xl shadow-xs border border-gray-200 hover:shadow-md transition-shadow">
content = content.replace(/<div key=\{i\} className="bg-white p-5 rounded-xl shadow-xs border border-gray-200 hover:shadow-md transition-shadow">/g,
  `<VisualDiv id={\`feature_card_\${i}\`} key={i} className="bg-white p-5 rounded-xl shadow-xs border border-gray-200 hover:shadow-md transition-shadow">`);

content = content.replace(/<h3 className="text-sm font-bold mb-1\.5 text-\[var\(--color-dark-charcoal\)\]">\{feature\.title\}<\/h3>/g,
  `<VisualText as="h3" id={\`feature_title_\${i}\`} className="text-sm font-bold mb-1.5 text-[var(--color-dark-charcoal)]">{feature.title}</VisualText>`);

content = content.replace(/<p className="text-\[var\(--color-dark-charcoal\)\]\/70 leading-relaxed text-lg md:text-base font-medium">\{feature\.desc\}<\/p>/g,
  `<VisualText as="p" id={\`feature_desc_\${i}\`} className="text-[var(--color-dark-charcoal)]/70 leading-relaxed text-lg md:text-base font-medium">{feature.desc}</VisualText>`);

fs.writeFileSync('src/pages/Home.tsx', content);
console.log('Replaced more elements');
