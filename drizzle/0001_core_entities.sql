CREATE TABLE areas (id text PRIMARY KEY NOT NULL, name text NOT NULL, description text, icon text, color text, sort_order integer NOT NULL DEFAULT 0, created_at integer NOT NULL, updated_at integer NOT NULL, archived_at integer);
--> statement-breakpoint
CREATE TABLE goals (id text PRIMARY KEY NOT NULL, area_id text REFERENCES areas(id) ON DELETE SET NULL, title text NOT NULL, description text, priority text NOT NULL DEFAULT 'medium', status text NOT NULL DEFAULT 'active', start_date text, target_date text, measurement_type text NOT NULL DEFAULT 'percentage', progress_mode text NOT NULL DEFAULT 'manual', target_value integer, current_value integer NOT NULL DEFAULT 0, unit text, created_at integer NOT NULL, updated_at integer NOT NULL, archived_at integer);
--> statement-breakpoint
CREATE TABLE milestones (id text PRIMARY KEY NOT NULL, goal_id text NOT NULL REFERENCES goals(id) ON DELETE CASCADE, title text NOT NULL, description text, order_index integer NOT NULL DEFAULT 0, target_date text, status text NOT NULL DEFAULT 'active', progress integer NOT NULL DEFAULT 0, created_at integer NOT NULL, updated_at integer NOT NULL, archived_at integer);
--> statement-breakpoint
CREATE TABLE projects (id text PRIMARY KEY NOT NULL, area_id text REFERENCES areas(id) ON DELETE SET NULL, goal_id text REFERENCES goals(id) ON DELETE SET NULL, milestone_id text REFERENCES milestones(id) ON DELETE SET NULL, parent_project_id text, title text NOT NULL, description text, priority text NOT NULL DEFAULT 'medium', status text NOT NULL DEFAULT 'active', start_date text, deadline text, estimated_minutes integer NOT NULL DEFAULT 0, completed_minutes integer NOT NULL DEFAULT 0, progress integer NOT NULL DEFAULT 0, created_at integer NOT NULL, updated_at integer NOT NULL, archived_at integer);
--> statement-breakpoint
CREATE TABLE work_item_types (id text PRIMARY KEY NOT NULL, name text NOT NULL, built_in integer NOT NULL DEFAULT 0, color text, icon text, sort_order integer NOT NULL DEFAULT 0, created_at integer NOT NULL, updated_at integer NOT NULL, archived_at integer);
--> statement-breakpoint
CREATE TABLE custom_field_definitions (id text PRIMARY KEY NOT NULL, work_item_type_id text NOT NULL REFERENCES work_item_types(id) ON DELETE CASCADE, name text NOT NULL, field_type text NOT NULL, options text, required integer NOT NULL DEFAULT 0, sort_order integer NOT NULL DEFAULT 0, created_at integer NOT NULL, updated_at integer NOT NULL);
--> statement-breakpoint
CREATE TABLE work_items (id text PRIMARY KEY NOT NULL, project_id text REFERENCES projects(id) ON DELETE SET NULL, parent_id text, title text NOT NULL, description text, work_item_type_id text REFERENCES work_item_types(id) ON DELETE SET NULL, status text NOT NULL DEFAULT 'todo', priority text NOT NULL DEFAULT 'medium', estimated_minutes integer NOT NULL DEFAULT 0, actual_minutes integer NOT NULL DEFAULT 0, deadline text, preferred_date text, preferred_start_time text, preferred_end_time text, energy_level text, flexibility text NOT NULL DEFAULT 'flexible', progress integer NOT NULL DEFAULT 0, order_index integer NOT NULL DEFAULT 0, recurrence_rule text, created_at integer NOT NULL, updated_at integer NOT NULL, archived_at integer);
--> statement-breakpoint
CREATE TABLE custom_field_values (id text PRIMARY KEY NOT NULL, work_item_id text NOT NULL REFERENCES work_items(id) ON DELETE CASCADE, definition_id text NOT NULL REFERENCES custom_field_definitions(id) ON DELETE CASCADE, text_value text, number_value integer, boolean_value integer, date_value text, select_value text, created_at integer NOT NULL, updated_at integer NOT NULL);
--> statement-breakpoint
CREATE TABLE tags (id text PRIMARY KEY NOT NULL, name text NOT NULL UNIQUE, color text, created_at integer NOT NULL, updated_at integer NOT NULL, archived_at integer);
--> statement-breakpoint
CREATE TABLE entity_tags (id text PRIMARY KEY NOT NULL, entity_type text NOT NULL, entity_id text NOT NULL, tag_id text NOT NULL REFERENCES tags(id) ON DELETE CASCADE, created_at integer NOT NULL, updated_at integer NOT NULL);
--> statement-breakpoint
CREATE TABLE notes (id text PRIMARY KEY NOT NULL, entity_type text NOT NULL, entity_id text NOT NULL, content text NOT NULL, created_at integer NOT NULL, updated_at integer NOT NULL, archived_at integer);
--> statement-breakpoint
CREATE INDEX goals_area_idx ON goals(area_id);
--> statement-breakpoint CREATE INDEX projects_goal_idx ON projects(goal_id);
--> statement-breakpoint CREATE INDEX work_items_project_idx ON work_items(project_id);
--> statement-breakpoint CREATE INDEX entity_tags_entity_idx ON entity_tags(entity_type, entity_id);
--> statement-breakpoint CREATE INDEX notes_entity_idx ON notes(entity_type, entity_id);