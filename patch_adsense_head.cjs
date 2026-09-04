const fs = require('fs');
let content = fs.readFileSync('src/context/SiteSettingsContext.tsx', 'utf8');

const target = `          icon.setAttribute('href', '/uploads/logo.png');`;
const replacement = `          icon.setAttribute('href', '/uploads/logo.png');

          // Inject AdSense Code
          if (data.adsenseEnabled === 'true' && data.adsensePublisherId) {
            let existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
            if (!existingScript) {
              const script = document.createElement('script');
              script.async = true;
              script.src = \`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=\${data.adsensePublisherId}\`;
              script.crossOrigin = "anonymous";
              document.head.appendChild(script);
            }
          }`;

if (!content.includes('adsbygoogle.js')) {
  content = content.replace(target, replacement);
  
  // also add types to SiteSettings interface
  const interfaceTarget = `homePageConfig?: string;`;
  const interfaceReplace = `homePageConfig?: string;
  adsenseEnabled?: string;
  adsensePublisherId?: string;
  adsenseSandbox?: string;
  adsenseHeaderSlot?: string;
  adsenseArticleSlot?: string;
  adsenseSidebarSlot?: string;
  adsenseFooterSlot?: string;`;
  
  content = content.replace(interfaceTarget, interfaceReplace);

  fs.writeFileSync('src/context/SiteSettingsContext.tsx', content);
  console.log("Injected AdSense code into SiteSettingsContext");
}
