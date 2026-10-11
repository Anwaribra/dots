CREATE TABLE `replanning_history` (
	`id` text PRIMARY KEY NOT NULL,
	`target_date` text NOT NULL,
	`timestamp` integer NOT NULL,
	`trigger` text NOT NULL,
	`summary` text NOT NULL,
	`changes_json` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `plan_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`plan_date` text NOT NULL,
	`version_name` text NOT NULL,
	`version_index` integer NOT NULL DEFAULT 1,
	`schedule_snapshot_json` text NOT NULL,
	`trigger` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
