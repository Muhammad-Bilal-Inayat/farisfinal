const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Add import
if (!code.includes('useTranslation')) {
  code = code.replace(
    "import { Calendar, MapPin, Clock } from 'lucide-react';",
    "import { Calendar, MapPin, Clock } from 'lucide-react';\nimport { useTranslation } from 'react-i18next';"
  );
  
  // Add hook inside component
  code = code.replace(
    "const { user, token, loading, logout } = useAuth();",
    "const { user, token, loading, logout } = useAuth();\n  const { t, i18n } = useTranslation();\n  const isAr = i18n.language === 'ar';"
  );
}

// Replace SAR
code = code.replace(
  /<span className="text-xs">SAR<\/span>/g,
  `<span className="text-xs">{t('sar')}</span>`
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
