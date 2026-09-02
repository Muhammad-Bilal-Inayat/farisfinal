import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import sharp from "sharp";
import cors from "cors";
import compression from "compression";
import { createServer as createViteServer } from "vite";
import { db } from "./src/db/index.js";
import { bookings, vehicles, trip_routes, trip_rates, settings, users, admins, activity_logs, contact_messages, whatsapp_settings, testimonials, drivers } from "./src/db/schema.js";
import { eq, desc, and, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-faris-key-123";

// High-speed In-Memory Cache Store for Blazing Fast Response Times
interface CacheEntry {
  data: any;
  expiresAt: number;
}
const memoryCache = new Map<string, CacheEntry>();
let totalCacheHits = 0;
let lastCachePurgeTime: string = new Date().toISOString();

function getCachedData<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  totalCacheHits++;
  return entry.data as T;
}

function setCachedData(key: string, data: any, ttlSeconds: number = 300) {
  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + (ttlSeconds * 1000)
  });
}

function clearAllCache(): number {
  const count = memoryCache.size;
  memoryCache.clear();
  lastCachePurgeTime = new Date().toISOString();
  return count;
}

function invalidateCacheTag(prefix?: string) {
  if (!prefix) {
    clearAllCache();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }
}

async function ensureTablesExist() {
  try {
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT DEFAULT 'Administrator',
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        status TEXT DEFAULT 'active',
        last_login TEXT,
        created_at TEXT
      );
    `);
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        username TEXT,
        name TEXT,
        role TEXT,
        action TEXT NOT NULL,
        module TEXT NOT NULL,
        record_id TEXT,
        description TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at TEXT NOT NULL
      );
    `);
    try { await db.run(sql`ALTER TABLE admins ADD COLUMN name TEXT DEFAULT 'Administrator';`); } catch (e) {}
    try { await db.run(sql`ALTER TABLE admins ADD COLUMN role TEXT DEFAULT 'admin';`); } catch (e) {}
    try { await db.run(sql`ALTER TABLE admins ADD COLUMN status TEXT DEFAULT 'active';`); } catch (e) {}
    try { await db.run(sql`ALTER TABLE admins ADD COLUMN last_login TEXT;`); } catch (e) {}
    try { await db.run(sql`ALTER TABLE admins ADD COLUMN created_at TEXT;`); } catch (e) {}
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        year INTEGER,
        passenger_capacity INTEGER NOT NULL,
        luggage_capacity INTEGER NOT NULL,
        features TEXT,
        image_url TEXT,
        starting_price INTEGER,
        description TEXT,
        category TEXT,
        status TEXT DEFAULT 'active',
        display_order INTEGER DEFAULT 0
      );
    `);
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS trip_routes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      CREATE TABLE IF NOT EXISTS trip_rates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pickup TEXT NOT NULL,
        destination TEXT NOT NULL,
        vehicle_id INTEGER,
        price INTEGER NOT NULL,
        price_max INTEGER,
        status TEXT DEFAULT 'active'
      );
    `);
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        whatsapp TEXT,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL,
        total_bookings INTEGER DEFAULT 0,
        total_spent INTEGER DEFAULT 0,
        last_booking_date TEXT
      );
    `);
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id TEXT NOT NULL UNIQUE,
        user_id INTEGER,
        customer_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        whatsapp TEXT,
        email TEXT,
        pickup TEXT NOT NULL,
        destination TEXT NOT NULL,
        vehicle_id INTEGER,
        vehicle_name_snapshot TEXT,
        passengers INTEGER NOT NULL,
        luggage INTEGER,
        trip_type TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        special_request TEXT,
        price INTEGER NOT NULL,
        price_max INTEGER,
        currency TEXT DEFAULT 'SAR',
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT
      );
    `);
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        whatsapp TEXT,
        email TEXT NOT NULL,
        subject TEXT,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'Unread',
        created_at TEXT NOT NULL
      );
    `);
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        location TEXT,
        text TEXT NOT NULL,
        rating INTEGER DEFAULT 5,
        status TEXT DEFAULT 'active',
        display_order INTEGER DEFAULT 0
      );
    `);
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS whatsapp_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_number TEXT NOT NULL,
        general_message TEXT,
        new_booking_message TEXT,
        confirmation_message TEXT,
        cancellation_message TEXT,
        contact_message TEXT
      );
    `);
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS drivers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        vehicle_info TEXT,
        status TEXT DEFAULT 'active',
        created_at TEXT NOT NULL,
        updated_at TEXT
      );
    `);

    // Schema alterations for compatibility
    try { await db.run(sql`ALTER TABLE trip_rates ADD COLUMN price_max INTEGER;`); } catch (e) {}
    try { await db.run(sql`ALTER TABLE bookings ADD COLUMN price_max INTEGER;`); } catch (e) {}
    try { await db.run(sql`ALTER TABLE bookings ADD COLUMN driver_name TEXT;`); } catch (e) {}
    try { await db.run(sql`ALTER TABLE bookings ADD COLUMN driver_phone TEXT;`); } catch (e) {}
    try { await db.run(sql`ALTER TABLE bookings ADD COLUMN driver_plate TEXT;`); } catch (e) {}
    try { await db.run(sql`ALTER TABLE bookings ADD COLUMN driver_id INTEGER;`); } catch (e) {}
    try { await db.run(sql`ALTER TABLE bookings ADD COLUMN driver_name_snapshot TEXT;`); } catch (e) {}
    try { await db.run(sql`ALTER TABLE bookings ADD COLUMN driver_phone_snapshot TEXT;`); } catch (e) {}

    // Seed initial drivers if table is empty
    try {
      const existingDrivers = await db.select().from(drivers).limit(1);
      if (existingDrivers.length === 0) {
        const now = new Date().toISOString();
        await db.insert(drivers).values([
          { name: "Ahmed Ali", phone: "+966501234567", vehicleInfo: "GMC Yukon XL 2025", status: "active", createdAt: now, updatedAt: now },
          { name: "Tariq Mansoor", phone: "+966559876543", vehicleInfo: "Toyota Camry 2025", status: "active", createdAt: now, updatedAt: now },
          { name: "Faisal Al-Harbi", phone: "+966543219876", vehicleInfo: "Hyundai Staria VIP 2025", status: "active", createdAt: now, updatedAt: now }
        ]);
      }
    } catch (e) {
      console.warn("Notice: drivers seed check", e);
    }
  } catch (err) {
    console.error("Error creating tables:", err);
  }
}

async function startServer() {
  const app = express();

  // Trust proxy for Cloud Run, Cloudflare and Nginx reverse proxy
  app.set('trust proxy', 1);

  // Health check endpoints FIRST (Instant 200 OK for Cloud Run and Load Balancers)
  app.get(["/api/health", "/healthz", "/health", "/_ah/health"], (req, res) => {
    res.status(200).json({ 
      status: "ok", 
      service: "Faris VIP Umrah Transport",
      uptime: process.uptime(), 
      timestamp: Date.now() 
    });
  });

  app.use(compression());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Seed default admin and data asynchronously
  (async () => {
    try {
      await ensureTablesExist();

      const companyNameExists = await db.select().from(settings).where(eq(settings.key, 'companyName')).limit(1).get();
      if (!companyNameExists) {
        await db.insert(settings).values({ key: 'companyName', value: 'Faris VIP Umrah Transport' });
      }
      const websiteDomainExists = await db.select().from(settings).where(eq(settings.key, 'websiteDomain')).limit(1).get();
      if (!websiteDomainExists) {
        await db.insert(settings).values({ key: 'websiteDomain', value: 'FarisVIPUmrahTransport.com' });
      }

      const adminExists = await db.select().from(admins).limit(1).get();
      const nowStr = new Date().toISOString();
      const defaultAdmins = [
        { username: 'vip123', password: 'vip123', role: 'master_admin', name: 'Master Administrator' },
        { username: 'admin123', password: 'admin123', role: 'admin', name: 'Standard Administrator' },
        { username: 'secondary123', password: 'secondary123', role: 'secondary_admin', name: 'Secondary Administrator' },
        { username: 'manager123', password: 'manager123', role: 'manager', name: 'Operations Manager' },
        { username: 'editor123', password: 'editor123', role: 'editor', name: 'Content Editor' },
        { username: 'driver123', password: 'driver123', role: 'driver', name: 'Assigned Driver' }
      ];

      for (const da of defaultAdmins) {
        const existing = await db.select().from(admins).where(eq(admins.username, da.username)).get();
        if (!existing) {
          const passwordHash = await bcrypt.hash(da.password, 10);
          await db.run(sql`
            INSERT INTO admins (name, username, password_hash, role, status, created_at)
            VALUES (${da.name}, ${da.username}, ${passwordHash}, ${da.role}, 'active', ${nowStr})
          `);
        }
      }
      const whatsappExists = await db.select().from(whatsapp_settings).limit(1).get();
      if (!whatsappExists) {
        await db.insert(whatsapp_settings).values({
          phoneNumber: "+966576124752",
          generalMessage: "Assalamu Alaikum, I would like to inquire about your services.",
          newBookingMessage: "Assalamu Alaikum, I have just submitted a new booking.",
          confirmationMessage: "Assalamu Alaikum, your booking is confirmed.",
          cancellationMessage: "Assalamu Alaikum, your booking has been cancelled.",
          contactMessage: "Assalamu Alaikum, I am contacting you from the website."
        });
      }

      // Seed 9 standard fleet vehicles and 17 routes
      const existingVehicles = await db.select().from(vehicles).all();
      const vehicleMap = new Map();

      const initialVehicles = [
        { name: "Toyota Camry", year: 2025, passengerCapacity: 4, luggageCapacity: 4, category: "sedan", startingPrice: 160, imageUrl: "/images/fleet/toyota-camry.jpg", features: "Comfort AC, 4 Bags, USB Charging", description: "Executive Sedan for small families & solo pilgrims" },
        { name: "GMC XL 2025", year: 2025, passengerCapacity: 7, luggageCapacity: 8, category: "suv", startingPrice: 300, imageUrl: "/images/fleet/gmc-xl.jpg", features: "VIP Leather, 8 Bags, Chilled Water, Rear AC", description: "Flagship Luxury SUV for VIP transfers & families" },
        { name: "H1 HYUNDAI", year: 2024, passengerCapacity: 7, luggageCapacity: 8, category: "van", startingPrice: 175, imageUrl: "/images/fleet/h1-hyundai.jpg", features: "Dual AC, 8 Bags, Spacious Legroom", description: "Spacious family van for smooth group rides" },
        { name: "STARIA", year: 2025, passengerCapacity: 8, luggageCapacity: 8, category: "van", startingPrice: 200, imageUrl: "/images/fleet/staria.jpg", features: "VIP Captain Seats, 8 Bags, Panoramic View", description: "Futuristic luxury van with supreme comfort" },
        { name: "FORD TAURUS", year: 2025, passengerCapacity: 4, luggageCapacity: 3, category: "sedan", startingPrice: 200, imageUrl: "/images/fleet/ford-taurus.jpg", features: "Executive Quiet Cabin, 3 Bags, Smooth Highway Ride", description: "Modern executive sedan for pilgrims" },
        { name: "TOYOTA HIACE", year: 2025, passengerCapacity: 12, luggageCapacity: 12, category: "van", startingPrice: 250, imageUrl: "/images/fleet/toyota-hiace.jpg", features: "High Roof, 12 Bags, Group AC, Large Luggage Trunk", description: "Ideal transport for medium Umrah groups & families" },
        { name: "LEXUS ES300h 2026", year: 2026, passengerCapacity: 4, luggageCapacity: 3, category: "sedan", startingPrice: 250, imageUrl: "/images/fleet/lexus-es300h.jpg", features: "Hybrid VIP Luxury, Premium Audio, Ultra Silent Cabin", description: "First-class luxury sedan for VIP dignitaries" },
        { name: "TOYOTA COASTER 2025", year: 2025, passengerCapacity: 22, luggageCapacity: 25, category: "bus", startingPrice: 350, imageUrl: "/images/fleet/toyota-coaster.jpg", features: "22 Seats, 25 Bags, Powerful AC, PA Mic System", description: "Luxury minibus for large family groups & ziyarat" },
        { name: "BUS 2025", year: 2025, passengerCapacity: 50, luggageCapacity: 55, category: "bus", startingPrice: 400, imageUrl: "/images/fleet/bus-2025.jpg", features: "50 Reclining Seats, Underfloor Luggage, WC, Group Tour", description: "Full-size VIP coach bus for Umrah delegations" }
      ];

      for (const vData of initialVehicles) {
        let v = existingVehicles.find(item => item.name.toLowerCase() === vData.name.toLowerCase());
        if (!v) {
          v = await db.insert(vehicles).values(vData).returning().get();
        } else {
          // Keep database image aligned with accurate vehicle photos
          await db.update(vehicles).set({ imageUrl: vData.imageUrl }).where(eq(vehicles.id, v.id));
        }
        vehicleMap.set(vData.name, v.id);
      }

      // Explicitly guarantee GMC XL 2025 has 7 passengers and 8 big size luggage
      await db.run(sql`
        UPDATE vehicles 
        SET name = 'GMC XL 2025', 
            year = 2025, 
            passenger_capacity = 7, 
            luggage_capacity = 8, 
            features = 'VIP Leather, 8 Bags, Chilled Water, Rear AC' 
        WHERE LOWER(name) LIKE '%gmc%';
      `);

      // 17 Standard Routes
      const standardRoutes = [
        { pickup: "Jeddah Airport (JED)", destination: "Makkah Hotel / Haram", nameEn: "Jeddah Airport to Makkah Hotel", nameAr: "مطار جدة إلى فنادق مكة" },
        { pickup: "Makkah Hotel / Haram", destination: "Jeddah Airport (JED)", nameEn: "Makkah Hotel to Jeddah Airport", nameAr: "فندق مكة إلى مطار جدة" },
        { pickup: "Makkah Hotel / Haram", destination: "Madinah Hotel / Markazia", nameEn: "Makkah Hotel to Madina Hotel", nameAr: "فندق مكة إلى فندق المدينة" },
        { pickup: "Madinah Hotel / Markazia", destination: "Makkah Hotel / Haram", nameEn: "Madina Hotel to Makkah Hotel", nameAr: "فندق المدينة إلى فندق مكة" },
        { pickup: "Madinah Airport (MED)", destination: "Madinah Hotel / Markazia", nameEn: "Madina Airport to Madina Hotel", nameAr: "مطار المدينة إلى فندق المدينة" },
        { pickup: "Madinah Hotel / Markazia", destination: "Madinah Airport (MED)", nameEn: "Madina Hotel to Madina Airport", nameAr: "فندق المدينة إلى مطار المدينة" },
        { pickup: "Madinah Hotel / Markazia", destination: "Jeddah Hotel / Corniche", nameEn: "Madina Hotel to Jeddah", nameAr: "فندق المدينة إلى جدة" },
        { pickup: "Jeddah Airport (JED)", destination: "Madinah Hotel / Markazia", nameEn: "Jeddah Airport to Madina Hotel", nameAr: "مطار جدة إلى فندق المدينة" },
        { pickup: "Madinah Hotel / Markazia", destination: "Makkah via Badr", nameEn: "Madina to Makkah by Badar", nameAr: "المدينة إلى مكة عبر بدر" },
        { pickup: "Madinah Hotel / Markazia", destination: "Badr Ziyarat", nameEn: "Madina to Badar", nameAr: "المدينة المنورة إلى غزوة بدر" },
        { pickup: "Makkah Hotel / Haram", destination: "Taif Ziyarat Tour", nameEn: "Makkah to Taif Ziyarat", nameAr: "مكة إلى مزارات الطائف" },
        { pickup: "Makkah Hotel / Haram", destination: "Makkah Ziyarat Tour", nameEn: "Makkah Ziyarat", nameAr: "مزارات مكة المكرمة" },
        { pickup: "Madinah Hotel / Markazia", destination: "Madinah Ziyarat Tour", nameEn: "Madina Ziyarat", nameAr: "مزارات المدينة المنورة" },
        { pickup: "Jeddah Airport (JED)", destination: "Jeddah Hotel / Corniche", nameEn: "Jeddah Airport to Jeddah Hotel", nameAr: "مطار جدة إلى فنادق جدة" },
        { pickup: "Makkah Hotel / Haram", destination: "Makkah Train Station (HHR)", nameEn: "Hotel to Train Station", nameAr: "من الفندق إلى محطة القطار" },
        { pickup: "Makkah Train Station (HHR)", destination: "Makkah Hotel / Haram", nameEn: "Train Station to Hotel", nameAr: "من محطة القطار إلى الفندق" },
        { pickup: "Full Day Chauffeur", destination: "8 Hours City Charter", nameEn: "Full Day (8 Hours)", nameAr: "خدمة يوم كامل (8 ساعات)" }
      ];

      const existingTripRoutes = await db.select().from(trip_routes).all();
      for (let i = 0; i < standardRoutes.length; i++) {
        const r = standardRoutes[i];
        const found = existingTripRoutes.find(er => er.pickup === r.pickup && er.destination === r.destination);
        if (!found) {
          await db.insert(trip_routes).values({ ...r, displayOrder: i + 1, isFeatured: true, status: 'active' });
        }
      }

      // Vehicle specific rates (exact 17 routes for each car)
      const rateMatrix: Record<string, number[]> = {
        "Toyota Camry": [200, 160, 350, 350, 150, 100, 350, 380, 430, 300, 350, 200, 200, 200, 150, 200, 600],
        "GMC XL 2025": [600, 450, 950, 950, 400, 350, 950, 1050, 1250, 900, 850, 400, 400, 400, 300, 350, 1400],
        "H1 HYUNDAI": [300, 250, 400, 400, 250, 200, 450, 550, 650, 500, 400, 250, 250, 250, 175, 200, 750],
        "STARIA": [350, 250, 500, 500, 270, 200, 550, 600, 700, 500, 500, 300, 300, 200, 200, 250, 800],
        "FORD TAURUS": [350, 250, 450, 450, 300, 200, 450, 500, 650, 450, 400, 250, 250, 225, 200, 230, 750],
        "TOYOTA HIACE": [400, 300, 700, 700, 300, 200, 750, 750, 850, 600, 600, 400, 400, 250, 250, 275, 1000],
        "LEXUS ES300h 2026": [550, 400, 650, 650, 350, 250, 700, 750, 950, 700, 700, 350, 350, 300, 250, 300, 1000],
        "TOYOTA COASTER 2025": [650, 500, 1000, 1000, 550, 450, 1050, 1100, 1200, 800, 800, 450, 450, 400, 350, 400, 1400],
        "BUS 2025": [850, 650, 1250, 1250, 650, 550, 1300, 1350, 1600, 950, 950, 500, 500, 500, 400, 450, 1600]
      };

      const existingTripRates = await db.select().from(trip_rates).all();
      for (const [vName, prices] of Object.entries(rateMatrix)) {
        const vId = vehicleMap.get(vName);
        if (!vId) continue;

        for (let i = 0; i < standardRoutes.length; i++) {
          const route = standardRoutes[i];
          const price = prices[i];
          const existingRate = existingTripRates.find(tr => tr.vehicleId === vId && tr.pickup === route.pickup && tr.destination === route.destination);
          if (!existingRate) {
            await db.insert(trip_rates).values({
              vehicleId: vId,
              pickup: route.pickup,
              destination: route.destination,
              price: price,
              status: 'active'
            });
          } else if (existingRate.price !== price) {
            await db.update(trip_rates).set({ price }).where(eq(trip_rates.id, existingRate.id));
          }
        }
      }

      // Ensure demonstration / seed booking exists for testing status checker
      try {
        const existingBookings = await db.select().from(bookings).limit(1).all();
        if (!existingBookings || existingBookings.length === 0) {
          await db.insert(bookings).values({
            bookingId: 'FUV-2026-88901',
            customerName: 'Sheikh Tariq Al-Mansoor',
            phone: '+966 50 123 4567',
            whatsapp: '+966 50 123 4567',
            email: 'guest@farisvip.com',
            pickup: 'Jeddah Airport (JED) Terminal 1',
            destination: 'Makkah Clock Royal Tower (Fairmont)',
            vehicleNameSnapshot: 'GMC Yukon XL 2025 (VIP)',
            passengers: 4,
            luggage: 5,
            tripType: 'One Way',
            date: '2026-09-05',
            time: '14:30',
            price: 600,
            priceMax: 650,
            currency: 'SAR',
            status: 'Confirmed',
            specialRequest: 'Child safety seat requested; Zamzam water on arrival.',
            createdAt: new Date().toISOString()
          });
        }

        // Seed initial 5-star testimonials (15 reviews)
        const initialReviews = [
          {
            customerName: "Brother Tariq Al-Mansoor",
            location: "London, UK (Jeddah Airport ➔ Makkah)",
            text: "Alhamdulillah! Booked the GMC Yukon XL 2025 for our family Umrah. The chauffeur was waiting inside Terminal 1 with our name board. Pristine luxury vehicle with cold Zamzam water bottles ready.",
            rating: 5,
            status: "active",
            displayOrder: 1
          },
          {
            customerName: "Haji Muhammad Farooq",
            location: "Toronto, Canada (Madinah ➔ Makkah)",
            text: "Flawless transfer on the Hijrah highway. Very smooth driving, comfortable reclining leather seats, and punctual pickup directly outside our Madinah Markazia hotel. Highly recommended!",
            rating: 5,
            status: "active",
            displayOrder: 2
          },
          {
            customerName: "Dr. Zainab & Family",
            location: "Chicago, USA (Full Day Sacred Ziyarat)",
            text: "Traveled with elderly parents and small children. The driver drove with immense patience, courteous manners, and guided us respectfully around Cave Hira, Mount Uhud and Masjid Quba.",
            rating: 5,
            status: "active",
            displayOrder: 3
          },
          {
            customerName: "Sheikh Abdulrahman",
            location: "Dubai, UAE (VIP Business Transfer)",
            text: "Top-tier VIP transportation in Saudi Arabia. Clear communication, fixed transparent rates with zero hidden charges, and brand new 2025 vehicles. Faris VIP is our permanent transport partner.",
            rating: 5,
            status: "active",
            displayOrder: 4
          },
          {
            customerName: "Sister Aisha Siddiqa",
            location: "Kuala Lumpur, Malaysia (Taif Day Tour)",
            text: "Remarkable service! The offline booking saved our details when our UK SIM had no network at airport arrival. Their 24/7 WhatsApp dispatch team resolved everything in seconds.",
            rating: 5,
            status: "active",
            displayOrder: 5
          },
          {
            customerName: "Brother Bilal Qureshi",
            location: "Manchester, UK (GMC Yukon XL 2025)",
            text: "The GMC XL 2025 easily accommodated all 7 of us and 8 large suitcases without cramming. Safe driving and professional courteous attitude. Jazakum Allah Khair!",
            rating: 5,
            status: "active",
            displayOrder: 6
          },
          {
            customerName: "Eng. Imran Khan",
            location: "Birmingham, UK (Jeddah Airport ➔ Makkah Clock Tower)",
            text: "Outstanding meet and greet at King Abdulaziz Airport Terminal 1. Flight landed 40 minutes late yet our executive chauffeur tracked it and greeted us with a welcoming smile. Exceptional hospitality.",
            rating: 5,
            status: "active",
            displayOrder: 7
          },
          {
            customerName: "Haji Ahmad Fauzi",
            location: "Jakarta, Indonesia (Makkah to Madinah VIP Bus)",
            text: "Our family group traveled together with elderly pilgrims. The vehicle was spotless, ice-cold dual AC, and the driver took prayer stops at clean highway service stations. Terima kasih!",
            rating: 5,
            status: "active",
            displayOrder: 8
          },
          {
            customerName: "Dr. Omar Al-Khatib",
            location: "Sydney, Australia (Sacred Ziyarat Makkah & Taif)",
            text: "Unbeatable knowledge of historical sites. Driver brother knew all the quiet prayer times at Jabal Thawr and guided us with great respect. Cleanest vehicle I've experienced in Saudi Arabia.",
            rating: 5,
            status: "active",
            displayOrder: 9
          },
          {
            customerName: "Sister Maryam & Brother Yasin",
            location: "Paris, France (Jeddah ➔ Madinah Express)",
            text: "Excellent luxury service. The baby seat was installed securely as requested, plenty of luggage space in the GMC Yukon, and smooth highway cruise. Will book again in Ramadan insha'Allah.",
            rating: 5,
            status: "active",
            displayOrder: 10
          },
          {
            customerName: "Brother Zeeshan Akhtar",
            location: "Lahore, Pakistan (Madinah Airport ➔ Markazia Hotel)",
            text: "Timely pickup right outside Prince Mohammad Airport. Driver helped with heavy luggage and provided complimentary cold Zamzam. Booking through WhatsApp was instant and easy.",
            rating: 5,
            status: "active",
            displayOrder: 11
          },
          {
            customerName: "Haji Sulaiman Bello",
            location: "Abuja, Nigeria (Makkah ➔ Madinah Executive Chauffeur)",
            text: "The vehicle condition was showroom brand new. Smooth driving without sudden braking, courteous chauffeur who recited travel supplications with us. 10/10 service.",
            rating: 5,
            status: "active",
            displayOrder: 12
          },
          {
            customerName: "Sister Fatima Noor",
            location: "Doha, Qatar (Full Day Private VIP Chauffeur)",
            text: "Had the chauffeur on standby for 8 hours for family shopping and visits. Polite, patient, and always waiting outside right when we walked out of the mall. Highly dependable.",
            rating: 5,
            status: "active",
            displayOrder: 13
          },
          {
            customerName: "Brother Hamza El-Masri",
            location: "Berlin, Germany (Jeddah Airport ➔ Makkah Hotel)",
            text: "Fair transparent pricing without the stressful haggling of street taxis. Fixed quote was honored exactly. Vehicle was pristine with high-speed phone chargers provided.",
            rating: 5,
            status: "active",
            displayOrder: 14
          },
          {
            customerName: "Ustadh Rashid Mahmud",
            location: "Singapore (Makkah & Madinah Complete Umrah Package)",
            text: "Booked all 4 legs of our Umrah trip including Ziyarat. Every single pickup was 10 minutes early. Drivers are true professionals who respect the sanctity of the pilgrimage.",
            rating: 5,
            status: "active",
            displayOrder: 15
          }
        ];

        const existingTestimonials = await db.select().from(testimonials).all();
        if (existingTestimonials.length < 15) {
          const existingNames = new Set(existingTestimonials.map(t => t.customerName));
          for (const rev of initialReviews) {
            if (!existingNames.has(rev.customerName)) {
              await db.insert(testimonials).values(rev);
            }
          }
        }
      } catch (seedErr) {
        console.warn("Sample booking check notice:", seedErr);
      }
    } catch (err) {
      console.error("Seeding error:", err);
    }
  })();

  // --- PUBLIC API ---

  // Auth Routes (Users)
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, phone, email, password } = req.body;
      const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
      if (existingUser) return res.status(400).json({ error: "Email already in use" });
      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = await db.insert(users).values({
        name, phone, email, passwordHash, createdAt: new Date().toISOString()
      }).returning().get();
      const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: newUser.id, name, phone, email } });
    } catch (error) {
      res.status(500).json({ error: "Failed to register" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await db.select().from(users).where(eq(users.email, email)).get();
      if (!user) return res.status(400).json({ error: "Invalid email or password" });
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return res.status(400).json({ error: "Invalid email or password" });
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user.id, name: user.name, phone: user.phone, email: user.email } });
    } catch (error) {
      res.status(500).json({ error: "Failed to log in" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: "No token" });
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      const user = await db.select().from(users).where(eq(users.id, decoded.id)).get();
      if (!user) return res.status(401).json({ error: "Invalid token" });
      res.json({ user: { id: user.id, name: user.name, phone: user.phone, email: user.email } });
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
    }
  });


  // Dedicated Service Worker Endpoint (Always fresh updates without browser cache lock)
  app.get("/sw.js", (req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Content-Type", "application/javascript");
    const swPath = path.join(process.cwd(), "public", "sw.js");
    if (fs.existsSync(swPath)) {
      res.sendFile(swPath);
    } else {
      res.status(404).send("// SW not found");
    }
  });

  app.get("/api/settings", async (req, res) => {
    try {
      res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      const cacheKey = "settings:global";
      const cached = getCachedData<Record<string, string>>(cacheKey);
      if (cached) return res.json(cached);

      const allSettings = await db.select().from(settings);
      const settingsObj: Record<string, string> = {};
      allSettings.forEach(s => settingsObj[s.key] = s.value);
      setCachedData(cacheKey, settingsObj, 600); // 10 min cache
      res.json(settingsObj);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.put("/api/admin/settings", verifyAdmin, async (req, res) => {
    try {
      const updates = req.body;
      for (const key of Object.keys(updates)) {
        const value = updates[key];
        if (value !== undefined) {
           await db.insert(settings)
             .values({ key, value: String(value) })
             .onConflictDoUpdate({ target: settings.key, set: { value: String(value) } });
        }
      }
      invalidateCacheTag("settings:");
      res.json({ success: true });
    } catch (error) { 
      res.status(500).json({ error: "Error updating settings" }); 
    }
  });

  // Page Custom Code Endpoints (HTML, CSS, JS, SEO for every page)
  app.get("/api/page_custom", async (req, res) => {
    try {
      res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      const allSettings = await db.select().from(settings);
      const pageConfigs: Record<string, any> = {};
      allSettings.forEach(s => {
        if (s.key.startsWith("page_code_")) {
          const pageKey = s.key.replace("page_code_", "");
          try {
            pageConfigs[pageKey] = JSON.parse(s.value);
          } catch {
            pageConfigs[pageKey] = { topHtml: s.value };
          }
        }
      });
      res.json(pageConfigs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch page custom configs" });
    }
  });

  app.get("/api/page_custom/:pageKey", async (req, res) => {
    try {
      res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      const { pageKey } = req.params;
      const setting = await db.select().from(settings).where(eq(settings.key, `page_code_${pageKey}`)).get();
      if (!setting) {
        return res.json({});
      }
      try {
        res.json(JSON.parse(setting.value));
      } catch {
        res.json({ topHtml: setting.value });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch page custom config" });
    }
  });

  app.put("/api/admin/page_custom/:pageKey", verifyAdmin, async (req, res) => {
    try {
      const { pageKey } = req.params;
      const data = req.body;
      const stringValue = JSON.stringify(data);
      await db.insert(settings)
        .values({ key: `page_code_${pageKey}`, value: stringValue })
        .onConflictDoUpdate({ target: settings.key, set: { value: stringValue } });

      invalidateCacheTag("settings:");
      invalidateCacheTag("page_custom:");
      res.json({ success: true, message: `Page code for ${pageKey} updated successfully` });
    } catch (error) {
      res.status(500).json({ error: "Error updating page custom config" });
    }
  });

  app.get("/api/whatsapp", async (req, res) => {
    try {
      res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      const cacheKey = "whatsapp:global";
      const cached = getCachedData<any>(cacheKey);
      if (cached) return res.json(cached);

      const settingsData = await db.select().from(whatsapp_settings).limit(1).get();
      setCachedData(cacheKey, settingsData, 600);
      res.json(settingsData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch whatsapp settings" });
    }
  });

  app.get("/api/vehicles", async (req, res) => {
    try {
      res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      const cacheKey = "vehicles:active";
      const cached = getCachedData<any[]>(cacheKey);
      if (cached) return res.json(cached);

      const allVehicles = await db.select().from(vehicles).where(eq(vehicles.status, 'active')).orderBy(vehicles.displayOrder);
      setCachedData(cacheKey, allVehicles, 600);
      res.json(allVehicles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });

  app.get("/api/routes", async (req, res) => {
    try {
      res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      const cacheKey = "routes:enriched";
      const cached = getCachedData<any[]>(cacheKey);
      if (cached) return res.json(cached);

      const routesData = await db.select().from(trip_routes).where(eq(trip_routes.status, 'active')).orderBy(trip_routes.displayOrder);
      const ratesData = await db.select().from(trip_rates).where(eq(trip_rates.status, 'active'));
      
      // Group all rates by pickup and destination
      const rateMap = new Map<string, typeof ratesData>();
      ratesData.forEach(r => {
        const key = `${r.pickup.toLowerCase().trim()}|${r.destination.toLowerCase().trim()}`;
        if (!rateMap.has(key)) rateMap.set(key, []);
        rateMap.get(key)!.push(r);
      });

      const routeKeysSeen = new Set<string>();
      const enrichedRoutes: any[] = [];

      // 1. Process existing trip_routes
      for (const route of routesData) {
        const key = `${route.pickup.toLowerCase().trim()}|${route.destination.toLowerCase().trim()}`;
        routeKeysSeen.add(key);
        const routeRates = rateMap.get(key) || [];
        const prices = routeRates.map(r => r.price).filter(p => p > 0);
        const maxPrices = routeRates.map(r => r.priceMax && r.priceMax > r.price ? r.priceMax : r.price).filter(p => p > 0);
        enrichedRoutes.push({
          ...route,
          rates: routeRates,
          minPrice: prices.length ? Math.min(...prices) : 0,
          maxPrice: maxPrices.length ? Math.max(...maxPrices) : 0,
          vehicleCount: prices.length
        });
      }

      // 2. Add any routes found in trip_rates that weren't explicitly in trip_routes
      let autoId = 2000;
      for (const [key, rRates] of rateMap.entries()) {
        if (!routeKeysSeen.has(key) && rRates.length > 0) {
          const first = rRates[0];
          const prices = rRates.map(r => r.price).filter(p => p > 0);
          const maxPrices = rRates.map(r => r.priceMax && r.priceMax > r.price ? r.priceMax : r.price).filter(p => p > 0);
          enrichedRoutes.push({
            id: autoId++,
            pickup: first.pickup,
            destination: first.destination,
            nameEn: `${first.pickup} to ${first.destination}`,
            nameAr: `${first.pickup} إلى ${first.destination}`,
            status: 'active',
            displayOrder: 99,
            isFeatured: false,
            rates: rRates,
            minPrice: prices.length ? Math.min(...prices) : 0,
            maxPrice: maxPrices.length ? Math.max(...maxPrices) : 0,
            vehicleCount: prices.length
          });
        }
      }
      
      setCachedData(cacheKey, enrichedRoutes, 600);
      res.json(enrichedRoutes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch routes" });
    }
  });

  app.get("/api/testimonials", async (req, res) => {
    try {
      const cacheKey = "testimonials:active";
      const cached = getCachedData<any[]>(cacheKey);
      if (cached) return res.json(cached);

      const allTestimonials = await db.select().from(testimonials).where(eq(testimonials.status, 'active')).orderBy(testimonials.displayOrder);
      setCachedData(cacheKey, allTestimonials, 600);
      res.json(allTestimonials);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch testimonials" });
    }
  });

  app.post("/api/calculate-fare", async (req, res) => {
    const { pickup, destination, vehicleId, tripType } = req.body;
    try {
      const vId = Number(vehicleId);
      let matchedRate = null;

      if (pickup && destination && vId) {
        // Exact match check
        matchedRate = await db.select().from(trip_rates).where(
          and(
            eq(trip_rates.pickup, pickup),
            eq(trip_rates.destination, destination),
            eq(trip_rates.vehicleId, vId),
            eq(trip_rates.status, 'active')
          )
        ).get();

        // Fuzzy match if exact not found
        if (!matchedRate) {
          const allRates = await db.select().from(trip_rates).where(
            and(eq(trip_rates.vehicleId, vId), eq(trip_rates.status, 'active'))
          );
          const pNorm = pickup.toLowerCase().replace(/[^a-z0-9]/g, '');
          const dNorm = destination.toLowerCase().replace(/[^a-z0-9]/g, '');
          matchedRate = allRates.find(r => {
            const rPNorm = r.pickup.toLowerCase().replace(/[^a-z0-9]/g, '');
            const rDNorm = r.destination.toLowerCase().replace(/[^a-z0-9]/g, '');
            return (rPNorm === pNorm || (rPNorm.length >= 3 && pNorm.includes(rPNorm)) || (pNorm.length >= 3 && rPNorm.includes(pNorm))) &&
                   (rDNorm === dNorm || (rDNorm.length >= 3 && dNorm.includes(rDNorm)) || (dNorm.length >= 3 && rDNorm.includes(dNorm)));
          });
        }
      }

      let isBackendMatched = false;
      let basePrice = 0;

      if (matchedRate && matchedRate.price > 0) {
        basePrice = matchedRate.price;
        isBackendMatched = true;
      } else if (tripType === 'Full Day') {
        const v = vId ? await db.select().from(vehicles).where(eq(vehicles.id, vId)).get() : null;
        const vBase = v?.startingPrice || 300;
        basePrice = Math.round(vBase * 2.0);
        isBackendMatched = true;
      }

      if (isBackendMatched && basePrice > 0) {
        if (tripType === 'Round Trip') {
          basePrice *= 2;
        }

        const minRange = Math.max(100, Math.floor((basePrice * 0.9) / 10) * 10);
        const maxRange = Math.max(minRange + 40, Math.ceil((basePrice * 1.15) / 10) * 10);

        return res.json({
          isMatched: true,
          estimatedPrice: basePrice,
          minPrice: minRange,
          maxPrice: maxRange,
          formattedRange: `${minRange} – ${maxRange} SAR`
        });
      }

      // If location is NOT in backend: write "Contact on WhatsApp"
      return res.json({
        isMatched: false,
        estimatedPrice: 0,
        minPrice: 0,
        maxPrice: 0,
        formattedRange: "Contact on WhatsApp"
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to calculate fare" });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = req.body;
      const bookingId = `FUV-${new Date().getFullYear()}-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
      
      // Get vehicle snapshot
      const vehicle = await db.select().from(vehicles).where(eq(vehicles.id, bookingData.vehicleId)).get();
      
      const newBooking = {
        ...bookingData,
        bookingId,
        vehicleNameSnapshot: vehicle ? vehicle.name : "Unknown Vehicle",
        status: "Pending",
        createdAt: new Date().toISOString()
      };
      
      await db.insert(bookings).values(newBooking);
      
      // Update customer stats if userId is present
      if (bookingData.userId) {
        const user = await db.select().from(users).where(eq(users.id, bookingData.userId)).get();
        if (user) {
          await db.update(users).set({
            totalBookings: (user.totalBookings || 0) + 1,
            totalSpent: (user.totalSpent || 0) + bookingData.price,
            lastBookingDate: new Date().toISOString()
          }).where(eq(users.id, bookingData.userId));
        }
      }

      res.json({ success: true, bookingId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

  app.get("/api/bookings", async (req, res) => {
    try {
      const userId = req.query.userId;
      if (userId) {
        const userBookings = await db.select().from(bookings).where(eq(bookings.userId, Number(userId))).orderBy(desc(bookings.createdAt));
        res.json(userBookings);
      } else {
        res.status(401).json({ error: "Unauthorized" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  // Public Booking Status Tracking by Reference ID or Numeric ID
  app.get("/api/bookings/track/:bookingId", async (req, res) => {
    try {
      const rawId = (req.params.bookingId || "").trim();
      if (!rawId) {
        return res.status(400).json({ found: false, error: "Booking reference ID is required" });
      }

      // 1. Direct or case-insensitive match on booking_id
      let booking = await db.select().from(bookings).where(sql`lower(${bookings.bookingId}) = lower(${rawId})`).get();

      // 2. If not found and input is numeric, match by primary key id
      if (!booking && !isNaN(Number(rawId))) {
        booking = await db.select().from(bookings).where(eq(bookings.id, Number(rawId))).get();
      }

      // 3. Partial match if prefixed or without dashes
      if (!booking && rawId.length >= 4) {
        const cleaned = rawId.replace(/[^a-zA-Z0-9]/g, '');
        booking = await db.select().from(bookings).where(sql`replace(lower(${bookings.bookingId}), '-', '') LIKE lower(${'%' + cleaned + '%'})`).get();
      }

      if (!booking) {
        return res.status(404).json({
          found: false,
          error: "No booking found with this reference ID. Please verify your reference or contact 24/7 WhatsApp dispatch."
        });
      }

      // Resolve vehicle name
      let vehicleName = booking.vehicleNameSnapshot;
      if (!vehicleName && booking.vehicleId) {
        const v = await db.select().from(vehicles).where(eq(vehicles.id, booking.vehicleId)).get();
        if (v) vehicleName = v.name;
      }

      // Phone masking for guest privacy (shows +966 50 •••• 4567)
      let maskedPhone = "";
      if (booking.phone) {
        const p = booking.phone.trim();
        if (p.length > 6) {
          maskedPhone = p.slice(0, 4) + " •••• " + p.slice(-3);
        } else {
          maskedPhone = "••••";
        }
      }

      res.json({
        found: true,
        booking: {
          id: booking.id,
          bookingId: booking.bookingId,
          customerName: booking.customerName || "Valued Pilgrim",
          maskedPhone,
          pickup: booking.pickup,
          destination: booking.destination,
          tripType: booking.tripType || "One Way",
          date: booking.date,
          time: booking.time,
          vehicleName: vehicleName || "VIP Luxury Chauffeur",
          passengers: booking.passengers,
          luggage: booking.luggage || 0,
          price: booking.price,
          priceMax: booking.priceMax,
          currency: booking.currency || "SAR",
          status: booking.status || "Confirmed",
          driverName: booking.driverName || null,
          driverPhone: booking.driverPhone || null,
          driverPlate: booking.driverPlate || null,
          createdAt: booking.createdAt,
          specialRequest: booking.specialRequest || null
        }
      });
    } catch (error) {
      console.error("Booking tracking lookup error:", error);
      res.status(500).json({ found: false, error: "Failed to look up booking status" });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      await db.insert(contact_messages).values({
        ...req.body,
        createdAt: new Date().toISOString()
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit message" });
    }
  });

  // --- ADMIN API ---

  async function logActivity(req: any, action: string, module: string, recordId?: string, description?: string) {
    try {
      const user = req.user || {};
      const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      await db.run(sql`
        INSERT INTO activity_logs (user_id, username, name, role, action, module, record_id, description, ip_address, user_agent, created_at)
        VALUES (${user.id || null}, ${user.username || 'system'}, ${user.name || 'System'}, ${user.role || 'system'}, ${action}, ${module}, ${recordId || null}, ${description || null}, ${ipAddress}, ${userAgent}, ${new Date().toISOString()})
      `);
    } catch (err) {
      console.error("Error logging activity:", err);
    }
  }

  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const admin = await db.select().from(admins).where(eq(admins.username, username)).get();
      if (!admin) return res.status(401).json({ error: "Invalid credentials" });
      if (admin.status === 'inactive') return res.status(403).json({ error: "Account is inactive/suspended" });

      const valid = await bcrypt.compare(password, admin.passwordHash);
      if (!valid) return res.status(401).json({ error: "Invalid credentials" });

      const token = jwt.sign({ 
        id: admin.id, 
        username: admin.username, 
        name: admin.name || 'Admin', 
        role: admin.role || 'admin' 
      }, JWT_SECRET, { expiresIn: '7d' });

      try {
        await db.update(admins).set({ lastLogin: new Date().toISOString() }).where(eq(admins.id, admin.id));
      } catch (e) {}

      (req as any).user = { id: admin.id, username: admin.username, name: admin.name, role: admin.role };
      await logActivity(req, 'LOGIN', 'Auth', String(admin.id), `Admin user ${admin.username} (${admin.role}) logged in successfully`);

      res.json({ 
        token, 
        user: { 
          id: admin.id, 
          username: admin.username, 
          name: admin.name, 
          role: admin.role 
        } 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  function verifyAdmin(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthorized" });
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (!decoded || !decoded.id) throw new Error();
      (req as any).user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: "Unauthorized" });
    }
  };

  function verifyRole(allowedRoles: string[]) {
    return [
      verifyAdmin,
      (req: any, res: any, next: any) => {
        if (!req.user || (req.user.role !== 'master_admin' && !allowedRoles.includes(req.user.role))) {
          return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
        }
        next();
      }
    ];
  }

  // Master Admin Users CRUD
  app.get("/api/admin/users", verifyRole(['master_admin']), async (req, res) => {
    try {
      const allUsers = await db.select().from(admins).orderBy(desc(admins.id));
      res.json(allUsers.map((u: any) => ({
        id: u.id,
        username: u.username,
        name: u.name,
        role: u.role,
        status: u.status,
        lastLogin: u.lastLogin || u.last_login,
        createdAt: u.createdAt || u.created_at
      })));
    } catch (e) {
      res.status(500).json({ error: "Error fetching users" });
    }
  });

  app.post("/api/admin/users", verifyRole(['master_admin']), async (req, res) => {
    try {
      const { username, name, password, role, status } = req.body;
      if (!username || !password || !name) {
        return res.status(400).json({ error: "Username, password and name are required" });
      }
      const existing = await db.select().from(admins).where(eq(admins.username, username)).get();
      if (existing) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const now = new Date().toISOString();
      await db.run(sql`
        INSERT INTO admins (name, username, password_hash, role, status, created_at)
        VALUES (${name}, ${username}, ${passwordHash}, ${role || 'admin'}, ${status || 'active'}, ${now})
      `);

      await logActivity(req, 'CREATE_USER', 'Users', username, `Created admin user ${username} with role ${role}`);
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Error creating user" });
    }
  });

  app.put("/api/admin/users/:id", verifyRole(['master_admin']), async (req, res) => {
    try {
      const userId = Number(req.params.id);
      const { username, name, password, role, status } = req.body;
      const updateData: any = {};
      if (username) updateData.username = username;
      if (name) updateData.name = name;
      if (role) updateData.role = role;
      if (status) updateData.status = status;
      if (password) {
        updateData.password_hash = await bcrypt.hash(password, 10);
      }

      await db.update(admins).set(updateData).where(eq(admins.id, userId));
      await logActivity(req, 'UPDATE_USER', 'Users', String(userId), `Updated admin user ID ${userId}`);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Error updating user" });
    }
  });

  app.delete("/api/admin/users/:id", verifyRole(['master_admin']), async (req, res) => {
    try {
      const userId = Number(req.params.id);
      const target = await db.select().from(admins).where(eq(admins.id, userId)).get();
      if (target && target.username === 'vip123') {
        return res.status(403).json({ error: "Cannot delete primary master admin" });
      }
      await db.delete(admins).where(eq(admins.id, userId));
      await logActivity(req, 'DELETE_USER', 'Users', String(userId), `Deleted admin user ID ${userId}`);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Error deleting user" });
    }
  });

  app.get("/api/admin/activity", verifyRole(['master_admin']), async (req, res) => {
    try {
      const logs = await db.select().from(activity_logs).orderBy(desc(activity_logs.id)).limit(200);
      res.json(logs.map((l: any) => ({
        id: l.id,
        userId: l.userId || l.user_id,
        username: l.username,
        name: l.name,
        role: l.role,
        action: l.action,
        module: l.module,
        recordId: l.recordId || l.record_id,
        description: l.description,
        ipAddress: l.ipAddress || l.ip_address,
        userAgent: l.userAgent || l.user_agent,
        createdAt: l.createdAt || l.created_at
      })));
    } catch (e) {
      res.status(500).json({ error: "Error fetching activity logs" });
    }
  });

  // Driver Portal Endpoints
  app.get("/api/admin/driver/bookings", verifyAdmin, async (req, res) => {
    try {
      const user = (req as any).user;
      let allBookings;
      if (user.role === 'driver') {
        allBookings = await db.select().from(bookings).where(sql`driver_name_snapshot LIKE ${'%' + user.name + '%'}`).orderBy(desc(bookings.createdAt));
        if (allBookings.length === 0) {
          allBookings = await db.select().from(bookings).orderBy(desc(bookings.createdAt)).limit(25);
        }
      } else {
        allBookings = await db.select().from(bookings).orderBy(desc(bookings.createdAt));
      }
      res.json(allBookings);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Error fetching driver bookings" });
    }
  });

  app.put("/api/admin/driver/bookings/:id/status", verifyAdmin, async (req, res) => {
    try {
      const bookingIdNum = Number(req.params.id);
      const { status } = req.body;
      if (!status) return res.status(400).json({ error: "Status required" });

      await db.update(bookings).set({
        status,
        updatedAt: new Date().toISOString()
      }).where(eq(bookings.id, bookingIdNum));

      await logActivity(req, 'UPDATE_BOOKING_STATUS', 'Orders', String(bookingIdNum), `Driver/Admin updated trip status to ${status}`);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Error updating trip status" });
    }
  });

  app.get("/api/admin/bookings", verifyAdmin, async (req, res) => {
    try {
      const allBookings = await db.select().from(bookings).orderBy(desc(bookings.createdAt));
      res.json(allBookings);
    } catch (error) { res.status(500).json({ error: "Error fetching bookings" }); }
  });

  app.post("/api/admin/bookings", verifyAdmin, async (req, res) => {
    try {
      const bookingData = req.body;
      const bookingId = bookingData.bookingId || `FUV-${new Date().getFullYear()}-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
      
      const vehicle = bookingData.vehicleId 
        ? await db.select().from(vehicles).where(eq(vehicles.id, Number(bookingData.vehicleId))).get() 
        : null;

      const newBooking = {
        ...bookingData,
        vehicleId: bookingData.vehicleId ? Number(bookingData.vehicleId) : null,
        bookingId,
        vehicleNameSnapshot: bookingData.vehicleNameSnapshot || (vehicle ? vehicle.name : "VIP Transport"),
        status: bookingData.status || "Confirmed",
        price: Number(bookingData.price) || 0,
        passengers: Number(bookingData.passengers) || 1,
        luggage: Number(bookingData.luggage) || 0,
        createdAt: new Date().toISOString()
      };

      const inserted = await db.insert(bookings).values(newBooking).returning().get();
      res.json({ success: true, booking: inserted });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error creating booking" });
    }
  });

  app.put("/api/admin/bookings/:id", verifyAdmin, async (req, res) => {
    try {
      const updateData = { ...req.body, updatedAt: new Date().toISOString() };
      if (updateData.id) delete updateData.id;
      if (updateData.price) updateData.price = Number(updateData.price);
      if (updateData.passengers) updateData.passengers = Number(updateData.passengers);
      if (updateData.luggage) updateData.luggage = Number(updateData.luggage);
      if (updateData.vehicleId) updateData.vehicleId = Number(updateData.vehicleId);

      await db.update(bookings).set(updateData).where(eq(bookings.id, Number(req.params.id)));
      res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Error updating booking" }); }
  });

  app.delete("/api/admin/bookings/:id", verifyAdmin, async (req, res) => {
    try {
      await db.delete(bookings).where(eq(bookings.id, Number(req.params.id)));
      res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Error deleting booking" }); }
  });

  // Assign Driver to Booking
  app.post("/api/admin/bookings/:id/assign-driver", verifyAdmin, async (req, res) => {
    try {
      const bookingIdNum = Number(req.params.id);
      const { driverId, driverName, driverPhone, driverPlate, status } = req.body;
      
      let finalDriverId = driverId ? Number(driverId) : null;
      let finalDriverName = driverName || '';
      let finalDriverPhone = driverPhone || '';

      if (finalDriverId && (!finalDriverName || !finalDriverPhone)) {
        const found = await db.select().from(drivers).where(eq(drivers.id, finalDriverId)).get();
        if (found) {
          finalDriverName = found.name;
          finalDriverPhone = found.phone;
        }
      }

      await db.update(bookings).set({
        driverId: finalDriverId,
        driverNameSnapshot: finalDriverName,
        driverPhoneSnapshot: finalDriverPhone,
        driverName: finalDriverName,
        driverPhone: finalDriverPhone,
        driverPlate: driverPlate || undefined,
        status: status || 'Chauffeur Assigned',
        updatedAt: new Date().toISOString()
      }).where(eq(bookings.id, bookingIdNum));

      res.json({ 
        success: true, 
        driver_id: finalDriverId,
        driver_name_snapshot: finalDriverName, 
        driver_phone_snapshot: finalDriverPhone 
      });
    } catch (error) { 
      console.error(error);
      res.status(500).json({ error: "Error assigning driver" }); 
    }
  });

  // Admin Drivers Management
  app.get("/api/admin/drivers", verifyAdmin, async (req, res) => {
    try {
      const allDrivers = await db.select().from(drivers).orderBy(desc(drivers.id));
      res.json(allDrivers);
    } catch (error) { res.status(500).json({ error: "Error fetching drivers" }); }
  });

  app.post("/api/admin/drivers", verifyAdmin, async (req, res) => {
    try {
      const { name, phone, vehicleInfo, vehicle_info, status } = req.body;
      if (!name || !phone) {
        return res.status(400).json({ error: "Driver name and mobile/WhatsApp are required" });
      }
      const now = new Date().toISOString();
      const newDriver = {
        name: String(name).trim(),
        phone: String(phone).trim(),
        vehicleInfo: vehicleInfo || vehicle_info || null,
        status: status || 'active',
        createdAt: now,
        updatedAt: now,
      };
      const inserted = await db.insert(drivers).values(newDriver).returning().get();
      res.json({ success: true, driver: inserted });
    } catch (error) { 
      console.error(error);
      res.status(500).json({ error: "Error creating driver" }); 
    }
  });

  app.put("/api/admin/drivers/:id", verifyAdmin, async (req, res) => {
    try {
      const { name, phone, vehicleInfo, vehicle_info, status } = req.body;
      const updateData: any = {
        updatedAt: new Date().toISOString(),
      };
      if (name !== undefined) updateData.name = String(name).trim();
      if (phone !== undefined) updateData.phone = String(phone).trim();
      if (vehicleInfo !== undefined || vehicle_info !== undefined) {
        updateData.vehicleInfo = vehicleInfo !== undefined ? vehicleInfo : vehicle_info;
      }
      if (status !== undefined) updateData.status = status;

      await db.update(drivers).set(updateData).where(eq(drivers.id, Number(req.params.id)));
      res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Error updating driver" }); }
  });

  app.delete("/api/admin/drivers/:id", verifyAdmin, async (req, res) => {
    try {
      await db.delete(drivers).where(eq(drivers.id, Number(req.params.id)));
      res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Error deleting driver" }); }
  });

  app.get("/api/admin/vehicles", verifyAdmin, async (req, res) => {
    try {
      const allVehicles = await db.select().from(vehicles).orderBy(vehicles.displayOrder);
      res.json(allVehicles);
    } catch (error) { res.status(500).json({ error: "Error fetching vehicles" }); }
  });

  app.post("/api/admin/vehicles", verifyAdmin, async (req, res) => {
    try {
      await db.insert(vehicles).values(req.body);
      invalidateCacheTag("vehicles:");
      invalidateCacheTag("routes:");
      res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Error creating vehicle" }); }
  });

  app.put("/api/admin/vehicles/:id", verifyAdmin, async (req, res) => {
    try {
      await db.update(vehicles).set(req.body).where(eq(vehicles.id, Number(req.params.id)));
      invalidateCacheTag("vehicles:");
      invalidateCacheTag("routes:");
      res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Error updating vehicle" }); }
  });

  app.delete("/api/admin/vehicles/:id", verifyAdmin, async (req, res) => {
    try {
      // Soft delete/deactivate instead of hard delete to preserve data relation integrity if needed
      await db.update(vehicles).set({ status: 'archived' }).where(eq(vehicles.id, Number(req.params.id)));
      invalidateCacheTag("vehicles:");
      invalidateCacheTag("routes:");
      res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Error archiving vehicle" }); }
  });

  // Admin Trip Routes
  app.get("/api/admin/trip_routes", verifyAdmin, async (req, res) => {
    try {
      const allRoutes = await db.select().from(trip_routes).orderBy(trip_routes.displayOrder);
      res.json(allRoutes);
    } catch (error) { res.status(500).json({ error: "Error fetching routes" }); }
  });

  app.post("/api/admin/trip_routes", verifyAdmin, async (req, res) => {
    try {
      await db.insert(trip_routes).values(req.body);
      invalidateCacheTag("routes:");
      res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Error creating route" }); }
  });

  app.put("/api/admin/trip_routes/:id", verifyAdmin, async (req, res) => {
    try {
      await db.update(trip_routes).set(req.body).where(eq(trip_routes.id, Number(req.params.id)));
      invalidateCacheTag("routes:");
      res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Error updating route" }); }
  });

  app.delete("/api/admin/trip_routes/:id", verifyAdmin, async (req, res) => {
    try {
      await db.delete(trip_routes).where(eq(trip_routes.id, Number(req.params.id)));
      invalidateCacheTag("routes:");
      res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Error deleting route" }); }
  });

  // Admin Trip Rates
  app.get("/api/admin/trip_rates", verifyAdmin, async (req, res) => {
    try {
      const allRates = await db.select().from(trip_rates);
      res.json(allRates);
    } catch (error) { res.status(500).json({ error: "Error fetching rates" }); }
  });

  app.post("/api/admin/trip_rates", verifyAdmin, async (req, res) => {
    try {
      await db.insert(trip_rates).values(req.body);
      invalidateCacheTag("routes:");
      res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Error creating rate" }); }
  });

  app.put("/api/admin/trip_rates/:id", verifyAdmin, async (req, res) => {
    try {
      await db.update(trip_rates).set(req.body).where(eq(trip_rates.id, Number(req.params.id)));
      invalidateCacheTag("routes:");
      res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Error updating rate" }); }
  });

  app.delete("/api/admin/trip_rates/:id", verifyAdmin, async (req, res) => {
    try {
      await db.delete(trip_rates).where(eq(trip_rates.id, Number(req.params.id)));
      invalidateCacheTag("routes:");
      res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Error deleting rate" }); }
  });

  app.get("/api/admin/customers", verifyAdmin, async (req, res) => {
    try {
      const allCustomers = await db.select().from(users).orderBy(desc(users.createdAt));
      res.json(allCustomers);
    } catch (error) { res.status(500).json({ error: "Error fetching customers" }); }
  });

  app.delete("/api/admin/customers/:id", verifyAdmin, async (req, res) => {
    try {
      await db.delete(users).where(eq(users.id, Number(req.params.id)));
      res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Error deleting customer" }); }
  });

  app.get("/api/admin/messages", verifyAdmin, async (req, res) => {
    try {
      const allMessages = await db.select().from(contact_messages).orderBy(desc(contact_messages.createdAt));
      res.json(allMessages);
    } catch (error) { res.status(500).json({ error: "Error fetching messages" }); }
  });
  
  app.put("/api/admin/messages/:id", verifyAdmin, async (req, res) => {
    try {
      await db.update(contact_messages).set({ status: req.body.status }).where(eq(contact_messages.id, Number(req.params.id)));
      res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Error updating message" }); }
  });

  app.delete("/api/admin/messages/:id", verifyAdmin, async (req, res) => {
    try {
      await db.delete(contact_messages).where(eq(contact_messages.id, Number(req.params.id)));
      res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Error deleting message" }); }
  });

  // --- Source Code Editor Endpoints (Advanced) ---
  app.get("/api/admin/source/:filename", verifyAdmin, async (req, res) => {
    try {
      const { filename } = req.params;
      if (!filename.endsWith('.tsx') && !filename.endsWith('.ts')) {
        return res.status(403).json({ error: "Invalid file type. Only .tsx or .ts allowed." });
      }
      if (filename.includes('/') || filename.includes('..')) {
        return res.status(403).json({ error: "Path traversal not allowed." });
      }
      
      const filePath = path.join(process.cwd(), 'src', 'pages', filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      res.json({ content });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error reading source file" });
    }
  });

  app.post("/api/admin/source/:filename", verifyAdmin, express.json({limit: '2mb'}), async (req, res) => {
    try {
      const { filename } = req.params;
      const { content } = req.body;
      
      if (!filename.endsWith('.tsx') && !filename.endsWith('.ts')) {
        return res.status(403).json({ error: "Invalid file type. Only .tsx or .ts allowed." });
      }
      if (filename.includes('/') || filename.includes('..')) {
        return res.status(403).json({ error: "Path traversal not allowed." });
      }
      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }

      const filePath = path.join(process.cwd(), 'src', 'pages', filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
      }

      fs.writeFileSync(filePath, content, 'utf-8');
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error saving source file" });
    }
  });

  app.put("/api/admin/whatsapp", verifyAdmin, async (req, res) => {
    try {
      await db.update(whatsapp_settings).set(req.body).where(eq(whatsapp_settings.id, 1));
      invalidateCacheTag("whatsapp:");
      res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Error updating whatsapp settings" }); }
  });

  // Admin Testimonials Management
  app.get("/api/admin/testimonials", verifyAdmin, async (req, res) => {
    try {
      const all = await db.select().from(testimonials).orderBy(testimonials.displayOrder, desc(testimonials.id));
      res.json(all);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch testimonials" });
    }
  });

  app.post("/api/admin/testimonials", verifyAdmin, async (req, res) => {
    try {
      const { customerName, location, text, rating, status, displayOrder } = req.body;
      if (!customerName || !text) {
        return res.status(400).json({ error: "Customer name and review text are required" });
      }
      const [inserted] = await db.insert(testimonials).values({
        customerName,
        location: location || "",
        text,
        rating: Number(rating) || 5,
        status: status || "active",
        displayOrder: Number(displayOrder) || 0
      }).returning();
      setCachedData("testimonials:active", null, 0); // invalidate cache
      res.json(inserted);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create testimonial" });
    }
  });

  app.put("/api/admin/testimonials/:id", verifyAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { customerName, location, text, rating, status, displayOrder } = req.body;
      await db.update(testimonials).set({
        ...(customerName !== undefined && { customerName }),
        ...(location !== undefined && { location }),
        ...(text !== undefined && { text }),
        ...(rating !== undefined && { rating: Number(rating) }),
        ...(status !== undefined && { status }),
        ...(displayOrder !== undefined && { displayOrder: Number(displayOrder) })
      }).where(eq(testimonials.id, id));
      setCachedData("testimonials:active", null, 0); // invalidate cache
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update testimonial" });
    }
  });

  app.delete("/api/admin/testimonials/:id", verifyAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await db.delete(testimonials).where(eq(testimonials.id, id));
      setCachedData("testimonials:active", null, 0); // invalidate cache
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete testimonial" });
    }
  });

  // Admin Cache Management
  app.post("/api/admin/cache/clear", verifyAdmin, async (req, res) => {
    try {
      const count = clearAllCache();
      res.json({ 
        success: true, 
        message: "Cache removed successfully across all endpoints", 
        keysCleared: count,
        timestamp: lastCachePurgeTime 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear cache" });
    }
  });

  app.get("/api/admin/cache/status", verifyAdmin, async (req, res) => {
    try {
      res.json({
        cacheEntries: memoryCache.size,
        totalHits: totalCacheHits,
        lastPurgedAt: lastCachePurgeTime,
        status: "operational"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cache status" });
    }
  });

  app.get("/sitemap.xml", async (req, res) => {
    try {
      const allSettings = await db.select().from(settings);
      const settingsObj: Record<string, string> = {};
      allSettings.forEach(s => settingsObj[s.key] = s.value);
      const domain = settingsObj.websiteDomain || "FarisVIPUmrahTransport.com";
      
      const routes = [
        "",
        "about-us",
        "vehicles",
        "routes-rates",
        "services",
        "ziyarat",
        "faq",
        "contact",
        "terms",
        "privacy",
        "booking"
      ];

      const urlset = routes.map(route => `  <url>
    <loc>https://${domain}/${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>${route === "" ? "1.0" : "0.8"}</priority>
  </url>`).join('\n');

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>`;
      res.header("Content-Type", "application/xml");
      res.send(sitemap);
    } catch (e) {
      res.status(500).send("Error generating sitemap");
    }
  });

  app.get("/robots.txt", async (req, res) => {
    try {
      const allSettings = await db.select().from(settings);
      const settingsObj: Record<string, string> = {};
      allSettings.forEach(s => settingsObj[s.key] = s.value);
      const domain = settingsObj.websiteDomain || "FarisVIPUmrahTransport.com";
      const robots = `User-agent: *
Allow: /
Sitemap: https://${domain}/sitemap.xml`;
      res.header("Content-Type", "text/plain");
      res.send(robots);
    } catch (e) {
      res.status(500).send("Error generating robots.txt");
    }
  });


  // --- Dynamic WebP Image Optimization Middleware ---
  app.use(async (req, res, next) => {
    // Only process GET requests for jpg/png images
    if (req.method !== 'GET') return next();
    
    const isImage = /\.(jpg|jpeg|png)$/i.test(req.path);
    if (!isImage) return next();

    // Check if the client accepts WebP
    const acceptsWebp = req.headers.accept && req.headers.accept.includes('image/webp');
    if (!acceptsWebp) return next();

    try {
      
      
      
      // Determine the real file path (checking both dist and public/src based on env)
      const isProd = process.env.NODE_ENV === 'production';
      const baseDirs = isProd 
        ? [path.join(process.cwd(), 'dist')]
        : [path.join(process.cwd(), 'public')];
      
      let originalFilePath = null;
      for (const dir of baseDirs) {
        const checkPath = path.join(dir, req.path);
        if (fs.existsSync(checkPath)) {
          originalFilePath = checkPath;
          break;
        }
      }

      if (!originalFilePath) return next();

      // Create a cache directory inside process.cwd()
      const cacheDir = path.join(process.cwd(), '.image-cache');
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      // Generate a cache file name based on the original file path
      
      const fileHash = crypto.createHash('md5').update(req.path).digest('hex');
      const webpFileName = `${fileHash}.webp`;
      const webpFilePath = path.join(cacheDir, webpFileName);

      // If the WebP version doesn't exist or is older than the original, generate it
      let generate = true;
      if (fs.existsSync(webpFilePath)) {
        const origStats = fs.statSync(originalFilePath);
        const webpStats = fs.statSync(webpFilePath);
        if (webpStats.mtime >= origStats.mtime) {
          generate = false;
        }
      }

      if (generate) {
        await sharp(originalFilePath)
          .webp({ quality: 80, effort: 4 })
          .toFile(webpFilePath);
      }

      // Serve the generated WebP file
      res.setHeader('Content-Type', 'image/webp');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.sendFile(webpFilePath);
      
    } catch (error) {
      console.error('Dynamic WebP Error:', error);
      return next(); // Fallback to original image if error occurs
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: { port: 0 } },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = fs.existsSync(path.join(process.cwd(), 'dist'))
      ? path.join(process.cwd(), 'dist')
      : path.resolve(__dirname);

    app.use(express.static(distPath, { 
      maxAge: '1y', 
      immutable: true,
      index: false,
      setHeaders: (res, pathUrl) => {
        if (pathUrl.endsWith('.html')) {
          res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        } else if (pathUrl.match(/\.(js|css|webp|png|jpg|jpeg|svg|woff2|woff|br|gz)$/)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      }
    }));

    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/') || req.path === '/robots.txt' || req.path === '/sitemap.xml') {
        return next();
      }
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send(`<!DOCTYPE html><html><head><title>Faris VIP Umrah Transport</title><meta http-equiv="refresh" content="3"></head><body style="font-family:sans-serif;text-align:center;padding:50px;background:#090d16;color:#fff;"><h2>Faris VIP Umrah Transport</h2><p>Starting service, please wait a moment...</p></body></html>`);
      }
    });
  }

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Server Error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.disable("x-powered-by");

  // Listen on port 3000 (Required by AI Studio dev preview reverse proxy)
  const primaryPort = 3000;
  const envPort = process.env.PORT ? parseInt(process.env.PORT, 10) : null;

  const primaryServer = app.listen(primaryPort, "0.0.0.0", () => {
    console.log(`Primary server listening on http://0.0.0.0:${primaryPort}`);
  });
  primaryServer.on("error", (err: any) => {
    if (err.code !== "EADDRINUSE") {
      console.error(`Error on port ${primaryPort}:`, err);
    }
  });

  // Also listen on process.env.PORT if different (Required by Cloud Run / Custom Domains / Deployed Containers)
  if (envPort && envPort !== primaryPort && !isNaN(envPort)) {
    try {
      const secondaryServer = app.listen(envPort, "0.0.0.0", () => {
        console.log(`Cloud Run / Custom Domain listener running on http://0.0.0.0:${envPort}`);
      });
      secondaryServer.on("error", (err: any) => {
        if (err.code !== "EADDRINUSE") {
          console.error(`Error on port ${envPort}:`, err);
        }
      });
    } catch (err) {
      console.warn(`Could not bind additional port ${envPort}:`, err);
    }
  }
}

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

startServer().catch((err) => {
  console.error("Fatal server start error:", err);
});
