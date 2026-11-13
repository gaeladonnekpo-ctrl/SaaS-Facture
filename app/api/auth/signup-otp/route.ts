import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validatePassword } from "@/lib/validation/password";
import { sendOtpEmail, isSmtpConfigured } from "@/lib/email/send-otp";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, companyName } = body || {};

    if (!email || !password || !firstName || !lastName || !companyName) {
      return NextResponse.json(
        { error: "Veuillez renseigner tous les champs obligatoires." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    if (!cleanEmail.includes("@")) {
      return NextResponse.json(
        { error: "Veuillez fournir une adresse email valide." },
        { status: 400 }
      );
    }

    // Password strength check
    const passwordValidation = validatePassword(String(password));
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          error:
            "Le mot de passe doit comporter au moins 8 caractères et combiner des lettres, des chiffres et des caractères spéciaux.",
        },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Generate link and OTP code via Supabase admin (bypasses Supabase's shared mailer rate limit)
    const { data, error } = await admin.auth.admin.generateLink({
      type: "signup",
      email: cleanEmail,
      password: String(password),
      options: {
        data: {
          first_name: String(firstName).trim(),
          last_name: String(lastName).trim(),
          company_name: String(companyName).trim(),
        },
      },
    });

    if (error) {
      // Handle user already exists
      if (
        error.message?.toLowerCase().includes("already been registered") ||
        error.message?.toLowerCase().includes("user already exists")
      ) {
        return NextResponse.json(
          {
            error:
              "Un compte existe déjà avec cette adresse email. Veuillez vous connecter.",
          },
          { status: 409 }
        );
      }

      console.error("[signup-otp] Admin generateLink error:", error);
      return NextResponse.json(
        { error: error.message || "Erreur lors de la création du compte." },
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

    // Attempt email dispatch via SMTP / Resend
    const sendRes = await sendOtpEmail({
      to: cleanEmail,
      otp: emailOtp,
      actionLink,
      recipientName: `${firstName} ${lastName}`,
    });

    const smtpActive = isSmtpConfigured();

    return NextResponse.json({
      success: true,
      requiresOtp: true,
      email: cleanEmail,
      smtpSent: sendRes.sent,
      // Provide devOtp when SMTP is not configured or in development for effortless testing
      devOtp: !smtpActive || process.env.NODE_ENV !== "production" ? emailOtp : undefined,
    });
  } catch (err: any) {
    console.error("[signup-otp] Unexpected server error:", err);
    return NextResponse.json(
      { error: err?.message || "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
