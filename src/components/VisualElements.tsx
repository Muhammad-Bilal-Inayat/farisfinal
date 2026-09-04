import { useRef, useEffect, useState } from 'react';
import { useVisualEditor } from './VisualEditorContext';
import { getResponsiveImageProps } from '../utils/imageUtils';

export const VisualText = ({ id, as: Component = 'span', className = '', children, ...props }: any) => {
  const { isEditMode, activeElement, setActiveElement, updateElement, getElementProps } = useVisualEditor();
  const overrides = getElementProps(id);
  const textRef = useRef<HTMLElement>(null);
  
  const mergedStyle = { ...props.style, ...overrides.style };
  const content = overrides.content !== undefined ? overrides.content : children;
  const isActive = activeElement === id;

  if (!isEditMode) {
    return <Component className={className} style={mergedStyle} {...props}>{content}</Component>;
  }

  return (
    <Component
      ref={textRef}
      contentEditable={isEditMode}
      suppressContentEditableWarning
      onBlur={(e: any) => updateElement(id, { content: e.currentTarget.innerHTML })}
      className={`${className} ${isActive ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:ring-2 hover:ring-blue-300 hover:ring-offset-2'} cursor-text transition-all`}
      style={mergedStyle}
      onClick={(e: any) => {
        e.stopPropagation();
        e.preventDefault();
        setActiveElement(id, 'text', mergedStyle);
      }}
      {...props}
      dangerouslySetInnerHTML={{ __html: typeof content === 'string' ? content : '' }}
    />
  );
};

export const VisualSection = ({ id, className = '', children, ...props }: any) => {
  const { isEditMode, activeElement, setActiveElement, getElementProps } = useVisualEditor();
  const overrides = getElementProps(id);
  
  const mergedStyle = { ...props.style, ...overrides.style };
  const isActive = activeElement === id;

  if (!isEditMode) {
    if (overrides.hidden) return null;
    return <section className={className} style={mergedStyle} {...props}>{children}</section>;
  }

  return (
    <section
      className={`${className} ${isActive ? 'ring-2 ring-emerald-500 inset-0 z-10' : 'hover:ring-2 hover:ring-emerald-300'} relative transition-all`}
      style={{...mergedStyle, opacity: overrides.hidden ? 0.3 : 1}}
      onClick={(e) => {
        e.stopPropagation();
        setActiveElement(id, 'section', mergedStyle);
      }}
      {...props}
    >
      {isEditMode && overrides.hidden && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/10 backdrop-blur-sm z-20 pointer-events-none">
          <span className="bg-gray-800 text-white px-3 py-1 rounded text-sm font-bold">HIDDEN SECTION</span>
        </div>
      )}
      {children}
    </section>
  );
};

export const VisualImage = ({ id, src, alt, className = '', ...props }: any) => {
  const { isEditMode, activeElement, setActiveElement, getElementProps } = useVisualEditor();
  const overrides = getElementProps(id);
  
  const mergedStyle = { ...props.style, ...overrides.style };
  const currentSrc = overrides.src || src;
  const isActive = activeElement === id;

  if (!isEditMode) {
    return <img loading="lazy" decoding="async" src={currentSrc} alt={alt} className={className} style={mergedStyle} {...props} />;
  }

  return (
    <div 
      className={`relative inline-block ${isActive ? 'ring-2 ring-purple-500' : 'hover:ring-2 hover:ring-purple-300'} cursor-pointer`}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setActiveElement(id, 'image', { ...mergedStyle, src: currentSrc });
      }}
    >
      <img loading="lazy" decoding="async" src={currentSrc} alt={alt} className={className} style={mergedStyle} {...props} />
      {isEditMode && isActive && (
         <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded shadow">Edit Image</div>
      )}
    </div>
  );
};


export const VisualDiv = ({ id, className = '', children, ...props }: any) => {
  const { isEditMode, activeElement, setActiveElement, getElementProps } = useVisualEditor();
  const overrides = getElementProps(id);
  
  const mergedStyle = { ...props.style, ...overrides.style };
  const isActive = activeElement === id;

  if (!isEditMode) {
    if (overrides.hidden) return null;
    return <div className={className} style={mergedStyle} {...props}>{children}</div>;
  }

  return (
    <div
      className={`${className} ${isActive ? 'ring-2 ring-emerald-500 inset-0 z-10' : 'hover:ring-2 hover:ring-emerald-300'} relative transition-all`}
      style={{...mergedStyle, opacity: overrides.hidden ? 0.3 : 1}}
      onClick={(e) => {
        e.stopPropagation();
        setActiveElement(id, 'section', mergedStyle);
      }}
      {...props}
    >
      {isEditMode && overrides.hidden && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/10 backdrop-blur-sm z-20 pointer-events-none">
          <span className="bg-gray-800 text-white px-3 py-1 rounded text-sm font-bold">HIDDEN BLOCK</span>
        </div>
      )}
      {children}
    </div>
  );
};


export const VisualButton = ({ id, as: Component = 'button', className = '', children, ...props }: any) => {
  const { isEditMode, activeElement, setActiveElement, getElementProps, updateElement } = useVisualEditor();
  const overrides = getElementProps(id);
  
  const mergedStyle = { ...props.style, ...overrides.style };
  const content = overrides.content !== undefined ? overrides.content : children;
  const href = overrides.href || props.href;
  const to = overrides.to || props.to;
  
  const isActive = activeElement === id;

  if (!isEditMode) {
    if (overrides.hidden) return null;
    const finalProps = { ...props };
    if (href) finalProps.href = href;
    if (to) finalProps.to = to;
    return <Component className={className} style={mergedStyle} {...finalProps}>{content}</Component>;
  }

  const finalProps = { ...props };
  if (href) finalProps.href = href;
  if (to) finalProps.to = to;
  
  // Disable normal navigation in edit mode
  if (Component === 'a' || finalProps.to || finalProps.href) {
     finalProps.onClick = (e: any) => {
       e.preventDefault();
       e.stopPropagation();
       setActiveElement(id, 'button', { ...mergedStyle, href, to, content });
     }
  }

  return (
    <div className="relative inline-block" onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      setActiveElement(id, 'button', { ...mergedStyle, href, to, content });
    }}>
      <Component
        className={`${className} ${isActive ? 'ring-4 ring-pink-500 ring-offset-2' : 'hover:ring-4 hover:ring-pink-300'} relative transition-all cursor-pointer pointer-events-none`}
        style={{...mergedStyle, opacity: overrides.hidden ? 0.3 : 1}}
        {...finalProps}
      >
        {content}
      </Component>
      {isEditMode && overrides.hidden && (
        <div className="absolute -top-3 -right-3 bg-red-600 text-white text-[9px] px-1 rounded z-20">HIDDEN</div>
      )}
    </div>
  );
};
