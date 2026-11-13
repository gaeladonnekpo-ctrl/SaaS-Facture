import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const envContent = fs.readFileSync(".env.local", "utf8");
const env = {};
envContent.split("\n").forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#")) {
    const idx = trimmed.indexOf("=");
    if (idx !== -1) env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
});

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });

async function check() {
  const { data: users, error: uErr } = await admin.auth.admin.listUsers();
  console.log("=== USERS in auth.users ===");
  users?.users?.forEach(u => console.log(`- ${u.id}: ${u.email} (confirmed: ${!!u.email_confirmed_at})`, u.user_metadata));

  const { data: profiles, error: pErr } = await admin.from("profiles").select("*");
  console.log("\n=== PROFILES ===");
  profiles?.forEach(p => console.log(`- Profile ${p.id}: ${p.email}, org: ${p.organization_id}, role: ${p.role}`));

  const { data: orgs, error: oErr } = await admin.from("organizations").select("id, name, slug, email");
  console.log("\n=== ORGANIZATIONS ===");
  orgs?.forEach(o => console.log(`- Org ${o.id}: "${o.name}" (email: ${o.email})`));

  const { data: custs } = await admin.from("customers").select("id, name, organization_id");
  console.log("\n=== CUSTOMERS ===");
  custs?.forEach(c => console.log(`- Customer ${c.id}: "${c.name}" -> org: ${c.organization_id}`));

  const { data: invs } = await admin.from("invoices").select("id, number, organization_id");
  console.log("\n=== INVOICES ===");
  invs?.forEach(i => console.log(`- Invoice ${i.id}: "${i.number}" -> org: ${i.organization_id}`));
}

check().catch(console.error);

