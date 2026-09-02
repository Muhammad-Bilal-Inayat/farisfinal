import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const admins = sqliteTable('admins', {
  id: integer('id').primaryKey(),
  name: text('name').default('Administrator'),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').default('admin'), // 'master_admin' | 'admin' | 'secondary_admin' | 'manager' | 'editor' | 'driver'
  status: text('status').default('active'), // 'active' | 'inactive'
  lastLogin: text('last_login'),
  createdAt: text('created_at'),
});

export const activity_logs = sqliteTable('activity_logs', {
  id: integer('id').primaryKey(),
  userId: integer('user_id'),
  username: text('username'),
  name: text('name'),
  role: text('role'),
  action: text('action').notNull(),
  module: text('module').notNull(),
  recordId: text('record_id'),
  description: text('description'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: text('created_at').notNull(),
});

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export const vehicles = sqliteTable('vehicles', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  year: integer('year'),
  passengerCapacity: integer('passenger_capacity').notNull(),
  luggageCapacity: integer('luggage_capacity').notNull(),
  features: text('features'), // JSON string or comma separated
  imageUrl: text('image_url'),
  startingPrice: integer('starting_price'),
  description: text('description'),
  category: text('category'),
  status: text('status').default('active'),
  displayOrder: integer('display_order').default(0),
});

export const trip_routes = sqliteTable('trip_routes', {
  id: integer('id').primaryKey(),
  pickup: text('pickup').notNull(),
  destination: text('destination').notNull(),
  nameEn: text('name_en').notNull(),
  nameAr: text('name_ar').notNull(),
  status: text('status').default('active'),
  displayOrder: integer('display_order').default(0),
  isFeatured: integer('is_featured', { mode: 'boolean' }).default(false),
});

export const trip_rates = sqliteTable('trip_rates', {
  id: integer('id').primaryKey(),
  pickup: text('pickup').notNull(),
  destination: text('destination').notNull(),
  vehicleId: integer('vehicle_id').references(() => vehicles.id),
  price: integer('price').notNull(),
  priceMax: integer('price_max'),
  status: text('status').default('active'),
});

export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  whatsapp: text('whatsapp'),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').notNull(),
  totalBookings: integer('total_bookings').default(0),
  totalSpent: integer('total_spent').default(0),
  lastBookingDate: text('last_booking_date'),
});

export const bookings = sqliteTable('bookings', {
  id: integer('id').primaryKey(),
  bookingId: text('booking_id').notNull().unique(),
  userId: integer('user_id').references(() => users.id),
  customerName: text('customer_name').notNull(),
  phone: text('phone').notNull(),
  whatsapp: text('whatsapp'),
  email: text('email'),
  pickup: text('pickup').notNull(),
  destination: text('destination').notNull(),
  vehicleId: integer('vehicle_id').references(() => vehicles.id),
  vehicleNameSnapshot: text('vehicle_name_snapshot'),
  passengers: integer('passengers').notNull(),
  luggage: integer('luggage'),
  tripType: text('trip_type').notNull(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  specialRequest: text('special_request'),
  price: integer('price').notNull(),
  priceMax: integer('price_max'),
  currency: text('currency').default('SAR'),
  status: text('status').notNull(),
  driverId: integer('driver_id'),
  driverNameSnapshot: text('driver_name_snapshot'),
  driverPhoneSnapshot: text('driver_phone_snapshot'),
  driverName: text('driver_name'),
  driverPhone: text('driver_phone'),
  driverPlate: text('driver_plate'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at'),
});

export const drivers = sqliteTable('drivers', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  vehicleInfo: text('vehicle_info'),
  status: text('status').default('active'), // 'active' | 'inactive'
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at'),
});

export const contact_messages = sqliteTable('contact_messages', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  whatsapp: text('whatsapp'),
  email: text('email').notNull(),
  subject: text('subject'),
  message: text('message').notNull(),
  status: text('status').default('Unread'),
  createdAt: text('created_at').notNull(),
});

export const testimonials = sqliteTable('testimonials', {
  id: integer('id').primaryKey(),
  customerName: text('customer_name').notNull(),
  location: text('location'),
  text: text('text').notNull(),
  rating: integer('rating').default(5),
  status: text('status').default('active'),
  displayOrder: integer('display_order').default(0),
});

export const whatsapp_settings = sqliteTable('whatsapp_settings', {
  id: integer('id').primaryKey(),
  phoneNumber: text('phone_number').notNull(),
  generalMessage: text('general_message'),
  newBookingMessage: text('new_booking_message'),
  confirmationMessage: text('confirmation_message'),
  cancellationMessage: text('cancellation_message'),
  contactMessage: text('contact_message'),
});
