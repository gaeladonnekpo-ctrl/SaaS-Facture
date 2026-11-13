import https from "https";
import fs from "fs";
import path from "path";

const SUPABASE_MANAGEMENT_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || "";
const PROJECT_REF = "pvwelxbmypapxwmmkbst";

/**
 * Configure Brevo SMTP dans Supabase via Management API et dans .env.local
 */
export async function configureBrevo({ smtpUser, smtpPass, senderEmail, senderName = "DANHOMEY Facture" }) {
  console.log("=== CONFIGURATION DE BREVO SMTP DANS SUPABASE ET NEXT.JS ===");
  console.log(`Serveur : smtp-relay.brevo.com:587`);
  console.log(`Utilisateur : ${smtpUser}`);
  console.log(`Expéditeur : ${senderEmail} (${senderName})`);

  // 1. Mise à jour de .env.local
  const envPath = path.resolve(process.cwd(), ".env.local");
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";

  // Supprimer les anciennes configs SMTP si présentes
  envContent = envContent
    .split("\n")
    .filter(line => !line.startsWith("SMTP_"))
    .join("\n")
    .trim();

  const newSmtpVars = `
# Brevo SMTP Configuration
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=${smtpUser}
SMTP_PASS=${smtpPass}
SMTP_FROM="${senderName} <${senderEmail}>"
`.trim();

  fs.writeFileSync(envPath, envContent + "\n\n" + newSmtpVars + "\n", "utf8");
  console.log("✓ Fichier .env.local mis à jour avec les identifiants Brevo.");

  // 2. Configuration dans Supabase Auth via Management API
  const emailHtml = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb;">
  <div style="text-align: center; margin-bottom: 28px;">
    <div style="display: inline-block; padding: 10px 18px; background: #0F241B; border-radius: 12px; margin-bottom: 12px;">
      <span style="font-size: 18px; font-weight: bold; color: #9FE870; letter-spacing: 0.5px;">DANHOMEY Facture</span>
    </div>
    <h1 style="font-size: 22px; font-weight: 700; color: #0F241B; margin: 8px 0 0 0;">Vérification de votre compte</h1>
  </div>
  
  <p style="font-size: 15px; color: #374151; line-height: 1.6; margin: 0 0 20px 0;">
    Bonjour,<br/><br/>
    Merci d'avoir créé votre compte sur <strong>DANHOMEY Facture</strong>. Pour finaliser votre inscription et activer votre espace de facturation, veuillez saisir le code de vérification à 6 chiffres ci-dessous dans l'application :
  </p>
  
  <div style="background: #F0FDF4; border: 2px dashed #86EFAC; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
    <span style="font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: #166534; font-weight: 600; display: block; margin-bottom: 8px;">Votre code de confirmation</span>
    <span style="font-family: monospace; font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #0F241B; display: inline-block;">{{ .Token }}</span>
    <span style="font-size: 12px; color: #6B7280; display: block; margin-top: 8px;">Ce code expire dans 60 minutes.</span>
  </div>
  
  <p style="font-size: 13px; color: #6B7280; line-height: 1.5; margin: 24px 0 0 0; text-align: center;">
    Vous pouvez également cliquer directement sur le lien ci-dessous :<br/>
    <a href="{{ .ConfirmationURL }}" style="color: #0F241B; font-weight: 600; text-decoration: underline;">Confirmer mon adresse email</a>
  </p>
  
  <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 28px 0 20px 0;" />
  
  <p style="font-size: 12px; color: #9CA3AF; text-align: center; margin: 0;">
    Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.<br/>
    &copy; 2026 DANHOMEY Facture · SaaS de Facturation FCFA (UEMOA / CEMAC)
  </p>
</div>
`.trim();

  const supabasePayload = JSON.stringify({
    smtp_host: "smtp-relay.brevo.com",
    smtp_port: "587",
    smtp_user: smtpUser,
    smtp_pass: smtpPass,
    smtp_admin_email: senderEmail,
    smtp_sender_name: senderName,
    rate_limit_email_sent: 100, // Débloque le quota d'envoi
    mailer_subjects_confirmation: "DANHOMEY Facture - Votre code de confirmation : {{ .Token }}",
    mailer_templates_confirmation_content: emailHtml,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.supabase.com",
        path: `/v1/projects/${PROJECT_REF}/config/auth`,
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${SUPABASE_MANAGEMENT_TOKEN}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(supabasePayload),
          "User-Agent": "Node",
        },
      },
      (res) => {
        let body = "";
        res.on("data", (d) => (body += d));
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log("✓ Supabase Auth configuré avec succès avec Brevo SMTP et template OTP !");
            resolve({ success: true, body: JSON.parse(body || "{}") });
          } else {
            console.error(`✗ Erreur Supabase API (${res.statusCode}):`, body);
            resolve({ success: false, status: res.statusCode, error: body });
          }
        });
      }
    );

    req.on("error", (err) => {
      console.error("Erreur de requête Supabase API:", err);
      reject(err);
    });

    req.write(supabasePayload);
    req.end();
  });
}

// Exécution directe si arguments fournis : node configure-brevo-smtp.mjs <user> <pass> <senderEmail>
if (process.argv[2] && process.argv[3]) {
  const smtpUser = process.argv[2];
  const smtpPass = process.argv[3];
  const senderEmail = process.argv[4] || smtpUser;
  configureBrevo({ smtpUser, smtpPass, senderEmail })
    .then((r) => console.log("Terminé :", r))
    .catch(console.error);
}

