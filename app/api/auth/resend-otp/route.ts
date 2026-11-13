import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOtpEmail, isSmtpConfigured } from "@/lib/email/send-otp";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body || {};

    if (!email) {
      return NextResponse.json(
        { error: "Adresse email manquante." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const admin = createAdminClient();

    // If password is provided, generate a signup link. Otherwise generate a magiclink.
    const linkParams = password
      ? {
          type: "signup" as const,
          email: cleanEmail,
          password: String(password),
        }
      : {
          type: "magiclink" as const,
          email: cleanEmail,
        };

    const { data, error } = await admin.auth.admin.generateLink(linkParams);

    if (error) {
      console.error("[resend-otp] Admin generateLink error:", error);
      return NextResponse.json(
        { error: error.message || "Impossible de renvoyer le code." },
        { status: 400 }
      );
    }

    const emailOtp = data.properties?.email_otp;
    const actionLink = data.properties?.action_link;

    if (!emailOtp) {
      return NextResponse.json(
        { error: "Impossible de générer le code de validation." },
        { status: 500 }
      );
    }

    const sendRes = await sendOtpEmail({
      to: cleanEmail,
      otp: emailOtp,
      actionLink,
    });

    const smtpActive = isSmtpConfigured();

    return NextResponse.json({
      success: true,
      email: cleanEmail,
      smtpSent: sendRes.sent,
      devOtp: !smtpActive || process.env.NODE_ENV !== "production" ? emailOtp : undefined,
    });
  } catch (err: any) {
    console.error("[resend-otp] Server error:", err);
    return NextResponse.json(
      { error: err?.message || "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
