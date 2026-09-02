const fs = require('fs');
const files = ['src/pages/admin/ManageVehicles.tsx', 'src/pages/admin/RatesAdmin.tsx'];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  if (!code.includes('if (res.status === 401)')) {
    code = code.replace(
      /\.then\(res => res\.json\(\)\)/g,
      `.then(res => {
        if (res.status === 401) {
          localStorage.removeItem('adminToken');
          window.location.reload();
        }
        return res.json();
      })`
    );
    // for async await fetch
    code = code.replace(
      /if \(res(R|V|Routes)?\.ok\) \{/g,
      `if (res$1.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.reload();
      }
      if (res$1.ok) {`
    );
    fs.writeFileSync(file, code);
  }
});
