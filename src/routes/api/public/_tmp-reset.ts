import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/_tmp-reset")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get("k") !== "biologus-2026-once") {
          return new Response("forbidden", { status: 403 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: list, error: e1 } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
        if (e1) return new Response(e1.message, { status: 500 });
        const user = list.users.find(u => u.email === "comercial@biologusambiental.com.br");
        if (!user) return new Response("user not found", { status: 404 });
        const { error: e2 } = await supabaseAdmin.auth.admin.updateUserById(user.id, { password: "12345678" });
        if (e2) return new Response(e2.message, { status: 500 });
        return new Response(JSON.stringify({ ok: true, id: user.id }), { headers: { "content-type": "application/json" } });
      },
    },
  },
});
