import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Recycle, Truck, BarChart3, Shield, Leaf, ArrowRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SIGER PRO — Gestão Inteligente de Resíduos" },
      { name: "description", content: "Plataforma SaaS para empresas de coleta, transporte, tratamento e destinação final de resíduos. Controle clientes, coletas, MTR, certificados, licenças e financeiro em um único lugar." },
      { property: "og:title", content: "SIGER PRO — Gestão Inteligente de Resíduos" },
      { property: "og:description", content: "ERP completo para gestão ambiental e resíduos industriais, hospitalares e comerciais." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Truck, title: "Coletas em tempo real", desc: "Agenda inteligente, rastreamento GPS e comprovante digital." },
  { icon: Shield, title: "Compliance ambiental", desc: "MTR, CDF, licenças e alertas automáticos de vencimento." },
  { icon: BarChart3, title: "Dashboard executivo", desc: "KPIs operacionais e financeiros em uma única tela." },
  { icon: Leaf, title: "Rastreabilidade total", desc: "Do gerador à destinação final, com auditoria completa." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-md flex items-center justify-center text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
              <Recycle className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg">SIGER PRO</span>
          </div>
          <Link to="/auth">
            <Button>Entrar <ArrowRight className="h-4 w-4 ml-2" /></Button>
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden" style={{ background: "var(--gradient-subtle)" }}>
        <div className="container mx-auto px-4 py-20 md:py-28 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-6">
            <Leaf className="h-3 w-3" /> Plataforma de gestão ambiental
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
            Gestão inteligente de resíduos
            <span className="block mt-2" style={{ background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              do gerador à destinação final
            </span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            ERP completo para empresas de coleta, transporte e tratamento de resíduos industriais, hospitalares e comerciais.
            Conformidade ambiental, rastreabilidade legal e operação centralizada.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link to="/auth">
              <Button size="lg" className="text-base">
                Começar agora <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {["Coletas em tempo real", "MTR & CDF", "Multi-usuário com RBAC", "Auditoria completa"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary-glow" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow">
              <div className="h-11 w-11 rounded-lg flex items-center justify-center mb-4 text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t bg-card">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} SIGER PRO — Sistema Inteligente de Gerenciamento de Resíduos
        </div>
      </footer>
    </div>
  );
}

