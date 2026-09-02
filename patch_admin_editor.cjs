const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminHomeEditor.tsx', 'utf8');

if (!code.includes("const [currentPath, setCurrentPath]")) {
  code = code.replace(
    "const [device, setDevice] = useState<'desktop'|'tablet'|'mobile'>('desktop');",
    "const [device, setDevice] = useState<'desktop'|'tablet'|'mobile'>('desktop');\n  const [currentPath, setCurrentPath] = useState('/');"
  );
}

if (!code.includes("<select")) {
  // We need to find the toolbar where devices are toggled and add a page selector
  const toolbarRegex = /<div className="flex items-center gap-2">([\s\S]*?)<\/div>/;
  code = code.replace(
    '<div className="flex items-center gap-2">',
    `<div className="flex items-center gap-2">\n            <select value={currentPath} onChange={(e) => setCurrentPath(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500">\n              <option value="/">Home Page</option>\n              <option value="/about-us">About Us</option>\n              <option value="/vehicles">Fleet / Vehicles</option>\n              <option value="/routes-rates">Routes & Rates</option>\n              <option value="/booking">Booking Form</option>\n              <option value="/services">Services</option>\n              <option value="/ziyarat">Ziyarat</option>\n              <option value="/contact">Contact</option>\n            </select>\n            <div className="w-px h-6 bg-slate-200 mx-1"></div>`
  );
}

// update iframe src
code = code.replace(
  'src="/?visualEditor=true"',
  'src={`${currentPath}?visualEditor=true`}'
);

fs.writeFileSync('src/pages/admin/AdminHomeEditor.tsx', code);
