import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

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
}, (table) => [
  index('idx_activity_logs_module_created').on(table.module, table.createdAt),
  index('idx_activity_logs_user').on(table.userId),
]);

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
}, (table) => [
  index('idx_trip_rates_lookup').on(table.pickup, table.destination, table.vehicleId),
  index('idx_trip_rates_status').on(table.status),
]);

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
}, (table) => [
  index('idx_users_customer_email').on(table.email),
  index('idx_users_phone').on(table.phone),
]);

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
}, (table) => [
  index('idx_bookings_customer_email').on(table.email),
  index('idx_bookings_booking_status').on(table.status),
  index('idx_bookings_booking_id').on(table.bookingId),
  index('idx_bookings_user_id').on(table.userId),
  index('idx_bookings_created_at').on(table.createdAt),
  index('idx_bookings_phone').on(table.phone),
]);

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
}, (table) => [
  index('idx_contact_messages_status').on(table.status),
]);

export const testimonials = sqliteTable('testimonials', {
  id: integer('id').primaryKey(),
  customerName: text('customer_name').notNull(),
  location: text('location'),
  text: text('text').notNull(),
  rating: integer('rating').default(5),
  bookingId: text('booking_id'),
  status: text('status').default('active'),
  displayOrder: integer('display_order').default(0),
}, (table) => [
  index('idx_testimonials_review_status').on(table.status),
  index('idx_testimonials_booking_id').on(table.bookingId),
  index('idx_testimonials_rating').on(table.rating),
  index('idx_testimonials_display_order').on(table.displayOrder),
]);

export const whatsapp_settings = sqliteTable('whatsapp_settings', {
  id: integer('id').primaryKey(),
  phoneNumber: text('phone_number').notNull(),
  generalMessage: text('general_message'),
  newBookingMessage: text('new_booking_message'),
  confirmationMessage: text('confirmation_message'),
  cancellationMessage: text('cancellation_message'),
  contactMessage: text('contact_message'),
});

export const admin_audit_logs = sqliteTable('admin_audit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id'),
  username: text('username'),
  action: text('action').notNull(),
  module: text('module').notNull().default('vehicles'),
  recordId: text('record_id'),
  changes: text('changes'),
  ipAddress: text('ip_address'),
  createdAt: text('created_at').notNull(),
}, (table) => [
  index('idx_admin_audit_logs_created').on(table.createdAt),
  index('idx_admin_audit_logs_user').on(table.userId),
]);

export const booking_sync_logs = sqliteTable('booking_sync_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bookingId: text('booking_id').notNull(),
  action: text('action').notNull(),
  status: text('status').notNull(), // SUCCESS, FAILED_WRITE, OVERWRITE_CONFLICT
  payload: text('payload'),
  errorDetails: text('error_details'),
  latencyMs: integer('latency_ms').default(0),
  createdAt: text('created_at').notNull(),
}, (table) => [
  index('idx_booking_sync_logs_created').on(table.createdAt),
  index('idx_booking_sync_logs_booking_id').on(table.bookingId),
  index('idx_booking_sync_logs_status').on(table.status),
]);

export const archived_bookings = sqliteTable('archived_bookings', {
  id: integer('id').primaryKey(),
  bookingId: text('booking_id').notNull(),
  userId: integer('user_id'),
  customerName: text('customer_name').notNull(),
  phone: text('phone').notNull(),
  whatsapp: text('whatsapp'),
  email: text('email'),
  pickup: text('pickup').notNull(),
  destination: text('destination').notNull(),
  vehicleId: integer('vehicle_id'),
  vehicleNameSnapshot: text('vehicle_name_snapshot'),
  passengers: integer('passengers').notNull(),
  luggage: integer('luggage'),
  tripType: text('trip_type').notNull(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  specialRequest: text('special_request'),
  price: integer('price').notNull(),
  priceMax: integer('price_max'),
  currency: text('currency'),
  status: text('status').notNull(),
  driverId: integer('driver_id'),
  driverNameSnapshot: text('driver_name_snapshot'),
  driverPhoneSnapshot: text('driver_phone_snapshot'),
  driverName: text('driver_name'),
  driverPhone: text('driver_phone'),
  driverPlate: text('driver_plate'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at'),
  archivedAt: text('archived_at').notNull(),
}, (table) => [
  index('idx_archived_bookings_date').on(table.date),
  index('idx_archived_bookings_booking_id').on(table.bookingId),
]);


