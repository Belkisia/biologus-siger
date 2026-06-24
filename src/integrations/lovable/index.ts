// Substituição independente do @lovable.dev/cloud-auth-js
// Usa Supabase OAuth nativo diretamente
import { supabase } from "../supabase/client";

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

export const lovable = {
  auth: {
    signInWithOAuth: async (provider: "google" | "apple" | "microsoft" | "lovable", opts?: SignInOptions) => {
      try {
        const supabaseProvider = provider === "lovable" ? "google" : provider as "google" | "apple";
        const { error } = await supabase.auth.signInWithOAuth({
          provider: supabaseProvider,
          options: {
            redirectTo: opts?.redirect_uri ?? window.location.origin,
            queryParams: opts?.extraParams,
          },
        });
        if (error) return { error, redirected: false };
        return { error: null, redirected: true };
      } catch (e) {
        return { error: e instanceof Error ? e : new Error(String(e)), redirected: false };
      }
    },
  },
};
