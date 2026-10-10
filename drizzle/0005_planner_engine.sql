CREATE TABLE `scheduled_items` (
	`id` text PRIMARY KEY NOT NULL,
	`work_item_id` text REFERENCES `work_items`(`id`) ON DELETE cascade,
	`title` text NOT NULL,
	`date` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`duration_minutes` integer NOT NULL,
	`session_index` integer DEFAULT 1 NOT NULL,
	`total_sessions` integer DEFAULT 1 NOT NULL,
	`is_split` integer DEFAULT 0 NOT NULL,
	`locked` integer DEFAULT 0 NOT NULL,
	`reason` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
