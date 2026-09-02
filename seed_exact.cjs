const sqlite3 = require('better-sqlite3');
const db = sqlite3('local.db');

db.exec("PRAGMA foreign_keys = OFF;");
db.exec("DELETE FROM trip_rates");
db.exec("DELETE FROM trip_routes");
db.exec("DELETE FROM vehicles");
db.exec("PRAGMA foreign_keys = ON;");

console.log("Deleted old data");
