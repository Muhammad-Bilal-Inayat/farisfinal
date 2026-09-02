import fs from 'fs';
let content = fs.readFileSync('src/pages/admin/AdminHomeEditor.tsx', 'utf8');

const buttonSettings = `
                {/* BUTTON SETTINGS */}
                {elementType === 'button' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Button Text</label>
                      <input type="text" value={overrides[activeElement]?.content || defaultStyles?.content || ''} onChange={e => updateProp('content', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Link URL</label>
                      <input type="text" value={overrides[activeElement]?.to || overrides[activeElement]?.href || defaultStyles?.to || defaultStyles?.href || ''} onChange={e => {
                        const val = e.target.value;
                        if (val.startsWith('http') || val.startsWith('mailto') || val.startsWith('tel')) {
                           updateProp('href', val);
                           updateProp('to', undefined);
                        } else {
                           updateProp('to', val);
                           updateProp('href', undefined);
                        }
                      }} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white" placeholder="/page or https://..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Background Color</label>
                      <div className="flex gap-2">
                        <input type="color" value={overrides[activeElement]?.style?.backgroundColor || '#10b981'} onChange={e => updateStyle('backgroundColor', e.target.value)} className="w-10 h-10 rounded bg-gray-800 border-none cursor-pointer" />
                        <input type="text" value={overrides[activeElement]?.style?.backgroundColor || ''} onChange={e => updateStyle('backgroundColor', e.target.value)} className="flex-1 bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Text Color</label>
                      <div className="flex gap-2">
                        <input type="color" value={overrides[activeElement]?.style?.color || '#ffffff'} onChange={e => updateStyle('color', e.target.value)} className="w-10 h-10 rounded bg-gray-800 border-none cursor-pointer" />
                        <input type="text" value={overrides[activeElement]?.style?.color || ''} onChange={e => updateStyle('color', e.target.value)} className="flex-1 bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Border Radius</label>
                      <input type="range" min="0" max="50" value={parseInt(overrides[activeElement]?.style?.borderRadius || '8')} onChange={e => updateStyle('borderRadius', \`\${e.target.value}px\`)} className="w-full" />
                    </div>
                  </>
                )}
`;

if (!content.includes('elementType === \'button\'')) {
  content = content.replace(/\{elementType === 'image' && \(/, buttonSettings + "\n                {elementType === 'image' && (");
  fs.writeFileSync('src/pages/admin/AdminHomeEditor.tsx', content);
}
console.log('Added button settings to AdminHomeEditor');
