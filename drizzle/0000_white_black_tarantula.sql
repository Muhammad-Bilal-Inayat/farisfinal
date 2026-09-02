CREATE TABLE `admins` (
	`id` integer PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admins_username_unique` ON `admins` (`username`);--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` integer PRIMARY KEY NOT NULL,
	`booking_id` text NOT NULL,
	`user_id` integer,
	`customer_name` text NOT NULL,
	`phone` text NOT NULL,
	`whatsapp` text,
	`email` text,
	`pickup` text NOT NULL,
	`destination` text NOT NULL,
	`vehicle_id` integer,
	`vehicle_name_snapshot` text,
	`passengers` integer NOT NULL,
	`luggage` integer,
	`trip_type` text NOT NULL,
	`date` text NOT NULL,
	`time` text NOT NULL,
	`special_request` text,
	`price` integer NOT NULL,
	`currency` text DEFAULT 'SAR',
	`status` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_booking_id_unique` ON `bookings` (`booking_id`);--> statement-breakpoint
CREATE TABLE `contact_messages` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`whatsapp` text,
	`email` text NOT NULL,
	`subject` text,
	`message` text NOT NULL,
	`status` text DEFAULT 'Unread',
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `routes` (
	`id` integer PRIMARY KEY NOT NULL,
	`pickup` text NOT NULL,
	`destination` text NOT NULL,
	`vehicle_id` integer,
	`price` integer NOT NULL,
	`currency` text DEFAULT 'SAR',
	`status` text DEFAULT 'active',
	`category` text,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` integer PRIMARY KEY NOT NULL,
	`customer_name` text NOT NULL,
	`location` text,
	`text` text NOT NULL,
	`rating` integer DEFAULT 5,
	`status` text DEFAULT 'active',
	`display_order` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`whatsapp` text,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` text NOT NULL,
	`total_bookings` integer DEFAULT 0,
	`total_spent` integer DEFAULT 0,
	`last_booking_date` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`year` integer,
	`passenger_capacity` integer NOT NULL,
	`luggage_capacity` integer NOT NULL,
	`features` text,
	`image_url` text,
	`starting_price` integer,
	`description` text,
	`category` text,
	`status` text DEFAULT 'active',
	`display_order` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `whatsapp_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`phone_number` text NOT NULL,
	`general_message` text,
	`new_booking_message` text,
	`confirmation_message` text,
	`cancellation_message` text,
	`contact_message` text
);
