-- ============================================================================
-- DANHOMEY Facture · Script d'initialisation complet (Schéma + Données initiales)
-- À copier/coller directement dans l'éditeur SQL de Supabase (SQL Editor)
-- ============================================================================

-- ============================================================================
-- DANHOMEY Facture · Schéma PostgreSQL & Politiques de Sécurité RLS
-- Conforme aux spécifications fiscales UEMOA / CEMAC (OHADA)
-- Montants en entiers stricts (FCFA), RLS multi-tenant et immuabilité légale
-- ============================================================================

-- Extensions nécessaires
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Types ENUM
-- ----------------------------------------------------------------------------
create type user_role as enum ('owner', 'admin', 'member');
create type invoice_status as enum ('draft', 'sent', 'paid', 'overdue', 'cancelled');
create type payment_method as enum ('mobile_money', 'bank_transfer', 'cash', 'cheque');

-- ----------------------------------------------------------------------------
-- 2. Table: organizations
-- ----------------------------------------------------------------------------
create table organizations (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text unique not null,
    currency text not null default 'XOF',
    vat_rate integer not null default 18,
    invoice_prefix text not null default 'FAC',
    next_invoice_number integer not null default 1,
    tax_id text, -- IFU ou NINEA
    rccm text,
    address text,
    city text not null default 'Cotonou',
    country text not null default 'Bénin',
    phone text,
    email text,
    logo_url text,
    bank_name text default 'BOA Bénin',
    bank_rib text default 'BJ061 01001 002345678901 45',
    mobile_money_info text default 'Wave / MTN: +229 97 00 12 34',
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- ----------------------------------------------------------------------------
-- 3. Table: profiles (utilisateurs liés à auth.users)
-- ----------------------------------------------------------------------------
create table profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    organization_id uuid references organizations(id) on delete cascade not null,
    role user_role not null default 'member',
    first_name text not null,
    last_name text not null,
    email text not null,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- ----------------------------------------------------------------------------
-- 4. Table: customers
-- ----------------------------------------------------------------------------
create table customers (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid references organizations(id) on delete cascade not null,
    name text not null,
    contact_person text,
    email text not null,
    phone text not null,
    address text not null,
    city text not null default 'Cotonou',
    country text not null default 'Bénin',
    tax_id text, -- IFU
    rccm text,
    total_invoiced bigint not null default 0,
    total_paid bigint not null default 0,
    balance_due bigint not null default 0,
    invoices_count integer not null default 0,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- ----------------------------------------------------------------------------
-- 5. Table: invoices
-- ----------------------------------------------------------------------------
create table invoices (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid references organizations(id) on delete cascade not null,
    customer_id uuid references customers(id) on delete restrict not null,
    number text not null,
    issue_date date not null default current_date,
    due_date date not null,
    status invoice_status not null default 'draft',
    subtotal bigint not null default 0,
    vat_rate integer not null default 18,
    vat_amount bigint not null default 0,
    total bigint not null default 0,
    amount_paid bigint not null default 0,
    notes text,
    public_token text unique default encode(gen_random_bytes(16), 'hex'),
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null,
    constraint unique_org_invoice_number unique (organization_id, number)
);

-- ----------------------------------------------------------------------------
-- 6. Table: invoice_items (lignes de prestations)
-- ----------------------------------------------------------------------------
create table invoice_items (
    id uuid primary key default gen_random_uuid(),
    invoice_id uuid references invoices(id) on delete cascade not null,
    position integer not null default 1,
    description text not null,
    quantity numeric(10, 3) not null default 1 check (quantity > 0),
    unit_price bigint not null default 0 check (unit_price >= 0),
    line_total bigint not null default 0 check (line_total >= 0),
    created_at timestamp with time zone default now() not null
);

-- ----------------------------------------------------------------------------
-- 7. Table: payments (règlements enregistrés)
-- ----------------------------------------------------------------------------
create table payments (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid references organizations(id) on delete cascade not null,
    invoice_id uuid references invoices(id) on delete cascade not null,
    amount bigint not null check (amount > 0),
    date date not null default current_date,
    method payment_method not null,
    reference text not null,
    note text,
    created_at timestamp with time zone default now() not null
);

-- ----------------------------------------------------------------------------
-- 8. Index pour optimiser les performances
-- ----------------------------------------------------------------------------
create index idx_profiles_org on profiles(organization_id);
create index idx_customers_org on customers(organization_id);
create index idx_invoices_org on invoices(organization_id);
create index idx_invoices_customer on invoices(customer_id);
create index idx_invoices_status on invoices(status);
create index idx_invoices_token on invoices(public_token);
create index idx_invoice_items_invoice on invoice_items(invoice_id);
create index idx_payments_invoice on payments(invoice_id);
create index idx_payments_org on payments(organization_id);

-- ----------------------------------------------------------------------------
-- 9. Fonctions de recalcul automatique et d'immuabilité
-- ----------------------------------------------------------------------------

-- Fonction helper pour obtenir l'organisation de l'utilisateur courant
create or replace function auth_org_id()
returns uuid
language sql
stable
security definer
as $$
    select organization_id from profiles where id = auth.uid() limit 1;
$$;

-- Immuabilité des factures émises : les factures au statut autre que 'draft' ne peuvent être supprimées
create or replace function enforce_invoice_immutability()
returns trigger
language plpgsql
as $$
begin
    if tg_op = 'DELETE' and old.status != 'draft' then
        raise exception 'Action interdite : une facture émise (%) ne peut pas être supprimée (règle comptable OHADA). Utilisez l''annulation.', old.number;
    end if;

    if tg_op = 'UPDATE' and old.status in ('sent', 'paid', 'cancelled') then
        -- Seul le montant payé ou le statut peuvent être mis à jour après émission
        if new.subtotal != old.subtotal or new.vat_amount != old.vat_amount or new.total != old.total then
            raise exception 'Action interdite : les montants d''une facture émise (%) sont immuables.', old.number;
        end if;
    end if;

    return new;
end;
$$;

create trigger trg_invoice_immutability
before update or delete on invoices
for each row
execute function enforce_invoice_immutability();

-- Recalcul automatique du total de ligne
create or replace function calculate_line_total()
returns trigger
language plpgsql
as $$
begin
    new.line_total := round(new.quantity * new.unit_price);
    return new;
end;
$$;

create trigger trg_calculate_line_total
before insert or update on invoice_items
for each row
execute function calculate_line_total();

-- ----------------------------------------------------------------------------
-- 10. Activation et Politiques RLS (Row Level Security)
-- ----------------------------------------------------------------------------

alter table organizations enable row level security;
alter table profiles enable row level security;
alter table customers enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;
alter table payments enable row level security;

-- Organizations : seuls les membres de l'organisation peuvent lire/modifier
create policy "Org members can view their organization"
    on organizations for select
    using (id = auth_org_id());

create policy "Org owners can update their organization"
    on organizations for update
    using (id = auth_org_id());

-- Profiles : lecture pour les membres de l'organisation
create policy "Profiles viewable by organization members"
    on profiles for select
    using (organization_id = auth_org_id());

create policy "Users can update their own profile"
    on profiles for update
    using (id = auth.uid());

-- Customers : isolation stricte par organisation
create policy "Customers isolation policy"
    on customers for all
    using (organization_id = auth_org_id())
    with check (organization_id = auth_org_id());

-- Invoices : isolation par organisation + lecture publique via token
create policy "Invoices member policy"
    on invoices for all
    using (organization_id = auth_org_id())
    with check (organization_id = auth_org_id());

create policy "Invoices public view via token"
    on invoices for select
    using (public_token is not null);

-- Invoice items : isolation via facture liée
create policy "Invoice items member policy"
    on invoice_items for all
    using (
        exists (
            select 1 from invoices
            where invoices.id = invoice_items.invoice_id
            and (invoices.organization_id = auth_org_id() or invoices.public_token is not null)
        )
    )
    with check (
        exists (
            select 1 from invoices
            where invoices.id = invoice_items.invoice_id
            and invoices.organization_id = auth_org_id()
        )
    );

-- Payments : isolation par organisation
create policy "Payments isolation policy"
    on payments for all
    using (organization_id = auth_org_id())
    with check (organization_id = auth_org_id());



-- ============================================================================
-- Données d'exemple initiales (Seed Data)
-- ============================================================================

-- ============================================================================
-- DANHOMEY Facture · Données de test et de démarrage (Seed Data)
-- ============================================================================

-- 1. Organisation principale
insert into organizations (
    id,
    name,
    slug,
    currency,
    vat_rate,
    invoice_prefix,
    next_invoice_number,
    tax_id,
    rccm,
    address,
    city,
    country,
    phone,
    email,
    bank_name,
    bank_rib,
    mobile_money_info
) values (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'DANHOMEY Technologies SARL',
    'danhomey-tech',
    'XOF',
    18,
    'FAC',
    49,
    '3201910845321',
    'RB/COT/21 B 28941',
    'Quartier Haie Vive, Rue 340',
    'Cotonou',
    'Bénin',
    '+229 97 00 12 34',
    'contact@danhomey.africa',
    'BOA Bénin',
    'BJ061 01001 002345678901 45',
    'Wave / MTN: +229 97 00 12 34'
) on conflict (id) do nothing;

-- 2. Clients
insert into customers (
    id,
    organization_id,
    name,
    contact_person,
    email,
    phone,
    address,
    city,
    country,
    tax_id,
    rccm,
    total_invoiced,
    total_paid,
    balance_due,
    invoices_count
) values 
(
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380001',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'SOTRA CI',
    'M. Bakary Coulibaly',
    'b.coulibaly@sotra.ci',
    '+225 07 08 09 10 11',
    'Boulevard de Marseille, Zone 3',
    'Abidjan',
    'Côte d''Ivoire',
    'CI-ABJ-2015-B-1420',
    'CI-ABJ-2015-B-1420',
    2850000,
    2850000,
    0,
    1
),
(
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380002',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Groupe Bâtir & Co Bénin',
    'M. Jean-Eudes Dossou',
    'je.dossou@batir.bj',
    '+229 96 12 34 56',
    'Zone Commerciale Ganhi, Rue du Commerce',
    'Cotonou',
    'Bénin',
    '0201810459201',
    'RB/COT/18 B 12049',
    5200000,
    3300000,
    1900000,
    2
),
(
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380003',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Cabinet Me Alapini & Associés',
    'Maître Reine Alapini',
    'contact@alapini-avocats.bj',
    '+229 97 45 67 89',
    'Les Cocotiers, Avenue Jean-Paul II',
    'Cotonou',
    'Bénin',
    '1201509384721',
    'RB/COT/15 A 8921',
    1200000,
    0,
    1200000,
    1
),
(
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380004',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Dakar Digital Hub SARL',
    'M. Abdoulaye Ndiaye',
    'a.ndiaye@dakardigital.sn',
    '+221 77 123 45 67',
    'Almadies, Route du Méridien',
    'Dakar',
    'Sénégal',
    '006849201 2V2',
    'SN-DKR-2021-B-8930',
    4100000,
    4100000,
    0,
    2
)
on conflict (id) do nothing;

