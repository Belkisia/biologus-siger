import { createServerFileRoute } from "@tanstack/react-start/server";
export const ServerRoute = createServerFileRoute("/lovable/email/suppression").methods({
  GET: async () => Response.json({ suppressions: [] }),
  DELETE: async () => Response.json({ ok: true }),
});
