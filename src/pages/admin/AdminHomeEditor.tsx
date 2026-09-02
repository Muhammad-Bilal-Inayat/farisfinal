import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Undo, Redo, Monitor, Tablet, Smartphone, Type, Image as ImageIcon, Layout, Eye, EyeOff } from 'lucide-react';

export default function AdminHomeEditor() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const [device, setDevice] = useState<'desktop'|'tablet'|'mobile'>('desktop');
  const [currentPath, setCurrentPath] = useState('/');
  const [overrides, setOverrides] = useState<Record<string, any>>({});
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activeElement, setActiveElement] = useState<string | null>(null);
  const [elementType, setElementType] = useState<string | null>(null);
  const [elementStyles, setElementStyles] = useState<any>({});
  
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    // Fetch initial overrides from server settings (e.g. visualConfig)
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.visualConfig) {
          const parsed = JSON.parse(data.visualConfig);
          setOverrides(parsed);
          setHistory([parsed]);
          setHistoryIndex(0);
        } else {
          setHistory([{}]);
          setHistoryIndex(0);
        }
      });
      
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'VISUAL_EDITOR_CHANGED') {
        setOverrides(e.data.overrides);
        // Add to history
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(e.data.overrides);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      } else if (e.data?.type === 'VISUAL_EDITOR_SELECTED') {
        setActiveElement(e.data.id);
        setElementType(e.data.elementType);
        setElementStyles(e.data.defaultStyles || {});
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  
  useEffect(() => {
    // Send overrides to iframe whenever they change (e.g. from undo/redo or sidebar)
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'VISUAL_EDITOR_UPDATE', overrides }, '*');
    }
  }, [overrides]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setOverrides(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setOverrides(history[historyIndex + 1]);
    }
  };

  const updateStyle = (key: string, value: any) => {
    if (!activeElement) return;
    const currentProps = overrides[activeElement] || {};
    const currentStyle = currentProps.style || {};
    const newOverrides = {
      ...overrides,
      [activeElement]: {
        ...currentProps,
        style: { ...currentStyle, [key]: value }
      }
    };
    setOverrides(newOverrides);
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newOverrides);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };
  
  const updateProp = (key: string, value: any) => {
    if (!activeElement) return;
    const currentProps = overrides[activeElement] || {};
    const newOverrides = {
      ...overrides,
      [activeElement]: {
        ...currentProps,
        [key]: value
      }
    };
    setOverrides(newOverrides);
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newOverrides);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ visualConfig: JSON.stringify(overrides) })
      });
      alert('Visual changes saved and published to live site!');
    } catch(e) {
      alert('Error saving');
    }
    setSaving(false);
  };

  const getDeviceWidth = () => {
    if (device === 'mobile') return '375px';
    if (device === 'tablet') return '768px';
    return '100%';
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-900 text-white font-sans">
      {/* Top Bar */}
      <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="font-bold text-lg bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Visual Builder</div>
          <div className="flex bg-gray-800 rounded-md p-1">
            <button onClick={() => setDevice('desktop')} className={`p-1.5 rounded ${device === 'desktop' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}><Monitor size={16}/></button>
            <button onClick={() => setDevice('tablet')} className={`p-1.5 rounded ${device === 'tablet' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}><Tablet size={16}/></button>
            <button onClick={() => setDevice('mobile')} className={`p-1.5 rounded ${device === 'mobile' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}><Smartphone size={16}/></button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={handleUndo} disabled={historyIndex <= 0} className="p-2 text-gray-400 hover:text-white disabled:opacity-50"><Undo size={18}/></button>
          <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-2 text-gray-400 hover:text-white disabled:opacity-50"><Redo size={18}/></button>
          <button onClick={saveChanges} disabled={saving} className="ml-4 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded font-bold text-sm flex items-center gap-2 transition">
            <Save size={16}/> {saving ? 'Saving...' : 'Publish Changes'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0 overflow-y-auto" dir={isAr ? 'rtl' : 'ltr'}>
          {!activeElement ? (
            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
              <Layout size={48} className="mb-4 opacity-20" />
              <p>Click any element on the right to edit its properties visually.</p>
            </div>
          ) : (
            <div className="p-5">
              <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                <h3 className="font-bold text-lg uppercase tracking-wider text-gray-300 flex items-center gap-2">
                  {elementType === 'text' && <Type size={18} className="text-purple-400"/>}
                  {elementType === 'image' && <ImageIcon size={18} className="text-pink-400"/>}
                  {elementType === 'section' && <Layout size={18} className="text-emerald-400"/>}
                  {elementType} Settings
                </h3>
                <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400 font-mono">{activeElement}</span>
              </div>
              
              <div className="space-y-6">
                
                {/* SECTION SETTINGS */}
                {elementType === 'section' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Visibility</label>
                      <button 
                        onClick={() => updateProp('hidden', !(overrides[activeElement]?.hidden))}
                        className={`w-full py-2 rounded flex justify-center items-center gap-2 font-bold text-sm transition ${overrides[activeElement]?.hidden ? 'bg-red-900/50 text-red-400 border border-red-800' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'}`}
                      >
                        {overrides[activeElement]?.hidden ? <EyeOff size={16}/> : <Eye size={16}/>}
                        {overrides[activeElement]?.hidden ? 'Section Hidden' : 'Hide Section'}
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Background Color</label>
                      <input type="color" value={overrides[activeElement]?.style?.backgroundColor || '#ffffff'} onChange={e => updateStyle('backgroundColor', e.target.value)} className="w-full h-10 rounded bg-gray-800 border-none cursor-pointer" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Padding (Top/Bottom)</label>
                      <input type="range" min="0" max="200" value={parseInt(overrides[activeElement]?.style?.paddingTop || '0')} onChange={e => { updateStyle('paddingTop', `${e.target.value}px`); updateStyle('paddingBottom', `${e.target.value}px`); }} className="w-full" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Background Image URL</label>
                      <input type="text" value={overrides[activeElement]?.style?.backgroundImage?.replace(/url\(['"]?(.*?)['"]?\)/i, '$1') || ''} onChange={e => updateStyle('backgroundImage', `url('${e.target.value}')`)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white" placeholder="https://..." />
                    </div>
                  </>
                )}

                {/* TEXT SETTINGS */}
                {elementType === 'text' && (
                  <>
                    <div className="bg-blue-900/20 border border-blue-800/50 rounded p-3 mb-4">
                      <p className="text-xs text-blue-300">💡 Tip: You can also just click and type directly on the text in the preview.</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Color</label>
                      <div className="flex gap-2">
                        <input type="color" value={overrides[activeElement]?.style?.color || '#000000'} onChange={e => updateStyle('color', e.target.value)} className="w-10 h-10 rounded bg-gray-800 border-none cursor-pointer" />
                        <input type="text" value={overrides[activeElement]?.style?.color || ''} onChange={e => updateStyle('color', e.target.value)} className="flex-1 bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Font Size</label>
                      <div className="flex items-center gap-3">
                        <input type="range" min="10" max="120" value={parseInt(overrides[activeElement]?.style?.fontSize || '16')} onChange={e => updateStyle('fontSize', `${e.target.value}px`)} className="flex-1" />
                        <span className="text-xs w-8">{parseInt(overrides[activeElement]?.style?.fontSize || '16')}px</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Font Weight</label>
                      <select value={overrides[activeElement]?.style?.fontWeight || 'normal'} onChange={e => updateStyle('fontWeight', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white">
                        <option value="normal">Normal</option>
                        <option value="500">Medium</option>
                        <option value="600">Semi Bold</option>
                        <option value="bold">Bold</option>
                        <option value="800">Extra Bold</option>
                        <option value="900">Black</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Alignment</label>
                      <div className="flex bg-gray-800 rounded">
                        {['left', 'center', 'right'].map(align => (
                          <button key={align} onClick={() => updateStyle('textAlign', align)} className={`flex-1 py-1.5 text-xs capitalize ${overrides[activeElement]?.style?.textAlign === align ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>{align}</button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* IMAGE SETTINGS */}
                
                {/* BUTTON SETTINGS */}
                {elementType === 'button' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Button Text</label>
                      <input type="text" value={overrides[activeElement]?.content || elementStyles?.content || ''} onChange={e => updateProp('content', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Link URL</label>
                      <input type="text" value={overrides[activeElement]?.to || overrides[activeElement]?.href || elementStyles?.to || elementStyles?.href || ''} onChange={e => {
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
                      <input type="range" min="0" max="50" value={parseInt(overrides[activeElement]?.style?.borderRadius || '8')} onChange={e => updateStyle('borderRadius', `${e.target.value}px`)} className="w-full" />
                    </div>
                  </>
                )}

                {elementType === 'image' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Image Source</label>
                      <input type="text" value={overrides[activeElement]?.src || ''} onChange={e => updateProp('src', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white mb-2" placeholder="https://..." />
                      {overrides[activeElement]?.src && (
                        <div className="mt-2 rounded overflow-hidden border border-gray-700">
                          <img loading="lazy" decoding="async" src={overrides[activeElement].src} alt="Preview" className="w-full h-auto object-cover max-h-40" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Border Radius</label>
                      <input type="range" min="0" max="100" value={parseInt(overrides[activeElement]?.style?.borderRadius || '0')} onChange={e => updateStyle('borderRadius', `${e.target.value}px`)} className="w-full" />
                    </div>
                  </>
                )}
                
              </div>
            </div>
          )}
        </div>
        
        {/* Workspace */}
        <div className="flex-1 bg-gray-950 flex justify-center items-start overflow-y-auto p-4 sm:p-8">
          <div 
            className="bg-white shadow-2xl transition-all duration-300 origin-top"
            style={{ width: getDeviceWidth(), minHeight: '100%', borderRadius: device === 'desktop' ? '0.5rem' : '2rem', overflow: 'hidden', border: device !== 'desktop' ? '8px solid #1f2937' : 'none' }}
          >
            <iframe
              ref={iframeRef}
              src={`${currentPath}?visualEditor=true`}
              className="w-full h-full border-none min-h-[1000px]"
              title="Visual Editor Preview"
              onLoad={() => {
                if (iframeRef.current?.contentWindow) {
                  iframeRef.current.contentWindow.postMessage({ type: 'VISUAL_EDITOR_UPDATE', overrides }, '*');
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
