CREATE TABLE profiles (id text PRIMARY KEY NOT NULL, display_name text, created_at integer NOT NULL, updated_at integer NOT NULL, archived_at integer);
--> statement-breakpoint
ALTER TABLE work_items ADD COLUMN goal_id text REFERENCES goals(id) ON DELETE SET NULL;
--> statement-breakpoint
ALTER TABLE work_items ADD COLUMN area_id text REFERENCES areas(id) ON DELETE SET NULL;
--> statement-breakpoint
CREATE INDEX work_items_goal_idx ON work_items(goal_id);
--> statement-breakpoint
CREATE INDEX work_items_area_idx ON work_items(area_id);
--> statement-breakpoint
INSERT INTO work_item_types (id, name, built_in, color, icon, sort_order, created_at, updated_at) VALUES
('00000000-0000-4000-8000-000000000101', 'Task', 1, '#5B8DEF', 'check-square', 0, 0, 0),
('00000000-0000-4000-8000-000000000102', 'Activity', 1, '#38BDF8', 'circle-play', 1, 0, 0),
('00000000-0000-4000-8000-000000000103', 'Study', 1, '#8B5CF6', 'book-open', 2, 0, 0),
('00000000-0000-4000-8000-000000000104', 'Reading', 1, '#14B8A6', 'book', 3, 0, 0),
('00000000-0000-4000-8000-000000000105', 'Video', 1, '#F97316', 'video', 4, 0, 0),
('00000000-0000-4000-8000-000000000106', 'Article', 1, '#6366F1', 'file-text', 5, 0, 0),
('00000000-0000-4000-8000-000000000107', 'Exercise', 1, '#22C55E', 'dumbbell', 6, 0, 0),
('00000000-0000-4000-8000-000000000108', 'Practice', 1, '#EAB308', 'repeat-2', 7, 0, 0),
('00000000-0000-4000-8000-000000000109', 'Assignment', 1, '#EC4899', 'clipboard-list', 8, 0, 0),
('00000000-0000-4000-8000-000000000110', 'Review', 1, '#06B6D4', 'refresh-cw', 9, 0, 0),
('00000000-0000-4000-8000-000000000111', 'Meeting', 1, '#A855F7', 'users', 10, 0, 0),
('00000000-0000-4000-8000-000000000112', 'Custom', 1, '#64748B', 'sparkles', 11, 0, 0);
