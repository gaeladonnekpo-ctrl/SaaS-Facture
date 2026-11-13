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

