import { db } from "./src/db/index.js";
import { vehicles, trip_rates } from "./src/db/schema.js";

async function seed() {
  const v1 = await db.insert(vehicles).values({
    name: "Toyota Camry",
    year: 2024,
    passengerCapacity: 4,
    luggageCapacity: 3,
    startingPrice: 300,
    features: "Air Conditioning, Free WiFi, Leather Seats, Bottle Water",
    category: "Sedan"
  }).returning().get();

  const v2 = await db.insert(vehicles).values({
    name: "GMC Yukon",
    year: 2024,
    passengerCapacity: 7,
    luggageCapacity: 6,
    startingPrice: 500,
    features: "Extra Legroom, Air Conditioning, Premium Audio, Bottle Water",
    category: "SUV"
  }).returning().get();

  await db.insert(trip_rates).values([
    { pickup: "Jeddah Airport (JED)", destination: "Makkah Hotel", vehicleId: v1.id, price: 300 },
    { pickup: "Jeddah Airport (JED)", destination: "Madinah Hotel", vehicleId: v1.id, price: 800 },
    { pickup: "Makkah Hotel", destination: "Madinah Hotel", vehicleId: v1.id, price: 500 },
    
    { pickup: "Jeddah Airport (JED)", destination: "Makkah Hotel", vehicleId: v2.id, price: 500 },
    { pickup: "Jeddah Airport (JED)", destination: "Madinah Hotel", vehicleId: v2.id, price: 1200 },
    { pickup: "Makkah Hotel", destination: "Madinah Hotel", vehicleId: v2.id, price: 800 },
  ]);

  console.log("Seeded default vehicles and routes!");
}

seed();
