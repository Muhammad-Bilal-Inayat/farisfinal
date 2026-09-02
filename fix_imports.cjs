const fs = require('fs');

['src/pages/RoutesRates.tsx', 'src/pages/Vehicles.tsx', 'src/pages/Home.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import React, \{ [^\}]+\} from 'react';\nimport React, \{ [^\}]+\} from 'react';/, match => {
    return match.split('\n')[0];
  });
  fs.writeFileSync(file, content);
});
