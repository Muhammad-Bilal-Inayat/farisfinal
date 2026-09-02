import { db } from "./src/db/index.js";
import { vehicles, trip_rates, bookings } from "./src/db/schema.js";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("Clearing bookings, old vehicles and rates...");
  await db.delete(bookings);
  await db.delete(trip_rates);
  await db.delete(vehicles);

  console.log("Inserting vehicles...");
  const vList = [
    { name: "Toyota Camry", year: 2025, passengerCapacity: 4, luggageCapacity: 4, category: "Sedan", startingPrice: 300, status: "active", featured: true },
    { name: "GMC XL 2025", year: 2025, passengerCapacity: 7, luggageCapacity: 8, category: "SUV", startingPrice: 600, status: "active", featured: true },
    { name: "H1 Hyundai", year: 2025, passengerCapacity: 7, luggageCapacity: 8, category: "Van", startingPrice: 300, status: "active", featured: true },
    { name: "Staria", year: 2025, passengerCapacity: 8, luggageCapacity: 8, category: "Van", startingPrice: 350, status: "active", featured: true },
    { name: "Ford Taurus", year: 2025, passengerCapacity: 4, luggageCapacity: 3, category: "Sedan", startingPrice: 350, status: "active", featured: true },
    { name: "Toyota Hiace", year: 2025, passengerCapacity: 12, luggageCapacity: 12, category: "Van", startingPrice: 400, status: "active", featured: true },
    { name: "Lexus ES300h 2026", year: 2026, passengerCapacity: 4, luggageCapacity: 3, category: "Luxury Sedan", startingPrice: 550, status: "active", featured: true },
    { name: "Toyota Coster 2025", year: 2025, passengerCapacity: 22, luggageCapacity: 25, category: "Minibus", startingPrice: 650, status: "active", featured: true },
    { name: "Bus 2025", year: 2025, passengerCapacity: 50, luggageCapacity: 55, category: "Bus", startingPrice: 850, status: "active", featured: true }
  ];

  const insertedVehicles = [];
  for (const v of vList) {
    const res = await db.insert(vehicles).values(v).returning().get();
    insertedVehicles.push(res);
  }

  const routePaths = [
    { p: "Jeddah Airport", d: "Makkah Hotel", c: "Airport Transfer" },
    { p: "Makkah Hotel", d: "Jeddah Airport", c: "Airport Transfer" },
    { p: "Makkah Hotel", d: "Madinah Hotel", c: "Intercity" },
    { p: "Madinah Hotel", d: "Makkah Hotel", c: "Intercity" },
    { p: "Madinah Airport", d: "Madinah Hotel", c: "Airport Transfer" },
    { p: "Madinah Hotel", d: "Madinah Airport", c: "Airport Transfer" },
    { p: "Madinah Hotel", d: "Jeddah", c: "Intercity" },
    { p: "Jeddah Airport", d: "Madinah Hotel", c: "Airport Transfer" },
    { p: "Madinah", d: "Makkah via Badr", c: "Ziyarat" },
    { p: "Madinah", d: "Badr", c: "Ziyarat" },
    { p: "Makkah", d: "Taif Ziyarat", c: "Ziyarat" },
    { p: "Makkah Ziyarat", d: "Makkah Ziyarat", c: "Ziyarat" },
    { p: "Madinah Ziyarat", d: "Madinah Ziyarat", c: "Ziyarat" },
    { p: "Jeddah Airport", d: "Jeddah Hotel", c: "Airport Transfer" },
    { p: "Hotel", d: "Train Station", c: "Transfer" },
    { p: "Train Station", d: "Hotel", c: "Transfer" },
    { p: "Full Day", d: "8 Hours", c: "Hourly" }
  ];

  const rateMatrix = [
    [300, 200, 400, 400, 200, 150, 400, 500, 650, 450, 350, 200, 200, 200, 150, 200, 600], // Camry
    [600, 450, 950, 950, 400, 350, 950, 1050, 1250, 900, 850, 400, 400, 300, 350, 350, 1400], // GMC
    [300, 250, 400, 400, 250, 200, 450, 550, 650, 500, 400, 250, 250, 175, 200, 200, 750], // H1
    [350, 250, 500, 500, 270, 200, 550, 600, 700, 500, 500, 300, 300, 200, 200, 250, 800], // Staria
    [350, 250, 450, 450, 300, 200, 450, 500, 650, 450, 400, 250, 250, 225, 200, 230, 750], // Taurus
    [400, 300, 700, 700, 300, 200, 750, 750, 850, 600, 600, 400, 400, 250, 250, 275, 1000], // Hiace
    [550, 400, 650, 650, 350, 250, 700, 750, 950, 700, 700, 350, 350, 300, 250, 300, 1000], // Lexus
    [650, 500, 1000, 1000, 550, 450, 1050, 1100, 1200, 800, 800, 450, 450, 400, 350, 400, 1400], // Coster
    [850, 650, 1250, 1250, 650, 550, 1300, 1350, 1600, 950, 950, 500, 500, 500, 400, 450, 1600], // Bus
  ];

  console.log("Inserting rates...");
  const routesToInsert = [];
  for (let v = 0; v < insertedVehicles.length; v++) {
    const vId = insertedVehicles[v].id;
    const rates = rateMatrix[v];
    for (let r = 0; r < routePaths.length; r++) {
      const rp = routePaths[r];
      const price = rates[r];
      routesToInsert.push({
        pickup: rp.p,
        destination: rp.d,
        vehicleId: vId,
        price: price,
        status: "active"
      });
    }
  }

  await db.insert(trip_rates).values(routesToInsert);
  console.log("Done seeding!");
}

seed().catch(console.error);
