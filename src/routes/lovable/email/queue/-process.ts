// @ts-nocheck
import { createServerFileRoute } from "@tanstack/react-start/server";
export const ServerRoute = createServerFileRoute("/lovable/email/queue/process").methods({
  POST: async () => Response.json({ ok: true, processed: 0 }),
});
