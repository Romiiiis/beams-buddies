-- Per-business switch for automatic reminders - 2026-11-08
-- Off = manual only: the Email / SMS buttons still work, but nothing is queued or sent automatically.
-- (Applied directly to the database as migration "pause_auto_reminders_per_business".)

alter table public.businesses add column if not exists auto_reminders_enabled boolean not null default true;

-- Avalanche Air (info@avalancheair.com.au): manual only for now, at the owner's request
update public.businesses set auto_reminders_enabled = false where id = 'cd06959e-4622-46dd-8181-d285ce2f147f';

-- Daily 8am queue job (pg_cron job 1) skips businesses that have automatic reminders paused
select cron.alter_job(
  job_id := 1,
  command := $cmd$
    insert into reminders (job_id, customer_id, scheduled_for, channel)
    select j.id, j.customer_id, current_date, 'email'
    from jobs j
    join businesses b on b.id = j.business_id
    where b.auto_reminders_enabled
      and j.next_service_date - (j.reminder_lead_days || ' days')::interval <= current_date
      and j.next_service_date >= current_date
      and not exists (
        select 1 from reminders r
        where r.job_id = j.id and r.scheduled_for = current_date and r.status != 'failed'
      );
  $cmd$
);
