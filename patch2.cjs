const fs = require('fs');
const file = 'src/pages/admin/PageBuilderAdmin.tsx';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/<div \{\.\.\.attributes\} \{\.\.\.listeners\} className="cursor-grab text-gray-400 hover:text-gray-600 flex items-center justify-center p-2">/g, 
'<div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600 flex items-center justify-center p-2 touch-none">');
fs.writeFileSync(file, code);
