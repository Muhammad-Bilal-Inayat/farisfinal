const fs = require('fs');
let content = fs.readFileSync('src/pages/Booking.tsx', 'utf8');

content = content.replace(
  "import React,\nimport ResponsiveImage from '../components/ResponsiveImage'; { useState, useEffect } from 'react';",
  "import React, { useState, useEffect } from 'react';\nimport ResponsiveImage from '../components/ResponsiveImage';"
);

fs.writeFileSync('src/pages/Booking.tsx', content);
