// @ts-nocheck
import { createServerFileRoute } from "@tanstack/react-start/server";
import { render } from "@react-email/components";
import * as React from "react";
import { createClient } from "@supabase/supabase-js";
import { SignupEmail } from "@/lib/email-templates/signup";
import { InviteEmail } from "@/lib/email-templates/invite";
import { MagicLinkEmail } from "@/lib/email-templates/magic-link";
import { RecoveryEmail } from "@/lib/email-templates/recovery";
import { EmailChangeEmail } from "@/lib/email-templates/email-change";
import { ReauthenticationEmail } from "@/lib/email-templates/reauthentication";

const EMAIL_SUBJECTS: Record<string, string> = {
  signup: "Confirme seu e-mail · Biólogus Ambiental",
  invite: "Você foi convidado · Biólogus Ambiental",
  magiclink: "Seu link de acesso · Biólogus Ambiental",
  recovery: "Redefina sua senha · Biólogus Ambiental",
  email_change: "Confirme seu novo e-mail · Biólogus Ambiental",
  reauthentication: "Seu código de verificação · Biólogus Ambiental",
};

export const ServerRoute = createServerFileRoute(
  "/lovable/email/auth/webhook"
).methods({
  POST: async ({ request }) => {
    try {
      const secret = process.env.SUPABASE_WEBHOOK_SECRET;
      if (secret) {
        const sig = request.headers.get("x-webhook-secret");
        if (sig !== secret) {
          return new Response("Unauthorized", { status: 401 });
        }
      }

      const body = await request.json() as Record<string, unknown>;
      const emailType = body.email_action_type as string;
      const userEmail = (body.user as Record<string, unknown>)?.email as string;
      const data = body as Record<string, string>;

      let html = "";
      switch (emailType) {
        case "signup":
          html = await render(React.createElement(SignupEmail, { confirmationURL: data.confirmation_url }));
          break;
        case "invite":
          html = await render(React.createElement(InviteEmail, { invitationURL: data.confirmation_url }));
          break;
        case "magiclink":
          html = await render(React.createElement(MagicLinkEmail, { magicLinkURL: data.confirmation_url }));
          break;
        case "recovery":
          html = await render(React.createElement(RecoveryEmail, { resetURL: data.confirmation_url }));
          break;
        case "email_change":
          html = await render(React.createElement(EmailChangeEmail, { confirmationURL: data.confirmation_url }));
          break;
        case "reauthentication":
          html = await render(React.createElement(ReauthenticationEmail, { otp: data.token as string }));
          break;
        default:
          return new Response("Unknown email type", { status: 400 });
      }

      const resendKey = process.env.RESEND_API_KEY;
      if (!resendKey) {
        console.warn("[email] RESEND_API_KEY não configurado — email não enviado");
        return Response.json({ ok: true, sent: false });
      }

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "noreply@biologus.com.br",
          to: [userEmail],
          subject: EMAIL_SUBJECTS[emailType] ?? "Notificação · Biólogus Ambiental",
          html,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("[email] Resend error:", err);
        return Response.json({ ok: false, error: err }, { status: 502 });
      }

      return Response.json({ ok: true, sent: true });
    } catch (e) {
      console.error("[email webhook]", e);
      return Response.json({ ok: false, error: String(e) }, { status: 500 });
    }
  },
});
