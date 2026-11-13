import nodemailer from "nodemailer";

interface SendOtpOptions {
  to: string;
  otp: string;
  actionLink?: string;
  recipientName?: string;
}

export function isSmtpConfigured(): boolean {
  return Boolean(
    (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) ||
    process.env.RESEND_API_KEY ||
    process.env.BREVO_API_KEY
  );
}

export async function sendOtpEmail({
  to,
  otp,
  actionLink,
  recipientName = "Cher utilisateur",
}: SendOtpOptions): Promise<{ sent: boolean; error?: string }> {
  try {
    // 1. If Brevo REST API Key is configured
    if (process.env.BREVO_API_KEY) {
      const senderEmail = process.env.SMTP_USER || "gaeladonnekpo@gmail.com";
      const senderName = "DANHOMEY Facture";

      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: to, name: recipientName }],
          subject: `DANHOMEY Facture - Votre code de confirmation : ${otp}`,
          htmlContent: getEmailHtml({ otp, actionLink, recipientName }),
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        console.error("[Brevo API Error]:", errJson);
        return { sent: false, error: JSON.stringify(errJson) };
      }
      return { sent: true };
    }

    // 2. If Resend API Key is configured
    if (process.env.RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.SMTP_FROM || "DANHOMEY Facture <onboarding@resend.dev>",
          to: [to],
          subject: `DANHOMEY Facture - Votre code de confirmation : ${otp}`,
          html: getEmailHtml({ otp, actionLink, recipientName }),
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        return { sent: false, error: JSON.stringify(errJson) };
      }
      return { sent: true };
    }

    // 3. If Standard SMTP is configured (Brevo Relay, Gmail, Hostinger, Mailgun, etc.)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const port = Number(process.env.SMTP_PORT) || 587;
      const secure = port === 465;

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"DANHOMEY Facture" <${process.env.SMTP_USER}>`,
        to,
        subject: `DANHOMEY Facture - Votre code de confirmation : ${otp}`,
        html: getEmailHtml({ otp, actionLink, recipientName }),
      });

      return { sent: true };
    }

    // 4. Fallback: No SMTP configured yet
    console.info(`[DANHOMEY Auth] Email OTP généré pour ${to}: ${otp}`);
    return { sent: false, error: "SMTP_NOT_CONFIGURED" };
  } catch (err: any) {
    console.error("[DANHOMEY Auth] Erreur d'envoi d'email OTP:", err);
    return { sent: false, error: err?.message || "Erreur d'envoi SMTP" };
  }
}

export async function sendPasswordResetEmail({
  to,
  otp,
  actionLink,
  recipientName = "Cher utilisateur",
}: SendOtpOptions): Promise<{ sent: boolean; error?: string }> {
  try {
    const subject = `DANHOMEY Facture - Réinitialisation de votre mot de passe (Code : ${otp})`;
    const html = getPasswordResetHtml({ otp, actionLink, recipientName });

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const port = Number(process.env.SMTP_PORT) || 587;
      const secure = port === 465;

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"DANHOMEY Facture" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });

      return { sent: true };
    }

    console.info(`[DANHOMEY Auth] Email Reset Password généré pour ${to}: ${otp}`);
    return { sent: false, error: "SMTP_NOT_CONFIGURED" };
  } catch (err: any) {
    console.error("[DANHOMEY Auth] Erreur d'envoi email reset password:", err);
    return { sent: false, error: err?.message || "Erreur d'envoi SMTP" };
  }
}

function getEmailHtml({
  otp,
  actionLink,
  recipientName,
}: {
  otp: string;
  actionLink?: string;
  recipientName: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>DANHOMEY Facture - Code de confirmation</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #F8FAF9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F2937;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #E5E7EB; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
    
    <!-- Header -->
    <div style="background: #0F241B; padding: 28px 24px; text-align: center;">
      <div style="display: inline-block; padding: 8px 16px; background: rgba(159, 232, 112, 0.15); border: 1px solid rgba(159, 232, 112, 0.4); border-radius: 9999px; margin-bottom: 8px;">
        <span style="font-size: 14px; font-weight: 700; color: #9FE870; letter-spacing: 0.5px;">DANHOMEY Facture</span>
      </div>
      <h1 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 8px 0 0 0; letter-spacing: -0.3px;">
        Vérification de votre compte
      </h1>
    </div>

    <!-- Body -->
    <div style="padding: 32px 28px;">
      <p style="font-size: 15px; line-height: 1.6; margin: 0 0 20px 0; color: #374151;">
        Bonjour <strong>${recipientName}</strong>,<br/><br/>
        Merci d'avoir créé votre compte sur <strong>DANHOMEY Facture</strong>, la plateforme de facturation conforme aux normes SYSCOHADA (UEMOA / CEMAC).
      </p>

      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; color: #4B5563;">
        Pour finaliser votre inscription et activer votre espace, veuillez saisir le code de vérification à 6 chiffres suivant dans l'application :
      </p>

      <!-- OTP Box -->
      <div style="background: #F0FDF4; border: 2px dashed #86EFAC; border-radius: 12px; padding: 24px 16px; text-align: center; margin: 24px 0;">
        <span style="display: block; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #166534; margin-bottom: 8px;">
          Votre code de validation
        </span>
        <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #0F241B; display: inline-block;">
          ${otp}
        </span>
        <span style="display: block; font-size: 12px; color: #6B7280; margin-top: 8px;">
          Ce code est valable pendant 60 minutes.
        </span>
      </div>

      ${
        actionLink
          ? `
      <div style="text-align: center; margin: 28px 0 16px 0;">
        <p style="font-size: 13px; color: #6B7280; margin: 0 0 12px 0;">
          Ou cliquez directement sur le bouton ci-dessous :
        </p>
        <a href="${actionLink}" style="display: inline-block; background: #0F241B; color: #9FE870; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 10px;">
          Activer mon compte &rarr;
        </a>
      </div>
      `
          : ""
      }

      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0 20px 0;" />

      <p style="font-size: 12px; line-height: 1.5; color: #9CA3AF; margin: 0; text-align: center;">
        Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.<br/>
        &copy; 2026 DANHOMEY Facture · SaaS de Facturation FCFA
      </p>
    </div>

  </div>
</body>
</html>
  `.trim();
}

function getPasswordResetHtml({
  otp,
  actionLink,
  recipientName,
}: {
  otp: string;
  actionLink?: string;
  recipientName: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>DANHOMEY Facture - Réinitialisation du mot de passe</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #F8FAF9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F2937;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #E5E7EB; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
    
    <!-- Header -->
    <div style="background: #0F241B; padding: 28px 24px; text-align: center;">
      <div style="display: inline-block; padding: 8px 16px; background: rgba(159, 232, 112, 0.15); border: 1px solid rgba(159, 232, 112, 0.4); border-radius: 9999px; margin-bottom: 8px;">
        <span style="font-size: 14px; font-weight: 700; color: #9FE870; letter-spacing: 0.5px;">DANHOMEY Facture</span>
      </div>
      <h1 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 8px 0 0 0; letter-spacing: -0.3px;">
        Réinitialisation de votre mot de passe
      </h1>
    </div>

    <!-- Body -->
    <div style="padding: 32px 28px;">
      <p style="font-size: 15px; line-height: 1.6; margin: 0 0 20px 0; color: #374151;">
        Bonjour <strong>${recipientName}</strong>,<br/><br/>
        Une demande de réinitialisation de mot de passe a été initiée pour votre compte <strong>DANHOMEY Facture</strong>.
      </p>

      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; color: #4B5563;">
        Pour définir un nouveau mot de passe et sécuriser votre accès, veuillez saisir le code de sécurité à 6 chiffres suivant dans l'application :
      </p>

      <!-- OTP Box -->
      <div style="background: #F0FDF4; border: 2px dashed #86EFAC; border-radius: 12px; padding: 24px 16px; text-align: center; margin: 24px 0;">
        <span style="display: block; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #166534; margin-bottom: 8px;">
          Code de réinitialisation
        </span>
        <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #0F241B; display: inline-block;">
          ${otp}
        </span>
        <span style="display: block; font-size: 12px; color: #6B7280; margin-top: 8px;">
          Ce code expire dans 15 minutes.
        </span>
      </div>

      ${
        actionLink
          ? `
      <div style="text-align: center; margin: 28px 0 16px 0;">
        <p style="font-size: 13px; color: #6B7280; margin: 0 0 12px 0;">
          Ou cliquez directement sur le bouton sécurisé ci-dessous :
        </p>
        <a href="${actionLink}" style="display: inline-block; background: #0F241B; color: #9FE870; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 10px;">
          Définir un nouveau mot de passe &rarr;
        </a>
      </div>
      `
          : ""
      }

      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0 20px 0;" />

      <p style="font-size: 12px; line-height: 1.5; color: #9CA3AF; margin: 0; text-align: center;">
        Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité. Votre mot de passe actuel reste inchangé.<br/>
        &copy; 2026 DANHOMEY Facture · SaaS de Facturation FCFA
      </p>
    </div>

  </div>
</body>
</html>
  `.trim();
}
