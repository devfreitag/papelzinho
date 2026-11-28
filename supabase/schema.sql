-- Amigo secreto: schema. RLS ligado e sem policies: só a service role (servidor) acessa.

create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  budget text,
  exchange_date date,
  message text,
  admin_token text not null unique,
  drawn_at timestamptz,
  created_at timestamptz not null default now()
);

-- Hash (HMAC) do IP de quem criou pela página inicial, para limitar criações por hora. Null nos do admin.
alter table groups add column if not exists creator_ip_hash text;
create index if not exists groups_creator_ip_created_idx on groups(creator_ip_hash, created_at);

create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  name text not null,
  token text not null unique,
  wishlist text not null default '',
  dislikes text not null default '',
  opened_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists participants_group_id_idx on participants(group_id);

create table if not exists draws (
  group_id uuid not null references groups(id) on delete cascade,
  giver_id uuid not null references participants(id) on delete cascade,
  receiver_id uuid not null references participants(id) on delete cascade,
  primary key (group_id, giver_id),
  unique (group_id, receiver_id),
  check (giver_id <> receiver_id)
);

alter table groups enable row level security;
alter table participants enable row level security;
alter table draws enable row level security;
