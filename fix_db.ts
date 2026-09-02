import { db } from "./src/db/index.js";
import { sql } from "drizzle-orm";
async function fix() {
  await db.run(sql`DROP TABLE IF EXISTS routes;`);
  await db.run(sql`DROP TABLE IF EXISTS trip_rates;`);
  await db.run(sql`DROP TABLE IF EXISTS trip_routes;`);
  await db.run(sql`
    CREATE TABLE trip_routes (
      id INTEGER PRIMARY KEY,
      pickup TEXT NOT NULL,
      destination TEXT NOT NULL,
      name_en TEXT NOT NULL,
      name_ar TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      display_order INTEGER DEFAULT 0,
      is_featured INTEGER DEFAULT 0
    );
  `);
  await db.run(sql`
    CREATE TABLE trip_rates (
      id INTEGER PRIMARY KEY,
      pickup TEXT NOT NULL,
      destination TEXT NOT NULL,
      vehicle_id INTEGER,
      price INTEGER NOT NULL,
      status TEXT DEFAULT 'active',
      FOREIGN KEY(vehicle_id) REFERENCES vehicles(id)
    );
  `);
}
fix().catch(console.error);
