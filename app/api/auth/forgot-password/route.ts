import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPasswordResetEmail, isSmtpConfigured } from "@/lib/email/send-otp";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body || {};

    if (!email) {
      return NextResponse.json(
        { error: "Veuillez renseigner votre adresse email." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    if (!cleanEmail.includes("@")) {
      return NextResponse.json(
        { error: "Veuillez renseigner une adresse email valide." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Generate recovery link & 6-digit OTP code via Supabase Admin
    const { data, error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email: cleanEmail,
    });

    if (error) {
      console.warn("[forgot-password] Generate recovery link error:", error.message);
      // To prevent user enumeration attacks, we return success even if user does not exist
      return NextResponse.json({
        success: true,
        message: "Si un compte existe avec cette adresse, un code de réinitialisation vous a été envoyé.",
      });
    }

    const emailOtp = data.properties?.email_otp;
    const actionLink = data.properties?.action_link;

    if (!emailOtp) {
      return NextResponse.json(
        { error: "Impossible de générer le code de réinitialisation." },
        { status: 500 }
      );
    }

    // Retrieve user first name if available
    let recipientName = "Cher utilisateur";
    if (data.user?.user_metadata?.first_name) {
      recipientName = `${data.user.user_metadata.first_name} ${data.user.user_metadata.last_name || ""}`.trim();
    }

    // Send email via Brevo SMTP
    const sendRes = await sendPasswordResetEmail({
      to: cleanEmail,
      otp: emailOtp,
      actionLink,
      recipientName,
    });

    const smtpActive = isSmtpConfigured();

    return NextResponse.json({
      success: true,
      email: cleanEmail,
      smtpSent: sendRes.sent,
      devOtp: !smtpActive || process.env.NODE_ENV !== "production" ? emailOtp : undefined,
    });
  } catch (err: any) {
    console.error("[forgot-password] Unexpected error:", err);
    return NextResponse.json(
      { error: err?.message || "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}

