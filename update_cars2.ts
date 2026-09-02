import { db } from './src/db/index.js';
import { vehicles, trip_rates, bookings } from './src/db/schema.js';
import { eq } from 'drizzle-orm';

async function run() {
  await db.delete(bookings);
  await db.delete(trip_rates);
  await db.delete(vehicles);
  
  const newVehicles = [
    { name: 'Toyota Camry', nameAr: 'تويوتا كامري', passengerCapacity: 4, luggageCapacity: 3, startingPrice: 150, category: 'sedan', status: 'active', displayOrder: 1, isFeatured: true },
    { name: 'GMC XL 2023', nameAr: 'جمس إكس إل 2023', passengerCapacity: 7, luggageCapacity: 7, startingPrice: 400, category: 'suv', status: 'active', displayOrder: 2, isFeatured: true },
    { name: 'H1 Hyundai', nameAr: 'هيونداي اتش ون', passengerCapacity: 7, luggageCapacity: 7, startingPrice: 300, category: 'van', status: 'active', displayOrder: 3, isFeatured: true },
    { name: 'Staria', nameAr: 'ستاريا', passengerCapacity: 8, luggageCapacity: 8, startingPrice: 350, category: 'van', status: 'active', displayOrder: 4, isFeatured: true },
    { name: 'Ford Taurus', nameAr: 'فورد تورس', passengerCapacity: 4, luggageCapacity: 3, startingPrice: 200, category: 'sedan', status: 'active', displayOrder: 5, isFeatured: true },
    { name: 'Toyota Hiace', nameAr: 'تويوتا هايس', passengerCapacity: 12, luggageCapacity: 12, startingPrice: 450, category: 'van', status: 'active', displayOrder: 6, isFeatured: true },
    { name: 'Lexus ES300h 2026', nameAr: 'لكزس ES300h 2026', passengerCapacity: 4, luggageCapacity: 3, startingPrice: 500, category: 'luxury', status: 'active', displayOrder: 7, isFeatured: true },
    { name: 'Toyota Coster 2025', nameAr: 'تويوتا كوستر 2025', passengerCapacity: 22, luggageCapacity: 15, startingPrice: 800, category: 'bus', status: 'active', displayOrder: 8, isFeatured: true },
    { name: 'Bus 2025', nameAr: 'حافلة 2025', passengerCapacity: 50, luggageCapacity: 40, startingPrice: 1200, category: 'bus', status: 'active', displayOrder: 9, isFeatured: true }
  ];

  for (const v of newVehicles) {
    await db.insert(vehicles).values(v);
  }
  
  console.log("Vehicles updated successfully.");
}
run();
