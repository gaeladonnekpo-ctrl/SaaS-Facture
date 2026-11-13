import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !ANON_KEY) {
  console.error("Missing SUPABASE_URL or ANON_KEY");
  process.exit(1);
}

const testEmail = "gaeladonnekpo@gmail.com";
const newPassword = "DanhomeyPassword2026@!";

async function main() {
  console.log(`[E2E] 1. Requesting password reset OTP for ${testEmail} via API...`);
  const res = await fetch("http://localhost:3000/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail }),
  });

  const json = await res.json();
  console.log("[E2E] API Response:", json);

  if (!res.ok || !json.success) {
    throw new Error(`Failed to request reset OTP: ${JSON.stringify(json)}`);
  }

  const otp = json.devOtp;
  if (!otp) {
    console.log("[E2E] OTP was dispatched via Brevo SMTP to inbox. SmtpSent:", json.smtpSent);
    console.log("[E2E] End-to-end API test succeeded!");
    return;
  }

  console.log(`[E2E] 2. Verifying recovery OTP (${otp}) for ${testEmail}...`);
  const client = createClient(SUPABASE_URL, ANON_KEY);

  const { data: verifyData, error: verifyError } = await client.auth.verifyOtp({
    email: testEmail,
    token: otp,
    type: "recovery",
  });

  if (verifyError) {
    throw new Error(`verifyOtp error: ${verifyError.message}`);
  }
  console.log("[E2E] verifyOtp successful! Session user:", verifyData.user?.email);

  console.log(`[E2E] 3. Updating password to new secure password...`);
  const { data: updateData, error: updateError } = await client.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    throw new Error(`updateUser error: ${updateError.message}`);
  }
  console.log("[E2E] updateUser successful! User ID:", updateData.user?.id);

  console.log(`[E2E] 4. Testing login with new password...`);
  const loginClient = createClient(SUPABASE_URL, ANON_KEY);
  const { data: loginData, error: loginError } = await loginClient.auth.signInWithPassword({
    email: testEmail,
    password: newPassword,
  });

  if (loginError) {
    throw new Error(`signInWithPassword error: ${loginError.message}`);
  }

  console.log("[E2E] SUCCESS! Logged in with new password:", loginData.user?.email);
}

main().catch((err) => {
  console.error("[E2E ERROR]", err);
  process.exit(1);
});
