import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Add homePageConfig to useSiteSettings
content = content.replace(/const { companyName, websiteDomain } = useSiteSettings\(\);/g, "const { companyName, websiteDomain, homePageConfig } = useSiteSettings();");

// Insert the helper function right after states
const hookCode = `
  const parsedConfig = React.useMemo(() => {
    try {
      return homePageConfig ? JSON.parse(homePageConfig) : [];
    } catch {
      return [];
    }
  }, [homePageConfig]);

  const getSectionStyle = (id: string, defaultOrder: number) => {
    if (!parsedConfig || parsedConfig.length === 0) return { order: defaultOrder };
    const section = parsedConfig.find((s: any) => s.id === id);
    if (!section) return { display: 'none' };
    if (!section.enabled) return { display: 'none' };
    const index = parsedConfig.findIndex((s: any) => s.id === id);
    return { order: index };
  };

  const getCustomBlocks = () => {
    if (!parsedConfig || parsedConfig.length === 0) return null;
    return parsedConfig.filter((s: any) => s.type === 'custom' && s.enabled).map((s: any, idx: number) => (
      <section key={s.id} style={{ order: parsedConfig.findIndex((x: any) => x.id === s.id) }} className="py-8 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={\`flex flex-col gap-8 \${s.image ? 'md:flex-row items-center' : ''}\`}>
            {s.image && (
              <div className="w-full md:w-1/2">
                <img src={s.image} alt={isAr ? s.titleAr : s.titleEn} className="w-full h-auto rounded-2xl shadow-lg" />
              </div>
            )}
            <div className={\`w-full \${s.image ? 'md:w-1/2' : ''}\`}>
               { (s.titleEn || s.titleAr) && <h2 className="text-3xl font-extrabold text-[var(--color-dark-charcoal)] mb-6">{isAr ? s.titleAr : s.titleEn}</h2> }
               { (s.contentEn || s.contentAr) && <div className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">{isAr ? s.contentAr : s.contentEn}</div> }
            </div>
          </div>
        </div>
      </section>
    ));
  };
`;

content = content.replace(/useEffect\(\(\) => \{\n    fetch\('\/api\/vehicles'\)/, hookCode + "\n  useEffect(() => {\n    fetch('/api/vehicles')");

// Also import React if it's missing (though it shouldn't be, I will just use React.useMemo which implies React is in scope)
// Home.tsx usually imports React.

// Now replace section classes and add styles
content = content.replace(/<section className="relative pt-3 pb-6 sm:pt-6 sm:pb-10 lg:pt-10 lg:pb-14 overflow-hidden flex items-center min-h-\[500px\] border-b border-gray-200\/70 order-1">/g, '<section style={getSectionStyle(\'hero\', 1)} className="relative pt-3 pb-6 sm:pt-6 sm:pb-10 lg:pt-10 lg:pb-14 overflow-hidden flex items-center min-h-[500px] border-b border-gray-200/70">');

content = content.replace(/<section className="order-3">/g, '<section style={{ order: 3 }} className="booking-widget-wrapper">');

content = content.replace(/<section className="py-8 md:py-12 bg-white border-b border-emerald-50 order-2">/g, '<section style={getSectionStyle(\'fleet_specs\', 2)} className="py-8 md:py-12 bg-white border-b border-emerald-50">');

content = content.replace(/<section className="py-8 md:py-12 bg-\[#F7F7F5\] border-b border-emerald-50 order-4">/g, '<section style={getSectionStyle(\'routes\', 4)} className="py-8 md:py-12 bg-[#F7F7F5] border-b border-emerald-50">');

content = content.replace(/<section className="py-8 md:py-12 bg-white border-b border-emerald-50 order-5">/g, '<section style={getSectionStyle(\'ziyarat\', 5)} className="py-8 md:py-12 bg-white border-b border-emerald-50">');

content = content.replace(/<section className="py-8 md:py-12 bg-white order-6">/g, '<section style={getSectionStyle(\'vehicles\', 6)} className="py-8 md:py-12 bg-white">');

content = content.replace(/<section className="py-8 md:py-12 bg-\[#F7F7F5\] border-t border-emerald-50 order-7">/g, '<section style={getSectionStyle(\'testimonials\', 7)} className="py-8 md:py-12 bg-[#F7F7F5] border-t border-emerald-50">');

// Add {getCustomBlocks()} before the closing </div> of the component.
// We can just append it before the Footer or at the end of the sections. Let's find </section> for testimonials and append it there.
content = content.replace(/<\/section>\s*<\/div>\s*\);\s*\}/, "</section>\n      {getCustomBlocks()}\n    </div>\n  );\n}");

fs.writeFileSync('src/pages/Home.tsx', content);
console.log('Home.tsx patched for dynamic config');
