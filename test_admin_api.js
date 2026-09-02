const fetch = require('node-fetch');
fetch('http://localhost:3000/api/admin/vehicles', {
  headers: { 'Authorization': 'Bearer test-token-if-needed' }
}).then(r => r.json()).then(console.log).catch(console.error);
