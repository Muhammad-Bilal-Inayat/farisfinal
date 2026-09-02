const fs = require('fs');
let code = fs.readFileSync('src/components/Breadcrumbs.tsx', 'utf8');

// Ensure it's hidden on mobile
code = code.replace('className={`py-3 px-4 bg-gray-50 border-b border-gray-200 ${className}`}', 'className={`py-3 px-4 bg-gray-50 border-b border-gray-200 hidden md:block ${className}`}');

// Add SEO schema
const schemaInjection = `
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": t('home'),
        "item": window.location.origin + "/"
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.label,
        "item": item.path ? window.location.origin + item.path : window.location.href
      }))
    ]
  };

  return (
    <nav aria-label="Breadcrumb"`;

code = code.replace('return (\n    <nav aria-label="Breadcrumb"', schemaInjection);

// Add the script tag for JSON-LD inside the <nav> (or next to it)
code = code.replace('</nav>', '  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />\n    </nav>');

fs.writeFileSync('src/components/Breadcrumbs.tsx', code);
