-- Create the reading_goals table
create table public.reading_goals (
  id bigint generated always as identity primary key,
  year integer not null,
  amount integer not null default 12,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add a unique constraint to ensure only one goal per year
alter table public.reading_goals add constraint reading_goals_year_key unique (year);

-- Enable Row Level Security (RLS) - Optional but good practice
alter table public.reading_goals enable row level security;

-- Create a policy to allow anyone to read/write (since this is a personal app logic for now)
-- Adjust this if you have user authentication to only allow the specific user
create policy "Allow full access to reading_goals"
on public.reading_goals
for all
using (true)
with check (true);

-- Insert default entry for 2026 if it doesn't exist
insert into public.reading_goals (year, amount)
values (2026, 12)
on conflict (year) do nothing;
