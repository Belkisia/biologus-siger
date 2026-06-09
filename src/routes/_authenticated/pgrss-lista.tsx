import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Eye, Plus, FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/pgrss-lista")({
  component: PgrssLista,
});

type Proposta = {
  id: string;
  numero: string;
  valor_total: number;
  status: string;
  created_at: string;
  validade: string | null;
  clientes?: { razao_social: string; cnpj: string } | null;
};

function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function PgrssLista() {
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [deletando, setDeletando] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("propostas")
      .select("id, numero, valor_total, status, created_at, validade, clientes(razao_social, cnpj)")
      .like("numero", "PGRSS-%")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setPropostas((data as Proposta[]) || []);
        setLoading(false);
      });
  }, []);

  const handleDeletar = async (id: string, numero: string) => {
    if (!confirm(`Remover a proposta ${numero}? Esta ação não pode ser desfeita.`)) return;
    setDeletando(id);
    await supabase.from("propostas").delete().eq("id", id);
    setPropostas(prev => prev.filter(p => p.id !== id));
    setDeletando(null);
  };

  const statusBadge = (s: string) => {
    const map: Record<string, { bg: string; color: string; label: string }> = {
      rascunho:  { bg: "#f1f3f2", color: "#6B7671", label: "Rascunho" },
      enviada:   { bg: "#EFF6FF", color: "#1D4ED8", label: "Enviada" },
      aceita:    { bg: "#ECFDF5", color: "#059669", label: "Aceita" },
      recusada:  { bg: "#FFF0F0", color: "#DC3545", label: "Recusada" },
      cancelada: { bg: "#f1f3f2", color: "#6B7671", label: "Cancelada" },
    };
    const b = map[s] || map.rascunho;
    return (
      <span style={{ background: b.bg, color: b.color, padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 500 }}>
        {b.label}
      </span>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FileText size={20} color="#0D6B54" />
          <div>
            <h1 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>Propostas PGRSS</h1>
            <p style={{ fontSize: "12px", color: "#6B7671", margin: 0 }}>Planos de Gerenciamento de Resíduos de Serviços de Saúde</p>
          </div>
        </div>
        <button
          onClick={() => window.location.href = "/pgrss-nova"}
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "#0D6B54", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 600, fontFamily: "inherit" }}
        >
          <Plus size={14} /> Nova proposta PGRSS
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
        {[
          { label: "Total", val: String(propostas.length) },
          { label: "Aceitas", val: String(propostas.filter(p => p.status === "aceita").length) },
          { label: "Valor total aceito", val: fmtBRL(propostas.filter(p => p.status === "aceita").reduce((a, p) => a + p.valor_total, 0)) },
        ].map((k, i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid #E2E8E5", borderRadius: "10px", padding: "16px 20px" }}>
            <div style={{ fontSize: "11px", fontWeight: 500, color: "#6B7671", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "6px" }}>{k.label}</div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: i === 2 ? "#0D6B54" : "#1A1F1D" }}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div style={{ background: "#fff", border: "1px solid #E2E8E5", borderRadius: "10px", overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #E2E8E5", fontSize: "13px", fontWeight: 600 }}>
          Propostas salvas
        </div>

        {loading ? (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <Loader2 size={24} style={{ margin: "0 auto", display: "block", animation: "spin 1s linear infinite", color: "#6B7671" }} />
          </div>
        ) : propostas.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#6B7671", fontSize: "13px" }}>
            <FileText size={40} style={{ margin: "0 auto 12px", display: "block", opacity: .3 }} />
            Nenhuma proposta PGRSS salva ainda.
            <br />
            <button
              onClick={() => window.location.href = "/pgrss-nova"}
              style={{ marginTop: "12px", padding: "8px 16px", background: "#0D6B54", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: "inherit" }}
            >
              Criar primeira proposta
            </button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F7F8F6" }}>
                  {["Número", "Cliente", "Valor", "Validade", "Status", "Ações"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: 500, color: "#6B7671", textTransform: "uppercase", letterSpacing: ".06em", borderBottom: "1px solid #E2E8E5" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {propostas.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #E2E8E5" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 600, fontSize: "13px", color: "#0D6B54" }}>{p.numero}</td>
                    <td style={{ padding: "12px 16px", fontSize: "13px" }}>
                      <div>{p.clientes?.razao_social || "—"}</div>
                      {p.clientes?.cnpj && <div style={{ fontSize: "11px", color: "#6B7671" }}>{p.clientes.cnpj}</div>}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 500 }}>{fmtBRL(p.valor_total)}</td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#6B7671" }}>
                      {p.validade ? new Date(p.validade + "T00:00:00").toLocaleDateString("pt-BR") : "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>{statusBadge(p.status)}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => window.location.href = `/pgrss-ver/${p.id}`}
                          title="Visualizar proposta"
                          style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #0D6B54", background: "#EAF4ED", color: "#0D6B54", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", fontFamily: "inherit" }}
                        >
                          <Eye size={13} /> Ver
                        </button>
                        <button
                          onClick={() => handleDeletar(p.id, p.numero)}
                          disabled={deletando === p.id}
                          title="Excluir proposta"
                          style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #fca5a5", background: "#fff", color: "#DC3545", cursor: "pointer", display: "inline-flex", alignItems: "center", fontSize: "12px", fontFamily: "inherit", opacity: deletando === p.id ? 0.5 : 1 }}
                        >
                          {deletando === p.id ? "..." : "✕"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
