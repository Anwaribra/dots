CREATE TABLE `review_policies` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`interval_strategy` text NOT NULL DEFAULT 'fixed',
	`interval_days` text NOT NULL DEFAULT '[1,3,7,14,30]',
	`shorten_on_weak` integer NOT NULL DEFAULT 0,
	`enabled` integer NOT NULL DEFAULT 1,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `review_events` (
	`id` text PRIMARY KEY NOT NULL,
	`work_item_id` text REFERENCES `work_items`(`id`) ON DELETE cascade,
	`resource_item_id` text REFERENCES `resource_items`(`id`) ON DELETE cascade,
	`reviewed_at` integer NOT NULL,
	`duration_minutes` integer NOT NULL DEFAULT 0,
	`result` text,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT `exactly_one_ref` CHECK (
		((CASE WHEN `work_item_id` IS NOT NULL THEN 1 ELSE 0 END) +
		 (CASE WHEN `resource_item_id` IS NOT NULL THEN 1 ELSE 0 END)) = 1
	)
);
--> statement-breakpoint
ALTER TABLE `work_items` ADD COLUMN `review_policy_id` text REFERENCES `review_policies`(`id`) ON DELETE set null;
--> statement-breakpoint
ALTER TABLE `work_items` ADD COLUMN `last_reviewed_at` integer;
--> statement-breakpoint
ALTER TABLE `work_items` ADD COLUMN `next_review_at` integer;
--> statement-breakpoint
ALTER TABLE `work_items` ADD COLUMN `review_count` integer NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE `work_items` ADD COLUMN `review_status` text NOT NULL DEFAULT 'none';
--> statement-breakpoint
ALTER TABLE `resource_items` ADD COLUMN `review_policy_id` text REFERENCES `review_policies`(`id`) ON DELETE set null;
--> statement-breakpoint
ALTER TABLE `resource_items` ADD COLUMN `last_reviewed_at` integer;
--> statement-breakpoint
ALTER TABLE `resource_items` ADD COLUMN `next_review_at` integer;
--> statement-breakpoint
ALTER TABLE `resource_items` ADD COLUMN `review_count` integer NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE `resource_items` ADD COLUMN `review_status` text NOT NULL DEFAULT 'none';
