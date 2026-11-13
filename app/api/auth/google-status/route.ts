import { NextResponse } from "next/server";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return NextResponse.json({ configured: false, reason: "Supabase URL missing" });
  }

  try {
    const probeUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent("http://localhost:3000")}`;
    const res = await fetch(probeUrl, {
      method: "GET",
      redirect: "manual",
      cache: "no-store",
    });

    if (res.status === 400) {
      const data = await res.json().catch(() => null);
      return NextResponse.json({
        configured: false,
        reason: data?.msg || "Google OAuth client ID non configuré",
      });
    }

    // A 302/303 redirect or 200 means Google OAuth provider is actively configured
    return NextResponse.json({ configured: true });
  } catch (err: any) {
    return NextResponse.json({
      configured: false,
      reason: err?.message || "Erreur de vérification",
    });
  }
}

