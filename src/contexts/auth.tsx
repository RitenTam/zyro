import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { buildAuthRedirect, getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { normalizeAuthError, safeReturnTo } from "@/lib/supabase/auth";

type AuthActionResult = {
  error?: string;
  needsVerification?: boolean;
};

type AuthProviderName = "google" | "apple";

type AuthContextValue = {
  clientAvailable: boolean;
  configurationError?: string;
  loading: boolean;
  ready: boolean;
  session: Session | null;
  user: User | null;
  updateProfile: (profile: { fullName?: string; email?: string }) => Promise<AuthActionResult>;
  signIn: (email: string, password: string) => Promise<AuthActionResult>;
  signUp: (email: string, password: string, next?: string | null) => Promise<AuthActionResult>;
  signOut: () => Promise<AuthActionResult>;
  sendPasswordReset: (email: string, next?: string | null) => Promise<AuthActionResult>;
  updatePassword: (password: string) => Promise<AuthActionResult>;
  signInWithProvider: (provider: AuthProviderName, next?: string | null) => Promise<AuthActionResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const clientAvailable = isSupabaseConfigured();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [configurationError, setConfigurationError] = useState<string | undefined>(
    clientAvailable ? undefined : "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable authentication.",
  );

  const client = useMemo(() => {
    if (!clientAvailable) {
      return null;
    }

    try {
      return getSupabaseClient();
    } catch (error) {
      setConfigurationError(normalizeAuthError(error));
      return null;
    }
  }, [clientAvailable]);

  useEffect(() => {
    if (!client) {
      setLoading(false);
      return;
    }

    let active = true;

    client.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active) {
          return;
        }

        if (error) {
          setConfigurationError(normalizeAuthError(error));
        }

        setSession(data.session);
        setLoading(false);
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        setConfigurationError(normalizeAuthError(error));
        setLoading(false);
      });

    const { data } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [client]);

  const value = useMemo<AuthContextValue>(() => {
    const withClient = async (
      handler: (supabaseClient: NonNullable<typeof client>) => Promise<AuthActionResult>,
    ) => {
      if (!client) {
        return { error: configurationError ?? "Authentication is not configured." };
      }

      try {
        return await handler(client);
      } catch (error) {
        return { error: normalizeAuthError(error) };
      }
    };

    return {
      clientAvailable,
      configurationError,
      loading,
      ready: !loading,
      session,
      user: session?.user ?? null,
      updateProfile: (profile) =>
        withClient(async (supabaseClient) => {
          const updates: { email?: string; data?: { full_name?: string } } = {};

          if (typeof profile.email === "string" && profile.email.trim()) {
            updates.email = profile.email.trim().toLowerCase();
          }

          if (typeof profile.fullName === "string") {
            updates.data = { full_name: profile.fullName.trim() };
          }

          if (!updates.email && !updates.data) {
            return {};
          }

          const { error } = await supabaseClient.auth.updateUser(updates);

          if (error) {
            return { error: normalizeAuthError(error) };
          }

          return {};
        }),
      signIn: (email, password) =>
        withClient(async (supabaseClient) => {
          const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

          if (error) {
            return { error: normalizeAuthError(error) };
          }

          return {};
        }),
      signUp: (email, password, next) =>
        withClient(async (supabaseClient) => {
          const redirectPath = safeReturnTo(next);
          const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: buildAuthRedirect(`/auth-callback?next=${encodeURIComponent(redirectPath)}`),
            },
          });

          if (error) {
            return { error: normalizeAuthError(error) };
          }

          return { needsVerification: !data.session };
        }),
      signOut: () =>
        withClient(async (supabaseClient) => {
          const { error } = await supabaseClient.auth.signOut({ scope: "local" });

          if (error) {
            return { error: normalizeAuthError(error) };
          }

          return {};
        }),
      sendPasswordReset: (email, next) =>
        withClient(async (supabaseClient) => {
          const redirectPath = safeReturnTo(next);
          const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: buildAuthRedirect(`/auth-reset-password?next=${encodeURIComponent(redirectPath)}`),
          });

          if (error) {
            return { error: normalizeAuthError(error) };
          }

          return {};
        }),
      updatePassword: (password) =>
        withClient(async (supabaseClient) => {
          const { error } = await supabaseClient.auth.updateUser({ password });

          if (error) {
            return { error: normalizeAuthError(error) };
          }

          return {};
        }),
      signInWithProvider: (provider, next) =>
        withClient(async (supabaseClient) => {
          const redirectPath = safeReturnTo(next);
          const { error } = await supabaseClient.auth.signInWithOAuth({
            provider,
            options: {
              redirectTo: buildAuthRedirect(`/auth-callback?next=${encodeURIComponent(redirectPath)}`),
            },
          });

          if (error) {
            return { error: normalizeAuthError(error) };
          }

          return {};
        }),
    };
  }, [client, clientAvailable, configurationError, loading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}