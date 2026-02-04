-- Add issue_date column to issues table
alter table issues add column if not exists issue_date text;

-- Update existing records to have a default value if needed (optional)
-- update issues set issue_date = created_at::text where issue_date is null;
