ALTER TABLE settings ADD COLUMN planning_capacity_percentage integer NOT NULL DEFAULT 75;
--> statement-breakpoint
ALTER TABLE settings ADD COLUMN buffer_percentage integer NOT NULL DEFAULT 20;
--> statement-breakpoint
CREATE TABLE availability_rules (
  id text PRIMARY KEY NOT NULL,
  day_of_week integer NOT NULL,
  start_time text NOT NULL DEFAULT '09:00',
  end_time text NOT NULL DEFAULT '17:00',
  is_active integer NOT NULL DEFAULT 1,
  created_at integer NOT NULL,
  updated_at integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE availability_overrides (
  id text PRIMARY KEY NOT NULL,
  date text NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  is_unavailable integer NOT NULL DEFAULT 0,
  notes text,
  created_at integer NOT NULL,
  updated_at integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE fixed_events (
  id text PRIMARY KEY NOT NULL,
  title text NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  recurrence_rule text,
  flexibility text NOT NULL DEFAULT 'fixed',
  locked integer NOT NULL DEFAULT 1,
  notes text,
  created_at integer NOT NULL,
  updated_at integer NOT NULL,
  archived_at integer
);
--> statement-breakpoint
CREATE TABLE time_budgets (
  id text PRIMARY KEY NOT NULL,
  name text NOT NULL,
  allocation_mode text NOT NULL DEFAULT 'target',
  protection text NOT NULL DEFAULT 'flexible',
  minimum_minutes integer NOT NULL DEFAULT 0,
  target_minutes integer NOT NULL DEFAULT 0,
  maximum_minutes integer NOT NULL DEFAULT 0,
  days_of_week text NOT NULL DEFAULT '[0,1,2,3,4,5,6]',
  priority text NOT NULL DEFAULT 'medium',
  start_date text,
  end_date text,
  area_id text REFERENCES areas(id) ON DELETE CASCADE,
  goal_id text REFERENCES goals(id) ON DELETE CASCADE,
  project_id text REFERENCES projects(id) ON DELETE CASCADE,
  work_item_type_id text REFERENCES work_item_types(id) ON DELETE CASCADE,
  created_at integer NOT NULL,
  updated_at integer NOT NULL,
  archived_at integer,
  CONSTRAINT exactly_one_scope CHECK (((CASE WHEN area_id IS NOT NULL THEN 1 ELSE 0 END) + (CASE WHEN goal_id IS NOT NULL THEN 1 ELSE 0 END) + (CASE WHEN project_id IS NOT NULL THEN 1 ELSE 0 END) + (CASE WHEN work_item_type_id IS NOT NULL THEN 1 ELSE 0 END)) = 1)
);
--> statement-breakpoint
CREATE TABLE routines (
  id text PRIMARY KEY NOT NULL,
  name text NOT NULL,
  description text,
  item_type text NOT NULL DEFAULT 'routine',
  target_duration integer NOT NULL DEFAULT 30,
  recurrence_rule text NOT NULL DEFAULT 'FREQ=DAILY',
  preferred_time text,
  flexibility text NOT NULL DEFAULT 'semi_flexible',
  protected integer NOT NULL DEFAULT 0,
  priority text NOT NULL DEFAULT 'medium',
  active integer NOT NULL DEFAULT 1,
  created_at integer NOT NULL,
  updated_at integer NOT NULL,
  archived_at integer
);
--> statement-breakpoint
CREATE TABLE habits (
  id text PRIMARY KEY NOT NULL,
  name text NOT NULL,
  description text,
  target_type text NOT NULL DEFAULT 'binary',
  target_value integer NOT NULL DEFAULT 1,
  target_frequency_days integer NOT NULL DEFAULT 7,
  unit text,
  active integer NOT NULL DEFAULT 1,
  created_at integer NOT NULL,
  updated_at integer NOT NULL,
  archived_at integer
);
--> statement-breakpoint
CREATE TABLE habit_logs (
  id text PRIMARY KEY NOT NULL,
  habit_id text NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date text NOT NULL,
  value integer NOT NULL DEFAULT 1,
  notes text,
  created_at integer NOT NULL,
  updated_at integer NOT NULL
);
