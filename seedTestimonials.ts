import { db } from "./src/db/index.js";
import { testimonials } from "./src/db/schema.js";

async function seed() {
  await db.delete(testimonials);
  await db.insert(testimonials).values([
    { customerName: "Ahmed Al-Farsi", location: "Dubai, UAE", text: "Exceptional service from Jeddah Airport to our hotel in Makkah. The GMC was spotless, the driver was courteous, and the entire process was seamless.", rating: 5, status: "active", displayOrder: 1 },
    { customerName: "Omar Tariq", location: "London, UK", text: "We booked a Staria for our family of 7. The space for our luggage was perfect, and the driver arrived right on time. Highly recommend Faris VIP Umrah Transport.", rating: 5, status: "active", displayOrder: 2 },
    { customerName: "Zainab Rahman", location: "Kuala Lumpur, MY", text: "The VIP experience we received was outstanding. Our transfer to Madinah was incredibly comfortable and safe. The booking process via WhatsApp was so easy.", rating: 5, status: "active", displayOrder: 3 }
  ]);
  console.log("Seeded testimonials");
}
seed().catch(console.error);
