const fs = require('fs');
let content1 = fs.readFileSync('src/components/ZiyaratMap.tsx', 'utf8');
content1 = content1.replace(
  "import React,\nimport ResponsiveImage from './ResponsiveImage'; { useState, useEffect, useRef } from 'react';",
  "import React, { useState, useEffect, useRef } from 'react';\nimport ResponsiveImage from './ResponsiveImage';"
);
fs.writeFileSync('src/components/ZiyaratMap.tsx', content1);

let content2 = fs.readFileSync('src/components/BookingWidget.tsx', 'utf8');
content2 = content2.replace(
  "import React,\nimport ResponsiveImage from './ResponsiveImage'; { useState, useEffect, useMemo, useRef } from 'react';",
  "import React, { useState, useEffect, useMemo, useRef } from 'react';\nimport ResponsiveImage from './ResponsiveImage';"
);
fs.writeFileSync('src/components/BookingWidget.tsx', content2);
