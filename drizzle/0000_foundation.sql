CREATE TABLE `settings` (
  `id` text PRIMARY KEY NOT NULL,
  `locale` text NOT NULL DEFAULT 'en',
  `theme` text NOT NULL DEFAULT 'system',
  `week_starts_on` integer NOT NULL DEFAULT 6,
  `timezone` text NOT NULL DEFAULT 'UTC',
  `use_24_hour_time` integer NOT NULL DEFAULT true,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
