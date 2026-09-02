import React, { createContext, useContext, useEffect, useState } from 'react';

interface VisualEditorContextType {
  isEditMode: boolean;
  activeElement: string | null;
  setActiveElement: (id: string | null, type?: string, defaultStyles?: any) => void;
  updateElement: (id: string, props: any) => void;
  getElementProps: (id: string) => any;
  overrides: Record<string, any>;
}

const VisualEditorContext = createContext<VisualEditorContextType>({
  isEditMode: false,
  activeElement: null,
  setActiveElement: () => {},
  updateElement: () => {},
  getElementProps: () => ({}),
  overrides: {},
});

export const useVisualEditor = () => useContext(VisualEditorContext);

export const VisualEditorProvider = ({ children, isEditMode = false }: { children: React.ReactNode, isEditMode?: boolean }) => {
  const [activeElement, setActiveElement] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<string, any>>({});

  
  useEffect(() => {
    // Fetch initial overrides from server for ALL users (so public site sees them)
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.visualConfig) {
          try {
            setOverrides(JSON.parse(data.visualConfig));
          } catch(e) {}
        }
      });
      
    if (!isEditMode) return;


    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'VISUAL_EDITOR_UPDATE') {
        setOverrides(event.data.overrides);
      } else if (event.data?.type === 'VISUAL_EDITOR_SELECT') {
        setActiveElement(event.data.id);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isEditMode]);

  const updateElement = (id: string, props: any) => {
    const newOverrides = { ...overrides, [id]: { ...overrides[id], ...props } };
    setOverrides(newOverrides);
    // Send to parent
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'VISUAL_EDITOR_CHANGED', overrides: newOverrides }, '*');
    }
  };

  const setAndBroadcastActiveElement = (id: string | null, type: string = 'text', defaultStyles: any = {}) => {
    setActiveElement(id);
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'VISUAL_EDITOR_SELECTED', id, elementType: type, defaultStyles }, '*');
    }
  };

  const getElementProps = (id: string) => overrides[id] || {};

  return (
    <VisualEditorContext.Provider value={{
      isEditMode,
      activeElement,
      setActiveElement: setAndBroadcastActiveElement,
      updateElement,
      getElementProps,
      overrides
    }}>
      {children}
    </VisualEditorContext.Provider>
  );
};
