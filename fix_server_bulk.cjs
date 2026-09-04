const fs = require('fs');
let serverContent = fs.readFileSync('server.ts', 'utf8');

if (!serverContent.includes('inArray')) {
  serverContent = serverContent.replace('import { eq, desc, and, sql } from "drizzle-orm";', 'import { eq, desc, and, sql, inArray } from "drizzle-orm";');
}

serverContent = serverContent.replace(
  'await db.delete(trip_rates).where(sql\`vehicle_id IN (\${sql.join(ids, sql\`, \`)})\`);',
  'await db.delete(trip_rates).where(inArray(trip_rates.vehicleId, ids));'
);
serverContent = serverContent.replace(
  'await db.update(bookings).set({ vehicleId: null }).where(sql\`vehicle_id IN (\${sql.join(ids, sql\`, \`)})\`);',
  'await db.update(bookings).set({ vehicleId: null }).where(inArray(bookings.vehicleId, ids));'
);
serverContent = serverContent.replace(
  'await db.delete(vehicles).where(sql\`id IN (\${sql.join(ids, sql\`, \`)})\`);',
  'await db.delete(vehicles).where(inArray(vehicles.id, ids));'
);
serverContent = serverContent.replace(
  'await db.delete(bookings).where(sql\`id IN (\${sql.join(ids, sql\`, \`)})\`);',
  'await db.delete(bookings).where(inArray(bookings.id, ids));'
);

fs.writeFileSync('server.ts', serverContent);
console.log("Fixed server.ts bulk SQL");
