import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// I will just use regex to match all <VisualSection> and ensure they are closed with </VisualSection>
// Actually, it's easier to just put </VisualSection> where they belong.
// Let's replace the specific ones manually.
const sections = [
  'booking-widget-wrapper',
  'fleet_specs_section',
  'routes_section',
  'ziyarat_section',
  'vehicles_section',
  'testimonials_section'
];

// Let's replace ALL </section> with </VisualSection> EXCEPT the booking-widget-wrapper because it's a standard <section style={{ order: 3 }} className="booking-widget-wrapper"> ... </section>
// Wait, booking widget is standard <section>
// But my regex replaced `<section style={getSectionStyle(...)` with `<VisualSection id=...>`
// And the closing tags were left as `</section>`

content = content.replace(/<\/section>/g, '</VisualSection>');

// Now we fix the booking widget, which is:
// <section style={{ order: 3 }} className="booking-widget-wrapper">
// ...
// </VisualSection>
// We need to change that back to </section> OR just make booking widget a VisualSection too!
content = content.replace(/<section style=\{\{ order: 3 \}\} className="booking-widget-wrapper">/g, '<VisualSection id="booking_widget_section" style={{ order: 3 }} className="booking-widget-wrapper">');

// Also getCustomBlocks() returns <section>. Let's make it return <VisualSection> too.
content = content.replace(/<section key=\{s\.id\} style=\{\{ order/g, '<VisualSection id={`custom_${s.id}`} key={s.id} style={{ order');

fs.writeFileSync('src/pages/Home.tsx', content);
console.log('Fixed tags in Home.tsx');
