-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Settings Table
create table if not exists settings (
  id uuid default uuid_generate_v4() primary key,
  category text not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Issues Table
create table if not exists issues (
  id uuid default uuid_generate_v4() primary key,
  client_name text not null,
  issue_type text not null,
  priority text not null,
  status text not null,
  assigned_person text not null,
  issue_details text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Monthly Entries Table
create table if not exists monthly_entries (
  id uuid default uuid_generate_v4() primary key,
  month text not null, -- Format YYYY-MM
  total_issues integer default 0,
  system_bugs integer default 0,
  device_issues integer default 0,
  awareness integer default 0,
  help_requests integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- System Downtime Table
create table if not exists system_downtime (
  id uuid default uuid_generate_v4() primary key,
  date text not null,
  system_name text not null,
  start_time text not null,
  end_time text not null,
  duration_minutes integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert Default Settings (Only if empty)
insert into settings (category, name)
select 'issue_type', 'System Bugs'
where not exists (select 1 from settings where category = 'issue_type' and name = 'System Bugs');

insert into settings (category, name)
select 'issue_type', 'Device'
where not exists (select 1 from settings where category = 'issue_type' and name = 'Device');

insert into settings (category, name)
select 'issue_type', 'Awerness'
where not exists (select 1 from settings where category = 'issue_type' and name = 'Awerness');

insert into settings (category, name)
select 'issue_type', 'Help Request'
where not exists (select 1 from settings where category = 'issue_type' and name = 'Help Request');

insert into settings (category, name)
select 'priority', 'Low'
where not exists (select 1 from settings where category = 'priority' and name = 'Low');

insert into settings (category, name)
select 'priority', 'Medium'
where not exists (select 1 from settings where category = 'priority' and name = 'Medium');

insert into settings (category, name)
select 'priority', 'High'
where not exists (select 1 from settings where category = 'priority' and name = 'High');

insert into settings (category, name)
select 'status', 'Open'
where not exists (select 1 from settings where category = 'status');

insert into settings (assigned_person, name)
select 'assigned_person', 'Fuad'
where not exists (select 1 from settings where category = 'assigned_person');
