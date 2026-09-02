import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Save, GripVertical, Plus, Trash2, Image as ImageIcon, LayoutDashboard } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SectionConfig {
  id: string;
  type: string;
  enabled: boolean;
  titleEn?: string;
  titleAr?: string;
  contentEn?: string;
  contentAr?: string;
  image?: string;
}

const DEFAULT_LAYOUT: SectionConfig[] = [
  { id: 'hero', type: 'hero', enabled: true, titleEn: 'Hero Slider', titleAr: 'سلايدر' },
  { id: 'fleet_specs', type: 'fleet_specs', enabled: true, titleEn: 'Fleet Specs (Image+Text)', titleAr: 'مواصفات الأسطول', image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=80' },
  { id: 'quick_routes', type: 'quick_routes', enabled: true, titleEn: 'Quick Route Pills', titleAr: 'روابط المسارات السريعة' },
  { id: 'routes', type: 'routes', enabled: true, titleEn: 'Fixed Routes (Image+Rates)', titleAr: 'المسارات الثابتة', image: 'https://images.unsplash.com/photo-1502877338593-d286ae718eff?auto=format&fit=crop&w=1000&q=80' },
  { id: 'vehicles', type: 'vehicles', enabled: true, titleEn: 'Featured Vehicles Grid', titleAr: 'شبكة السيارات' },
  { id: 'ziyarat', type: 'ziyarat', enabled: true, titleEn: 'Ziyarat Previews', titleAr: 'المزارات' },
  { id: 'testimonials', type: 'testimonials', enabled: true, titleEn: 'Testimonials', titleAr: 'التوصيات' },
];

function SortableItem({ id, section, updateSection, removeSection }: any) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white border border-gray-200 rounded-lg p-4 mb-4 flex gap-4 shadow-sm relative group">
      <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600 flex items-center justify-center p-2 touch-none">
        <GripVertical size={20} />
      </div>
      
      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-gray-800">{isAr ? section.titleAr : section.titleEn} <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded ml-2 uppercase tracking-wide">{section.type}</span></h3>
          <div className="flex items-center gap-3">
             <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={section.enabled} onChange={(e) => updateSection(id, 'enabled', e.target.checked)} />
                <div className={`block w-10 h-6 rounded-full transition-colors ${section.enabled ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${section.enabled ? 'transform translate-x-4' : ''}`}></div>
              </div>
              <div className="ml-3 text-sm font-medium text-gray-700">{section.enabled ? (isAr ? 'مفعل' : 'Enabled') : (isAr ? 'معطل' : 'Disabled')}</div>
            </label>
            {section.type === 'custom' && (
              <button onClick={() => removeSection(id)} className="text-red-500 hover:text-red-700 p-1">
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {section.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {(section.type === 'custom' || section.type === 'fleet_specs' || section.type === 'routes') && (
               <div>
                  <label className="block text-xs text-gray-500 mb-1">Image URL</label>
                  <div className="flex items-center gap-2">
                    <ImageIcon size={16} className="text-gray-400" />
                    <input type="text" value={section.image || ''} onChange={(e) => updateSection(id, 'image', e.target.value)} className="w-full text-sm border-gray-300 rounded p-1.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="https://..." />
                  </div>
               </div>
            )}
            
            {section.type === 'custom' && (
              <>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Title (EN)</label>
                  <input type="text" value={section.titleEn || ''} onChange={(e) => updateSection(id, 'titleEn', e.target.value)} className="w-full text-sm border-gray-300 rounded p-1.5 focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Title (AR)</label>
                  <input type="text" value={section.titleAr || ''} onChange={(e) => updateSection(id, 'titleAr', e.target.value)} className="w-full text-sm border-gray-300 rounded p-1.5 focus:border-emerald-500 text-right" dir="rtl" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Content (EN)</label>
                  <textarea value={section.contentEn || ''} onChange={(e) => updateSection(id, 'contentEn', e.target.value)} className="w-full text-sm border-gray-300 rounded p-2 focus:border-emerald-500 h-20" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Content (AR)</label>
                  <textarea value={section.contentAr || ''} onChange={(e) => updateSection(id, 'contentAr', e.target.value)} className="w-full text-sm border-gray-300 rounded p-2 focus:border-emerald-500 h-20 text-right" dir="rtl" />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PageBuilderAdmin() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [sections, setSections] = useState<SectionConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.homePageConfig) {
          try {
            let parsed = JSON.parse(data.homePageConfig);
            DEFAULT_LAYOUT.forEach(def => {
              if (!parsed.find(p => p.id === def.id)) {
                parsed.push(def);
              }
            });
            setSections(parsed);
          } catch(e) {
            setSections(DEFAULT_LAYOUT);
          }
        } else {
          setSections(DEFAULT_LAYOUT);
        }
        setLoading(false);
      })
      .catch(() => {
        setSections(DEFAULT_LAYOUT);
        setLoading(false);
      });
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const updateSection = (id: string, key: string, value: any) => {
    setSections(sections.map(s => s.id === id ? { ...s, [key]: value } : s));
  };

  const removeSection = (id: string) => {
    if(confirm('Are you sure you want to remove this block?')) {
      setSections(sections.filter(s => s.id !== id));
    }
  };

  const addCustomBlock = () => {
    const newBlock: SectionConfig = {
      id: `custom_${Date.now()}`,
      type: 'custom',
      enabled: true,
      titleEn: 'New Custom Block',
      titleAr: 'قسم مخصص جديد',
      contentEn: 'Write your content here...',
      contentAr: 'اكتب محتواك هنا...',
      image: ''
    };
    setSections([...sections, newBlock]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          homePageConfig: JSON.stringify(sections)
        })
      });
      if(res.ok) {
        alert(isAr ? 'تم حفظ تنسيق الصفحة بنجاح' : 'Page layout saved successfully!');
      } else {
        alert('Failed to save layout');
      }
    } catch(e) {
      console.error(e);
      alert('Error saving layout');
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Page Builder...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{isAr ? 'منشئ الصفحات (الرئيسية)' : 'Page Builder (Home)'}</h2>
            <p className="text-sm text-gray-500">{isAr ? 'تعديل وترتيب أقسام الصفحة الرئيسية' : 'Edit, drag and drop sections like Elementor'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={addCustomBlock}
            className="px-4 py-2 bg-white border border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50 flex items-center gap-2 text-sm font-semibold shadow-sm transition-colors"
          >
            <Plus size={16} /> {isAr ? 'إضافة قسم جديد' : 'Add Custom Block'}
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-[var(--color-dark-charcoal)] text-white rounded-lg hover:bg-black flex items-center gap-2 text-sm font-semibold shadow-md transition-colors disabled:opacity-50"
          >
            <Save size={16} /> {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ التغييرات' : 'Save Layout')}
          </button>
        </div>
      </div>

      <div className="p-6 bg-gray-50 min-h-[500px]">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {sections.map((section) => (
              <SortableItem key={section.id} id={section.id} section={section} updateSection={updateSection} removeSection={removeSection} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
