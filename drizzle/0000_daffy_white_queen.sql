CREATE TABLE `plans` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`icon` text DEFAULT 'sparkles' NOT NULL,
	`color` text DEFAULT 'violet' NOT NULL,
	`current_amount_saved` real DEFAULT 0 NOT NULL,
	`amount_to_save` real DEFAULT 0 NOT NULL,
	`frequency` text DEFAULT 'monthly' NOT NULL,
	`savings_day_of_month` integer DEFAULT 25 NOT NULL,
	`first_saving_date` text NOT NULL,
	`emergency_buffer` real DEFAULT 0 NOT NULL,
	`annual_interest_rate` real DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`currency_code` text DEFAULT 'USD' NOT NULL,
	`currency_symbol` text DEFAULT '$' NOT NULL,
	`currency_position` text DEFAULT 'prefix' NOT NULL,
	`currency_decimals` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `wish_items` (
	`id` text PRIMARY KEY NOT NULL,
	`plan_id` text NOT NULL,
	`title` text NOT NULL,
	`price` real NOT NULL,
	`category` text DEFAULT 'Tech' NOT NULL,
	`priority` integer DEFAULT 1 NOT NULL,
	`url` text,
	`image_url` text,
	`notes` text,
	`is_purchased` integer DEFAULT false NOT NULL,
	`purchased_at` text,
	`purchased_price` real,
	`is_paused` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON UPDATE no action ON DELETE cascade
);
