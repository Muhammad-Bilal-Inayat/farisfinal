const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/PagesCodeEditorAdmin.tsx', 'utf8');

// 1. Add Icons and hooks
code = code.replace("import { Save, RefreshCw, LayoutTemplate, Palette, FileCode, Search, Code2, CheckCircle2, Globe, Monitor, Tablet, Smartphone } from 'lucide-react';", "import { Save, RefreshCw, LayoutTemplate, Palette, FileCode, Search, Code2, CheckCircle2, Globe, Monitor, Tablet, Smartphone, AlertTriangle } from 'lucide-react';");

// 2. Add state for raw source
code = code.replace("const [previewKey, setPreviewKey] = useState(0);", 
`const [previewKey, setPreviewKey] = useState(0);
  const [reactSourceCode, setReactSourceCode] = useState('');
  const [loadingSource, setLoadingSource] = useState(false);`);

// 3. Add mapping and fetch/save functions
const fetchSaveFunctions = `
  const PAGE_FILE_MAP: Record<string, string> = {
    'home': 'Home.tsx',
    'about': 'About.tsx',
    'vehicles': 'Vehicles.tsx',
    'routes_rates': 'RoutesRates.tsx',
    'services': 'Services.tsx',
    'ziyarat': 'Ziyarat.tsx',
    'faq': 'Faq.tsx',
    'contact': 'Contact.tsx',
    'terms': 'Terms.tsx',
    'privacy': 'Privacy.tsx',
    'booking': 'Booking.tsx'
  };

  const fetchReactSource = async (key: string) => {
    const filename = PAGE_FILE_MAP[key];
    if (!filename) return;
    setLoadingSource(true);
    setReactSourceCode('');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(\`/api/admin/source/\${filename}\`, { headers: { 'Authorization': \`Bearer \${token}\` } });
      const data = await res.json();
      if (data.content) {
        setReactSourceCode(data.content);
      }
    } catch (e) {
      console.error("Error fetching source", e);
    } finally {
      setLoadingSource(false);
    }
  };

  const saveReactSource = async () => {
    const filename = PAGE_FILE_MAP[selectedPageItem.key];
    if (!filename) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(\`/api/admin/source/\${filename}\`, {
        method: 'POST',
        headers: { 'Authorization': \`Bearer \${token}\`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: reactSourceCode })
      });
      const data = await res.json();
      if (data.success) {
        alert(isAr ? 'تم حفظ التعديلات بنجاح. قد تتطلب التغييرات إعادة بناء الموقع.' : 'Source code saved successfully. Changes may require a rebuild in production.');
      } else {
        alert("Error saving: " + data.error);
      }
    } catch (e) {
      console.error(e);
      alert("Network error while saving.");
    } finally {
      setSaving(false);
    }
  };
`;

code = code.replace("const handleSaveCurrentPage = async () => {", fetchSaveFunctions + "\n  const handleSaveCurrentPage = async () => {");

// 4. Modify handleSave function call at the bottom
code = code.replace(`onClick={handleSaveCurrentPage}
                  disabled={saving}`, 
`onClick={() => activeEditorTab === 'react_source' ? saveReactSource() : handleSaveCurrentPage()}
                  disabled={saving}`);

// 5. Add button to select 'react_source'
const tabButtonHtml = `                      <button
                        onClick={() => { setActiveEditorTab('preview'); setPreviewKey(k => k + 1); }}
                        className={\`px-4 py-2 text-xs font-bold whitespace-nowrap rounded-lg flex items-center gap-2 transition-all \${
                          activeEditorTab === 'preview' ? 'bg-[var(--color-saudi-green)] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                        }\`}
                      >
                        <Monitor size={15} />
                        {isAr ? 'معاينة مباشرة' : 'Live Preview'}
                      </button>
                      <button
                        onClick={() => { setActiveEditorTab('react_source'); fetchReactSource(selectedPageItem.key); }}
                        className={\`px-4 py-2 text-xs font-bold whitespace-nowrap rounded-lg flex items-center gap-2 transition-all \${
                          activeEditorTab === 'react_source' ? 'bg-red-50 text-red-700 shadow-sm border border-red-200' : 'text-slate-600 hover:bg-slate-100'
                        }\`}
                      >
                        <Code2 size={15} />
                        {isAr ? 'كود React الأصلي (متقدم)' : 'Raw React Code'}
                      </button>`;

code = code.replace(/<button[^>]*onClick={\(\) => \{ setActiveEditorTab\('preview'\);[^}]*\}[^>]*>[\s\S]*?Live Preview'\}[\s\S]*?<\/button>/, tabButtonHtml);

// 6. Add React Source rendering block
const reactSourceBlock = `              {/* TAB 6: REACT SOURCE CODE */}
              {activeEditorTab === 'react_source' && (
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 text-xs shadow-inner">
                    <AlertTriangle size={20} className="shrink-0 mt-0.5 text-red-600" />
                    <div className="space-y-1">
                      <p className="font-bold text-sm">{isAr ? 'تحذير (وضع المطورين المتقدم):' : 'Warning (Advanced Developer Mode):'}</p>
                      <p>
                        {isAr 
                          ? 'أنت الآن تقوم بتعديل كود المصدر الأساسي للصفحة (React/TypeScript). أي خطأ إملائي سيؤدي إلى تعطل النظام. في بيئات الإنتاج، قد يتم فقدان هذه التعديلات عند إعادة تشغيل الخادم ما لم يتم حفظها في مستودع الكود.' 
                          : 'You are directly editing the raw React/TypeScript source files. Syntax errors will crash the application build. In a serverless production environment (like Cloud Run), these changes may be lost on container restart unless committed to the repository.'}
                      </p>
                    </div>
                  </div>
                  {loadingSource ? (
                    <div className="text-center p-10 text-slate-500 font-medium">Loading source code...</div>
                  ) : (
                    <textarea
                      rows={25}
                      value={reactSourceCode}
                      onChange={(e) => setReactSourceCode(e.target.value)}
                      className="w-full font-mono text-xs p-4 bg-[#0d1117] text-[#c9d1d9] border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 leading-relaxed shadow-inner"
                      spellCheck={false}
                    />
                  )}
                </div>
              )}`;

code = code.replace(`{/* Bottom Footer Action Bar */}`, reactSourceBlock + "\n            {/* Bottom Footer Action Bar */}");

fs.writeFileSync('src/pages/admin/PagesCodeEditorAdmin.tsx', code);
