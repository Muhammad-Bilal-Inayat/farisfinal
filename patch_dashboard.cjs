const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Dashboard.tsx', 'utf8');
code = code.replace(
  /if \(bookingsRes.ok\) \{/,
  `if (bookingsRes.status === 401 || msgRes.status === 401) {
        localStorage.removeItem('adminToken');
        setToken(null);
        return;
      }
      if (bookingsRes.ok) {`
);
fs.writeFileSync('src/pages/admin/Dashboard.tsx', code);
