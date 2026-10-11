ALTER TABLE `settings` ADD COLUMN `onboarding_done` integer NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE `settings` ADD COLUMN `demo_mode` integer NOT NULL DEFAULT 0;
--> statement-breakpoint
CREATE TABLE `templates` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category` text NOT NULL DEFAULT 'custom',
	`builtin` integer NOT NULL DEFAULT 0,
	`payload_json` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
