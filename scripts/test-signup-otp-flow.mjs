import fs from "fs";
import { createClient } from "@supabase/supabase-js";

let SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
let ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
let SERVICE_KEY = process.env.SUPABASE_SECRET_KEY || "";

if (fs.existsSync(".env.local")) {
  const content = fs.readFileSync(".env.local", "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim();
        if (k === "NEXT_PUBLIC_SUPABASE_URL" && !SUPABASE_URL) SUPABASE_URL = v;
        if ((k === "NEXT_PUBLIC_SUPABASE_ANON_KEY" || k === "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") && !ANON_KEY) ANON_KEY = v;
        if (k === "SUPABASE_SECRET_KEY" && !SERVICE_KEY) SERVICE_KEY = v;
      }
    }
  }
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY || ANON_KEY);
const anon = createClient(SUPABASE_URL, ANON_KEY);

async function run() {
  console.log("=== TEST DU FLUX COMPLET D'INSCRIPTION AVEC CODE OTP À 6 CHIFFRES ===");

  const testEmail = `romaric.test.${Date.now()}@gmail.com`;
  const testPassword = "Password123!";
  const firstName = "Romaric";
  const lastName = "SONON";
  const companyName = "SONON & Associés SARL";

  console.log(`\n1. Inscription via API /api/auth/signup-otp (${testEmail})...`);
  const response = await fetch("http://localhost:3000/api/auth/signup-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      firstName,
      lastName,
      companyName,
    }),
  });

  const json = await response.json();
  console.log("Status HTTP:", response.status);
  console.log("Réponse:", json);

  if (!response.ok || !json.devOtp) {
    throw new Error(`Échec de l'inscription: ${JSON.stringify(json)}`);
  }

  const otpCode = json.devOtp;
  console.log(`\n✓ Code OTP à 6 chiffres généré avec succès : [ ${otpCode} ]`);
  console.log(`✓ Zéro blocage rate-limit ! Bypasse le quota Supabase partagé.`);

  console.log(`\n2. Validation du code à 6 chiffres via supabase.auth.verifyOtp...`);
  const { data: verifyData, error: verifyErr } = await anon.auth.verifyOtp({
    email: testEmail,
    token: otpCode,
    type: "signup",
  });

  if (verifyErr) {
    throw new Error(`Échec verifyOtp: ${verifyErr.message}`);
  }

  console.log(`✓ Vérification OTP réussie ! ID Utilisateur : ${verifyData.user.id}`);
  console.log(`✓ Session JWT valide obtenue : ${!!verifyData.session}`);
  console.log(`✓ Email confirmé à : ${verifyData.user.email_confirmed_at}`);

  // Attendre 600ms que le trigger SQL crée le profil et l'organisation
  await new Promise((r) => setTimeout(r, 700));

  console.log(`\n3. Vérification de la création automatique du profil et de l'organisation dans Supabase...`);
  const { data: profile, error: profErr } = await admin
    .from("profiles")
    .select("*, organizations(*)")
    .eq("id", verifyData.user.id)
    .single();

  if (profErr || !profile) {
    throw new Error(`Profil introuvable: ${profErr?.message}`);
  }

  console.log(`✓ Profil trouvé : ${profile.first_name} ${profile.last_name} (${profile.email})`);
  console.log(`✓ Rôle : ${profile.role}`);
  console.log(`✓ Organisation liée : ${profile.organizations?.name}`);

  console.log(`\n4. Nettoyage du compte de test...`);
  await admin.auth.admin.deleteUser(verifyData.user.id);
  console.log(`✓ Utilisateur supprimé.`);

  console.log("\n========================================================");
  console.log("🎉 TOUS LES TESTS DU SYSTÈME D'INSCRIPTION OTP SONT VALIDÉS !");
  console.log("========================================================");
}

run().catch((err) => {
  console.error("ERREUR DE TEST:", err);
  process.exit(1);
});

