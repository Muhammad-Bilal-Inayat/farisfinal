const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const jwt = require('jsonwebtoken');
const token = jwt.sign({ id: 1, role: 'admin' }, process.env.JWT_SECRET || 'super-secret-faris-key-123', { expiresIn: '1d' });
fetch('http://localhost:3000/api/admin/vehicles', {
  headers: { 'Authorization': 'Bearer ' + token }
}).then(r => r.json()).then(console.log).catch(console.error);
