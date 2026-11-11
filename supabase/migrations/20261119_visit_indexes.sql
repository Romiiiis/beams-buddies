-- Faster lookups of a job's or a customer's visits (the job profit card and the customer page ask for them) - 2026-11-19
create index if not exists job_visits_job_idx on public.job_visits (job_id) where job_id is not null;
create index if not exists job_visits_customer_idx on public.job_visits (customer_id) where customer_id is not null;
