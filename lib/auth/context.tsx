"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export interface UserProfile {
  id: string;
  organizationId: string;
  role: "owner" | "admin" | "member" | "accountant";
  firstName: string;
  lastName: string;
  email: string;
}

interface SignUpInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (input: SignUpInput) => Promise<{ error: string | null; requiresOtp?: boolean; devOtp?: string }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: string | null }>;
  resendOtp: (email: string) => Promise<{ error: string | null; devOtp?: string }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  requestPasswordReset: (email: string) => Promise<{ error: string | null; devOtp?: string }>;
  resetPasswordWithOtp: (email: string, token: string, newPassword: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function normalizeAuthError(errMessage: string): string {
  const msg = errMessage.toLowerCase();
  if (msg.includes("rate limit") || msg.includes("rate_limit")) {
    return "Le quota d'envoi d'emails de test de Supabase (30 emails/h) a été temporairement dépassé. Veuillez patienter quelques instants ou configurer un service SMTP personnalisé.";
  }
  if (msg.includes("invalid login credentials")) {
    return "Identifiants de connexion invalides. Veuillez vérifier votre adresse email et votre mot de passe.";
  }
  if (msg.includes("already been registered") || msg.includes("already registered")) {
    return "Un compte existe déjà avec cette adresse email. Veuillez vous connecter.";
  }
  if (msg.includes("email not confirmed")) {
    return "Veuillez d'abord confirmer votre adresse email avec le code à 6 chiffres.";
  }
  if (
    msg.includes("token has expired") ||
    msg.includes("invalid token") ||
    msg.includes("otp expired") ||
    msg.includes("token is expired")
  ) {
    return "Le code de validation à 6 chiffres est incorrect ou a expiré. Veuillez vérifier et réessayer.";
  }
  return errMessage;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      const p: UserProfile = {
        id: data.id,
        organizationId: data.organization_id,
        role: data.role,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
      };
      setProfile(p);
      return p;
    } catch {
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    // 1. Initial session check
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      const initialSession = data?.session ?? null;
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      if (initialSession?.user) {
        fetchProfile(initialSession.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // 2. Auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, newSession: Session | null) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        await fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        return { error: "Supabase n'est pas configuré." };
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          setIsLoading(false);
          return { error: normalizeAuthError(error.message) };
        }

        setUser(data.user);
        setSession(data.session);
        if (data.user) {
          await fetchProfile(data.user.id);
        }
        setIsLoading(false);
        return { error: null };
      } catch (err: any) {
        setIsLoading(false);
        return { error: normalizeAuthError(err?.message || "Erreur lors de la connexion.") };
      }
    },
    [fetchProfile]
  );

  const signUp = useCallback(
    async (
      input: SignUpInput
    ): Promise<{ error: string | null; requiresOtp?: boolean; devOtp?: string }> => {
      setIsLoading(true);
      try {
        // 1. Primary: Use dedicated server route /api/auth/signup-otp
        // This generates OTP directly via admin.generateLink, bypassing Supabase shared mailer rate limit
        const response = await fetch("/api/auth/signup-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });

        const json = await response.json().catch(() => null);

        if (!response.ok) {
          setIsLoading(false);
          return { error: normalizeAuthError(json?.error || "Erreur lors de l'inscription.") };
        }

        setIsLoading(false);
        return {
          error: null,
          requiresOtp: true,
          devOtp: json?.devOtp,
        };
      } catch (err: any) {
        // 2. Fallback to browser client signUp if server route fails
        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
          setIsLoading(false);
          return { error: "Supabase n'est pas configuré." };
        }

        try {
          const { data, error } = await supabase.auth.signUp({
            email: input.email.trim(),
            password: input.password,
            options: {
              data: {
                first_name: input.firstName.trim(),
                last_name: input.lastName.trim(),
                company_name: input.companyName.trim(),
              },
            },
          });

          if (error) {
            setIsLoading(false);
            return { error: normalizeAuthError(error.message) };
          }

          const requiresOtp = !data.session;
          setUser(data.user);
          setSession(data.session);

          if (data.session && data.user) {
            await new Promise((r) => setTimeout(r, 600));
            await fetchProfile(data.user.id);
          }

          setIsLoading(false);
          return { error: null, requiresOtp };
        } catch (clientErr: any) {
          setIsLoading(false);
          return {
            error: normalizeAuthError(clientErr?.message || "Erreur lors de l'inscription."),
          };
        }
      }
    },
    [fetchProfile]
  );

  const verifyOtp = useCallback(
    async (email: string, token: string): Promise<{ error: string | null }> => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        return { error: "Supabase n'est pas configuré." };
      }

      setIsLoading(true);
      try {
        let { data, error } = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: token.trim(),
          type: "signup",
        });

        // If signup type failed, fallback to magiclink type (in case OTP was regenerated via magiclink)
        if (error) {
          const retry = await supabase.auth.verifyOtp({
            email: email.trim(),
            token: token.trim(),
            type: "magiclink",
          });
          if (!retry.error) {
            data = retry.data;
            error = null;
          }
        }

        if (error) {
          setIsLoading(false);
          return { error: normalizeAuthError(error.message) };
        }

        setUser(data.user);
        setSession(data.session);
        if (data.user) {
          await new Promise((r) => setTimeout(r, 600));
          await fetchProfile(data.user.id);
        }
        setIsLoading(false);
        return { error: null };
      } catch (err: any) {
        setIsLoading(false);
        return { error: normalizeAuthError(err?.message || "Code invalide ou expiré.") };
      }
    },
    [fetchProfile]
  );

  const resendOtp = useCallback(
    async (email: string): Promise<{ error: string | null; devOtp?: string }> => {
      try {
        const response = await fetch("/api/auth/resend-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        });

        const json = await response.json().catch(() => null);

        if (!response.ok) {
          return { error: normalizeAuthError(json?.error || "Impossible de renvoyer le code.") };
        }

        return { error: null, devOtp: json?.devOtp };
      } catch (err: any) {
        return { error: normalizeAuthError(err?.message || "Erreur lors du renvoi du code.") };
      }
    },
    []
  );

  const signInWithGoogle = useCallback(async (): Promise<{ error: string | null }> => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return { error: "Supabase n'est pas configuré." };
    }

    try {
      // Pre-check if Google OAuth is actually configured on Supabase
      const checkRes = await fetch("/api/auth/google-status", { cache: "no-store" }).catch(() => null);
      if (checkRes && checkRes.ok) {
        const checkData = await checkRes.json().catch(() => null);
        if (checkData && checkData.configured === false) {
          return { error: "GOOGLE_NOT_CONFIGURED" };
        }
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
          queryParams: {
            prompt: "select_account consent",
            access_type: "offline",
          },
        },
      });

      if (error) return { error: error.message };
      return { error: null };
    } catch (err: any) {
      return { error: err?.message || "Erreur lors de la connexion Google." };
    }
  }, []);

  const requestPasswordReset = useCallback(
    async (email: string): Promise<{ error: string | null; devOtp?: string }> => {
      try {
        const response = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        });

        const json = await response.json().catch(() => null);

        if (!response.ok) {
          return {
            error: normalizeAuthError(json?.error || "Erreur lors de la demande de réinitialisation."),
          };
        }

        return { error: null, devOtp: json?.devOtp };
      } catch (err: any) {
        return {
          error: normalizeAuthError(err?.message || "Erreur lors de la demande de réinitialisation."),
        };
      }
    },
    []
  );

  const resetPasswordWithOtp = useCallback(
    async (
      email: string,
      token: string,
      newPassword: string
    ): Promise<{ error: string | null }> => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        return { error: "Supabase n'est pas configuré." };
      }

      setIsLoading(true);
      try {
        // 1. Verify recovery OTP
        const { data, error: verifyErr } = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: token.trim(),
          type: "recovery",
        });

        if (verifyErr) {
          setIsLoading(false);
          return { error: normalizeAuthError(verifyErr.message) };
        }

        // 2. Update user password
        const { error: updateErr } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (updateErr) {
          setIsLoading(false);
          return { error: normalizeAuthError(updateErr.message) };
        }

        setUser(data.user);
        setSession(data.session);
        if (data.user) {
          await new Promise((r) => setTimeout(r, 600));
          await fetchProfile(data.user.id);
        }

        setIsLoading(false);
        return { error: null };
      } catch (err: any) {
        setIsLoading(false);
        return {
          error: normalizeAuthError(err?.message || "Erreur lors de la mise à jour du mot de passe."),
        };
      }
    },
    [fetchProfile]
  );

  const signOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        signIn,
        signUp,
        verifyOtp,
        resendOtp,
        signInWithGoogle,
        requestPasswordReset,
        resetPasswordWithOtp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
