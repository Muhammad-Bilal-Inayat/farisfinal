const fs = require('fs');
let content = fs.readFileSync('src/pages/Services.tsx', 'utf8');

content = content.replace("import React from 'react';", "import React from 'react';\nimport ResponsiveImage from '../components/ResponsiveImage';");

fs.writeFileSync('src/pages/Services.tsx', content);
