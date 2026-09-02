const sqlite3 = require('better-sqlite3');
const db = sqlite3('local.db');
console.log("Vehicles:", db.prepare("SELECT count(*) as c FROM vehicles").get().c);
console.log("Routes:", db.prepare("SELECT count(*) as c FROM trip_routes").get().c);
console.log("Rates:", db.prepare("SELECT count(*) as c FROM trip_rates").get().c);
