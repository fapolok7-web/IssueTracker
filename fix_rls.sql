-- Disable RLS on all tables to allow public data entry
-- Run this in Supabase SQL Editor

ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE issues DISABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_downtime DISABLE ROW LEVEL SECURITY;

-- If you prefer keeping RLS enabled but want to allow public access, 
-- you can alternatively run these policies (OPTIONAL - DO NOT RUN IF YOU RAN DISABLE ABOVE):
/*
create policy "Public Access Settings" on settings for all using (true);
create policy "Public Access Issues" on issues for all using (true);
create policy "Public Access Monthly" on monthly_entries for all using (true);
create policy "Public Access Downtime" on system_downtime for all using (true);
*/
