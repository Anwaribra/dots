CREATE TABLE `time_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`work_item_id` text REFERENCES `work_items`(`id`) ON DELETE cascade,
	`scheduled_item_id` text REFERENCES `scheduled_items`(`id`) ON DELETE set null,
	`project_id` text REFERENCES `projects`(`id`) ON DELETE set null,
	`goal_id` text REFERENCES `goals`(`id`) ON DELETE set null,
	`area_id` text REFERENCES `areas`(`id`) ON DELETE set null,
	`start_time` integer NOT NULL,
	`end_time` integer NOT NULL,
	`duration_minutes` integer NOT NULL,
	`paused_duration_minutes` integer DEFAULT 0 NOT NULL,
	`interruptions_count` integer DEFAULT 0 NOT NULL,
	`mode` text DEFAULT 'stopwatch' NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `settings` ADD COLUMN `notifications_enabled` integer DEFAULT 1 NOT NULL;
