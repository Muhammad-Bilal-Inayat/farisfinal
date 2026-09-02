import { db } from './src/db/index.js';
import { vehicles, trip_rates, bookings } from './src/db/schema.js';
import { eq } from 'drizzle-orm';

async function run() {
  // We can just delete bookings and trip_rates for a clean slate, it's a dev/test environment usually.
  // Let's delete all bookings and rates.
  await db.delete(bookings);
  await db.delete(trip_rates);
  await db.delete(vehicles);
  
  const newVehicles = [
    { name: 'Ford Taurus 2025', nameAr: 'فورد تورس 2025', passengerCapacity: 4, luggageCapacity: 3, startingPrice: 200, category: 'sedan', status: 'active', displayOrder: 1, isFeatured: true },
    { name: 'Mercedes S450 2024', nameAr: 'مرسيدس S450 2024', passengerCapacity: 3, luggageCapacity: 3, startingPrice: 600, category: 'luxury', status: 'active', displayOrder: 2, isFeatured: true },
    { name: 'Mercedes Maybach 2024', nameAr: 'مرسيدس مايباخ 2024', passengerCapacity: 3, luggageCapacity: 3, startingPrice: 1500, category: 'luxury', status: 'active', displayOrder: 3, isFeatured: true },
    { name: 'GMC 2026', nameAr: 'جمس 2026', passengerCapacity: 7, luggageCapacity: 7, startingPrice: 400, category: 'suv', status: 'active', displayOrder: 4, isFeatured: true },
    { name: 'Cadillac Escalade 2025', nameAr: 'كاديلاك إسكاليد 2025', passengerCapacity: 7, luggageCapacity: 7, startingPrice: 600, category: 'suv', status: 'active', displayOrder: 5, isFeatured: true },
    { name: 'Hyundai Staria 2026', nameAr: 'هيونداي ستاريا 2026', passengerCapacity: 9, luggageCapacity: 9, startingPrice: 350, category: 'van', status: 'active', displayOrder: 6, isFeatured: true },
    { name: 'Mercedes Vito 2025', nameAr: 'مرسيدس فيتو 2025', passengerCapacity: 7, luggageCapacity: 7, startingPrice: 500, category: 'van', status: 'active', displayOrder: 7, isFeatured: true },
    { name: 'Mercedes Sprinter 2025', nameAr: 'مرسيدس سبرينتر 2025', passengerCapacity: 12, luggageCapacity: 12, startingPrice: 700, category: 'van', status: 'active', displayOrder: 8, isFeatured: true },
    { name: 'Coaster', nameAr: 'كوستر', passengerCapacity: 22, luggageCapacity: 15, startingPrice: 800, category: 'bus', status: 'active', displayOrder: 9, isFeatured: true },
    { name: 'Bus', nameAr: 'حافلة', passengerCapacity: 50, luggageCapacity: 40, startingPrice: 1200, category: 'bus', status: 'active', displayOrder: 10, isFeatured: true }
  ];

  for (const v of newVehicles) {
    await db.insert(vehicles).values(v);
  }
  
  console.log("Vehicles updated successfully.");
}
run();
