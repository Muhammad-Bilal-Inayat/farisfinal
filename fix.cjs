const fs = require('fs');
let content = fs.readFileSync('src/pages/RoutesRates.tsx', 'utf8');
content = content.replace("import ResponsiveImage from '../components/ResponsiveImage'; { useState, useMemo, useEffect } from 'react';", "import React, { useState, useMemo, useEffect } from 'react';\nimport ResponsiveImage from '../components/ResponsiveImage';");
fs.writeFileSync('src/pages/RoutesRates.tsx', content);

let vContent = fs.readFileSync('src/pages/Vehicles.tsx', 'utf8');
vContent = vContent.replace("import ResponsiveImage from '../components/ResponsiveImage'; { useState, useEffect, useMemo } from 'react';", "import React, { useState, useEffect, useMemo } from 'react';\nimport ResponsiveImage from '../components/ResponsiveImage';");
fs.writeFileSync('src/pages/Vehicles.tsx', vContent);

let hContent = fs.readFileSync('src/pages/Home.tsx', 'utf8');
hContent = hContent.replace("import ResponsiveImage from '../components/ResponsiveImage'; { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport ResponsiveImage from '../components/ResponsiveImage';");
fs.writeFileSync('src/pages/Home.tsx', hContent);
