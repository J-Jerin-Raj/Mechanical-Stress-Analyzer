```sql
-- Create the table
CREATE TABLE analysis_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  arm_length_mm FLOAT,
  arm_height_mm FLOAT,
  width_mm FLOAT,
  thickness_mm FLOAT,
  material TEXT,
  load_n FLOAT,
  load_type TEXT,
  moment_of_inertia FLOAT,
  section_modulus FLOAT,
  bending_stress FLOAT,
  shear_stress FLOAT,
  von_mises FLOAT,
  factor_of_safety FLOAT,
  buckling_load FLOAT,
  slenderness_ratio FLOAT,
  displacement_mm FLOAT,
  natural_freq FLOAT,
  verdict TEXT
);
alter table analysis_runs enable row level security;

create policy "Allow logged in users to insert"
on analysis_runs for insert
to authenticated
with check (true);

create policy "Allow logged in users to read own"
on analysis_runs for select
to authenticated
using (user_email = auth.jwt() ->> 'email');
this?
```