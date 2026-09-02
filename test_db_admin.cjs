const sqlite3 = require('better-sqlite3');
const db = sqlite3('local.db');
console.log(db.prepare('SELECT id, name, imageUrl FROM vehicles').all());
