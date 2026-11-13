import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
    }
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SECRET_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  console.log('Querying Supabase live tables...');

  const { data: orgs, error: orgErr } = await supabase.from('organizations').select('*');
  console.log('1. Organizations count:', orgs?.length, orgErr || '');
  if (orgs && orgs[0]) console.log('   Org name:', orgs[0].name, 'IFU:', orgs[0].tax_id);

  const { data: custs, error: custErr } = await supabase.from('customers').select('*');
  console.log('2. Customers count:', custs?.length, custErr || '');
  if (custs && custs[0]) console.log('   Sample customer:', custs[0].name, custs[0].city);

  const { data: invs, error: invErr } = await supabase.from('invoices').select('*, invoice_items(*), payments(*)');
  console.log('3. Invoices count:', invs?.length, invErr || '');
  if (invs && invs[0]) console.log('   Sample invoice:', invs[0].number, 'Total:', invs[0].total, 'Items count:', invs[0].invoice_items?.length);
}

main().catch(console.error);

