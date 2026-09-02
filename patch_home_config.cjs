const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const target = `  const parsedConfig = useMemo(() => {
    try {
      return homePageConfig ? JSON.parse(homePageConfig) : [];
    } catch {
      return [];
    }
  }, [homePageConfig]);`;

const replacement = `  const DEFAULT_LAYOUT = [
    { id: 'hero', enabled: true },
    { id: 'fleet_specs', enabled: true },
    { id: 'quick_routes', enabled: true },
    { id: 'routes', enabled: true },
    { id: 'vehicles', enabled: true },
    { id: 'ziyarat', enabled: true },
    { id: 'testimonials', enabled: true },
  ];

  const parsedConfig = useMemo(() => {
    try {
      let parsed = homePageConfig ? JSON.parse(homePageConfig) : [];
      if (parsed.length > 0) {
        DEFAULT_LAYOUT.forEach(def => {
          if (!parsed.find(p => p.id === def.id)) {
            parsed.push(def);
          }
        });
      }
      return parsed;
    } catch {
      return [];
    }
  }, [homePageConfig]);`;

code = code.replace(target, replacement);

fs.writeFileSync('src/pages/Home.tsx', code);
