const Database = require('better-sqlite3');
const db = new Database('local.db');
const rows = db.prepare('SELECT name, year, passenger_capacity as passengerCapacity, luggage_capacity as luggageCapacity, features, image_url as imageUrl, starting_price as startingPrice, description, category, status, display_order as displayOrder FROM vehicles').all();
console.log(JSON.stringify(rows, null, 2));
