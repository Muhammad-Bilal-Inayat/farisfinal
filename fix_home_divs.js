import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Vehicle cards
content = content.replace(/(<VisualDiv id={`vehicle_card_\$\{v\.id\}`}[^>]+>[\s\S]*?)<\/div>\s*\}\)\}/g, '$1</VisualDiv>\n            ))}');

// Feature cards
content = content.replace(/(<VisualDiv id={`feature_card_\$\{i\}`}[^>]+>[\s\S]*?)<\/div>\s*\}\)\}/g, '$1</VisualDiv>\n            ))}');

// Testimonial cards
content = content.replace(/(<VisualDiv id={`testimonial_card_\$\{i\}`}[^>]+>[\s\S]*?)<\/div>\s*\}\)\}/g, '$1</VisualDiv>\n            ))}');

fs.writeFileSync('src/pages/Home.tsx', content);
console.log('Fixed VisualDiv closing tags');
