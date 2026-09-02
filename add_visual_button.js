import fs from 'fs';
let content = fs.readFileSync('src/components/VisualElements.tsx', 'utf8');

const visualButton = `
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
        className={\`\${className} \${isActive ? 'ring-4 ring-pink-500 ring-offset-2' : 'hover:ring-4 hover:ring-pink-300'} relative transition-all cursor-pointer pointer-events-none\`}
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
`;

if (!content.includes('VisualButton')) {
  content += '\n' + visualButton;
  fs.writeFileSync('src/components/VisualElements.tsx', content);
}
console.log('Added VisualButton');
