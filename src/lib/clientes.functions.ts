import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const LinkSchema = z.object({
  cliente_id: z.string().uuid(),
  email: z.string().email().max(255),
});

export const vincularClienteUsuario = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => LinkSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Verifica permissão (admin ou comercial)
    const { data: roles } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const allowed = (roles ?? []).some((r) => r.role === "admin" || r.role === "comercial");
    if (!allowed) throw new Error("Sem permissão para vincular usuários");

    // Procura usuário por email
    const { data: profile, error: pErr } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .ilike("email", data.email)
      .maybeSingle();
    if (pErr) throw pErr;
    if (!profile) throw new Error("Nenhum usuário encontrado com este e-mail");

    const { error } = await supabaseAdmin
      .from("clientes")
      .update({ user_id: profile.id })
      .eq("id", data.cliente_id);
    if (error) throw error;

    return { ok: true, user_id: profile.id, email: profile.email };
  });

const UnlinkSchema = z.object({ cliente_id: z.string().uuid() });

export const desvincularClienteUsuario = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => UnlinkSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roles } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const allowed = (roles ?? []).some((r) => r.role === "admin" || r.role === "comercial");
    if (!allowed) throw new Error("Sem permissão");

    const { error } = await supabaseAdmin
      .from("clientes")
      .update({ user_id: null })
      .eq("id", data.cliente_id);
    if (error) throw error;
    return { ok: true };
  });
