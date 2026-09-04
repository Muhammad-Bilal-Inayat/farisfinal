import { db } from './src/db/index.js';
import { vehicles } from './src/db/schema.js';
import { eq } from 'drizzle-orm';

async function main() {
  // Replace GMC XL with Ford Expedition
  await db.update(vehicles)
    .set({
      name: 'FORD EXPEDITION',
      description: 'Flagship Luxury SUV for VIP transfers & families',
      imageUrl: '/images/fleet/ford-expedition.jpg'
    })
    .where(eq(vehicles.id, 2));
    
  // Replace Toyota Camry with Ford Taurus
  await db.update(vehicles)
    .set({
      name: 'FORD TAURUS',
      description: 'Modern executive sedan for pilgrims',
      imageUrl: '/images/fleet/ford-taurus.jpg'
    })
    .where(eq(vehicles.id, 1));

  // Hide the old Taurus if it exists to avoid duplicates
  await db.update(vehicles)
    .set({ status: 'inactive' })
    .where(eq(vehicles.id, 5));
    
  console.log("Updated vehicles successfully!");
}

main().catch(console.error);
