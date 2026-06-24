import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  system: z.string().min(1).max(20000),
  user: z.string().min(1).max(20000),
});

export const gerarPropostaIA = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) {
      throw new Error("LOVABLE_API_KEY ausente no servidor.");
    }

    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);

    try {
      const { text } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        system: data.system,
        prompt: data.user,
      });
      return { text };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("429")) {
        throw new Error("Limite de uso da IA atingido. Tente novamente em instantes.");
      }
      if (message.includes("402")) {
        throw new Error(
          "Créditos de IA esgotados. Adicione créditos em Workspace → Usage.",
        );
      }
      throw new Error(`Falha ao gerar proposta: ${message}`);
    }
  });
