CREATE TABLE resources (
  id text PRIMARY KEY NOT NULL,
  title text NOT NULL,
  description text,
  resource_type text NOT NULL DEFAULT 'course',
  ordering_mode text NOT NULL DEFAULT 'sequential',
  area_id text REFERENCES areas(id) ON DELETE SET NULL,
  goal_id text REFERENCES goals(id) ON DELETE SET NULL,
  project_id text REFERENCES projects(id) ON DELETE SET NULL,
  created_at integer NOT NULL,
  updated_at integer NOT NULL,
  archived_at integer
);
--> statement-breakpoint
CREATE TABLE resource_items (
  id text PRIMARY KEY NOT NULL,
  resource_id text NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  parent_id text,
  title text NOT NULL,
  item_type text NOT NULL DEFAULT 'item',
  source_url text,
  estimated_minutes integer NOT NULL DEFAULT 0,
  order_index integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'todo',
  progress integer NOT NULL DEFAULT 0,
  notes text,
  work_item_id text REFERENCES work_items(id) ON DELETE SET NULL,
  created_at integer NOT NULL,
  updated_at integer NOT NULL,
  archived_at integer
);
--> statement-breakpoint
CREATE TABLE work_item_dependencies (
  id text PRIMARY KEY NOT NULL,
  predecessor_id text NOT NULL,
  successor_id text NOT NULL,
  predecessor_type text NOT NULL DEFAULT 'work_item',
  successor_type text NOT NULL DEFAULT 'work_item',
  dependency_type text NOT NULL DEFAULT 'finish_to_start',
  created_at integer NOT NULL,
  updated_at integer NOT NULL
);
