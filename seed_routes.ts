import { db } from "./src/db/index.js";
import { trip_routes, trip_rates, vehicles } from "./src/db/schema.js";

async function seed() {
  const allVehicles = await db.select().from(vehicles);
  const vehicleMap = {};
  allVehicles.forEach(v => vehicleMap[v.name.toLowerCase()] = v.id);

  const initialRoutes = [
    { pickup: 'Jeddah Airport', destination: 'Makkah Hotel', min: 300, max: 850 },
    { pickup: 'Makkah Hotel', destination: 'Jeddah Airport', min: 200, max: 650 },
    { pickup: 'Makkah Hotel', destination: 'Madinah Hotel', min: 400, max: 1250 },
    { pickup: 'Madinah Hotel', destination: 'Makkah Hotel', min: 400, max: 1250 },
    { pickup: 'Madinah Airport', destination: 'Madinah Hotel', min: 200, max: 650 },
    { pickup: 'Madinah Hotel', destination: 'Madinah Airport', min: 150, max: 550 },
    { pickup: 'Madinah Hotel', destination: 'Jeddah', min: 400, max: 1300 },
    { pickup: 'Jeddah Airport', destination: 'Madinah Hotel', min: 500, max: 1350 },
    { pickup: 'Madinah', destination: 'Makkah via Badr', min: 650, max: 1600 },
    { pickup: 'Madinah', destination: 'Badr', min: 450, max: 950 },
    { pickup: 'Makkah', destination: 'Taif Ziyarat', min: 350, max: 950 },
    { pickup: 'Makkah', destination: 'Makkah Ziyarat', min: 200, max: 500 },
    { pickup: 'Madinah', destination: 'Madinah Ziyarat', min: 200, max: 500 },
    { pickup: 'Jeddah Airport', destination: 'Jeddah Hotel', min: 200, max: 500 },
    { pickup: 'Hotel', destination: 'Train Station', min: 150, max: 400 },
    { pickup: 'Train Station', destination: 'Hotel', min: 200, max: 450 },
    { pickup: 'Full Day', destination: '8 Hours', min: 600, max: 1600 }
  ];

  await db.delete(trip_rates);
  await db.delete(trip_routes);

  let displayOrder = 1;
  for (const r of initialRoutes) {
    const [insertedRoute] = await db.insert(trip_routes).values({
      pickup: r.pickup,
      destination: r.destination,
      nameEn: `${r.pickup} to ${r.destination}`,
      nameAr: `${r.pickup} إلى ${r.destination}`,
      displayOrder: displayOrder++
    }).returning();

    // insert some rates based on min and max
    if (vehicleMap['toyota camry']) {
      await db.insert(trip_rates).values({
        pickup: r.pickup,
        destination: r.destination,
        vehicleId: vehicleMap['toyota camry'],
        price: r.min
      });
    }
    if (vehicleMap['gmc xl 2025']) {
      await db.insert(trip_rates).values({
        pickup: r.pickup,
        destination: r.destination,
        vehicleId: vehicleMap['gmc xl 2025'],
        price: r.max
      });
    }
  }
  console.log("Seeded routes and rates");
}
seed().catch(console.error);
