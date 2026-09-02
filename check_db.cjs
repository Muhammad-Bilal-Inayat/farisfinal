const sqlite3 = require('better-sqlite3');
const db = sqlite3('sqlite.db'); // Check filename

console.log("Tables:", db.prepare("SELECT name FROM sqlite_master WHERE type='table';").all());
console.log("Vehicles:", db.prepare("SELECT COUNT(*) FROM vehicles").get());
console.log("Routes:", db.prepare("SELECT COUNT(*) FROM trip_routes").get());
console.log("Rates:", db.prepare("SELECT COUNT(*) FROM trip_rates").get());
