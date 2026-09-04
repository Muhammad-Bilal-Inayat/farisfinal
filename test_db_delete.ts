import { db } from './src/db/index.js';
import { vehicles, trip_rates, bookings, admin_audit_logs } from './src/db/schema.js';
import { eq } from 'drizzle-orm';

async function testDelete() {
  const vehicleId = 2; // Ford Expedition
  try {
    await db.delete(trip_rates).where(eq(trip_rates.vehicleId, vehicleId));
    console.log("trip_rates deleted");
    
    await db.update(bookings).set({ vehicleId: null }).where(eq(bookings.vehicleId, vehicleId));
    console.log("bookings updated");
    
    await db.delete(vehicles).where(eq(vehicles.id, vehicleId));
    console.log("vehicles deleted");
    
  } catch (err) {
    console.error("Error during deletion:", err);
  }
}
testDelete();
