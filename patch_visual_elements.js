import fs from 'fs';
let content = fs.readFileSync('src/components/VisualElements.tsx', 'utf8');

const visualDiv = `
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
      className={\`\${className} \${isActive ? 'ring-2 ring-emerald-500 inset-0 z-10' : 'hover:ring-2 hover:ring-emerald-300'} relative transition-all\`}
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
`;

if (!content.includes('VisualDiv')) {
  content += '\n' + visualDiv;
  fs.writeFileSync('src/components/VisualElements.tsx', content);
}
console.log('Added VisualDiv');
