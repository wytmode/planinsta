create table if not exists public.user_plans (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id),
  plan_data  jsonb       not null,
  created_at timestamptz not null default now(),
  unique (user_id)
);


create table if not exists public.payments (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references auth.users(id),
  razorpay_order   text        not null,
  razorpay_payment text        not null,
  amount           integer     not null,      -- amount in paise
  currency         text        not null default 'INR',
  status           text        not null,      -- e.g. 'paid'
  paid_at          timestamptz not null default now()
);




alter table public.business_plans
add constraint unique_user_plan unique (user_id);



//added for a business plans 


CREATE TABLE business_plans_backup AS
SELECT * FROM business_plans;

WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY user_id, plan_name
           ORDER BY created_at DESC
         ) AS rn
  FROM business_plans
)
DELETE FROM business_plans
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);


ALTER TABLE business_plans
ADD CONSTRAINT uniq_user_planname UNIQUE (user_id, plan_name);



//trash logic

alter table public.business_plans add column if not exists trashed_at timestamptz;





///////////////////////////////////////////////////////////////
//added migration logic = for inserting into a users table 

