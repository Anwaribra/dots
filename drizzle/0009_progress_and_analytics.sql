ALTER TABLE `milestones` ADD COLUMN `weight` integer NOT NULL DEFAULT 1;
--> statement-breakpoint
CREATE TABLE `goal_metrics` (
	`id` text PRIMARY KEY NOT NULL,
	`goal_id` text NOT NULL REFERENCES `goals`(`id`) ON DELETE cascade,
	`name` text NOT NULL,
	`unit` text,
	`current_value` integer NOT NULL DEFAULT 0,
	`target_value` integer NOT NULL DEFAULT 100,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `progress_history` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`progress` integer NOT NULL,
	`recorded_date` text NOT NULL,
	`timestamp` integer NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
