import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Eye, Save, FileText } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { salvarPropostaPgrss } from "@/lib/pgrss.functions";

export const Route = createFileRoute("/_authenticated/propostas/pgrss/nova")({
  component: NovaPgrssSimples,
});

type Cliente = {
  id: string; razao_social: string; nome_fantasia: string | null;
  cnpj: string; endereco: string | null; numero: string | null;
  bairro: string | null; cidade: string | null; estado: string | null;
  cep: string | null; email: string | null; telefone: string | null;
  responsavel_tecnico: string | null; responsavel_financeiro: string | null;
};

function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function valorPorExtenso(valor: number): string {
  const inteiro = Math.floor(valor);
  const centavos = Math.round((valor - inteiro) * 100);
  const unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove",
    "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
  const dezenas = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
  const centenas = ["", "cem", "duzentos", "trezentos", "quatrocentos", "quinhentos",
    "seiscentos", "setecentos", "oitocentos", "novecentos"];

  function converter(n: number): string {
    if (n === 0) return "";
    if (n === 100) return "cem";
    if (n < 20) return unidades[n];
    if (n < 100) return dezenas[Math.floor(n / 10)] + (n % 10 ? " e " + unidades[n % 10] : "");
    return centenas[Math.floor(n / 100)] + (n % 100 ? " e " + converter(n % 100) : "");
  }

  function converterMilhares(n: number): string {
    if (n === 0) return "zero";
    if (n < 1000) return converter(n);
    if (n < 2000) return "mil" + (n % 1000 ? " e " + converter(n % 1000) : "");
    return converter(Math.floor(n / 1000)) + " mil" + (n % 1000 ? " e " + converter(n % 1000) : "");
  }

  const parteInteira = converterMilhares(inteiro);
  const sufixoInteiro = inteiro === 1 ? "real" : "reais";
  if (centavos === 0) return parteInteira + " " + sufixoInteiro;
  const parteCentavos = converter(centavos);
  const sufixoCentavos = centavos === 1 ? "centavo" : "centavos";
  return parteInteira + " " + sufixoInteiro + " e " + parteCentavos + " " + sufixoCentavos;
}

function gerarNumero() {
  const ano = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 8999) + 1000);
  return `PGRSS-${ano}-${seq}`;
}

function gerarHtmlPgrss(args: {
  numero: string; data_emissao: string; validade_dias: number;
  cliente: Cliente; valor: number; condicoes: string; prazo_dias: number;
}): string {
  const { numero, data_emissao, validade_dias, cliente, valor, condicoes, prazo_dias } = args;
  const dataBR = new Date(data_emissao + "T00:00:00").toLocaleDateString("pt-BR");
  const contato = cliente.responsavel_tecnico || cliente.responsavel_financeiro || "Responsável";
  const endereco = [cliente.endereco, cliente.numero, cliente.bairro, cliente.cidade && `${cliente.cidade}/${cliente.estado || "GO"}`, cliente.cep && `CEP ${cliente.cep}`].filter(Boolean).join(", ");

  return `<div style="width:190mm;min-height:277mm;margin:0 auto;padding:10mm 12mm;color:#111;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.5;box-sizing:border-box">

  <!-- CABEÇALHO -->
  <div style="text-align:center;border-bottom:2.5px solid #0E3D1A;padding-bottom:8px;margin-bottom:12px">
    <div style="font-size:15px;font-weight:800;color:#0E3D1A;letter-spacing:.5px">BIO LOGUS AMBIENTAL LTDA – ME</div>
    <div style="font-size:9px;color:#374151;margin-top:2px">CNPJ: 26.484.921/0001-60 · Rua dos Ferroviários, Qd. 01, Lt. 05, Parque Industrial João Brás 2, Goiânia-GO, CEP 74.483-115</div>
    <div style="font-size:9px;color:#374151">comercial@biologusambiental.com.br · (62) 3558-2791</div>
    <div style="font-size:13px;font-weight:700;color:#0E3D1A;margin-top:8px">PROPOSTA COMERCIAL Nº ${numero}</div>
    <div style="font-size:9px;color:#374151">Data de emissão: ${dataBR}</div>
  </div>

  <!-- DESTINATÁRIO -->
  <div style="margin-bottom:10px;padding:8px 10px;background:#f0faf4;border-left:3px solid #0E3D1A;border-radius:0 6px 6px 0">
    <div><b>À</b> ${cliente.razao_social}${cliente.nome_fantasia ? ` (${cliente.nome_fantasia})` : ""}</div>
    <div><b>CNPJ:</b> ${cliente.cnpj}${endereco ? ` &nbsp;·&nbsp; <b>End.:</b> ${endereco}` : ""}</div>
    <div><b>A/C:</b> ${contato}${cliente.email ? ` &nbsp;·&nbsp; ${cliente.email}` : ""}${cliente.telefone ? ` &nbsp;·&nbsp; ${cliente.telefone}` : ""}</div>
    <div style="margin-top:4px"><b>Ref.:</b> Proposta Técnica para Elaboração de PGRSS — Plano de Gerenciamento de Resíduos de Serviços de Saúde</div>
  </div>

  <!-- 1. APRESENTAÇÃO -->
  <div style="margin-bottom:3px"><b style="color:#0E3D1A">1. APRESENTAÇÃO</b></div>
  <p style="margin:0 0 8px 0;text-align:justify">
    A Bio Logus Ambiental Ltda – ME é especializada em consultoria ambiental e engenharia de saúde e segurança do trabalho. Apresentamos a seguir nossa proposta para a elaboração do PGRSS, atendendo à Resolução RDC ANVISA nº 222/2018 e demais legislações municipais e estaduais vigentes.
  </p>

  <!-- 2. ESCOPO -->
  <div style="margin-bottom:3px"><b style="color:#0E3D1A">2. ESCOPO DOS SERVIÇOS</b></div>
  <ul style="margin:0 0 8px 16px;padding:0">
    <li style="margin-bottom:3px"><b>Diagnóstico e Classificação:</b> identificação e quantificação dos resíduos (Grupos A, B, C, D e E) conforme a norma da ANVISA.</li>
    <li><b>Elaboração do Documento (PGRSS):</b> redação do plano detalhando segregação, acondicionamento, identificação, transporte interno, armazenamento e destinação final.</li>
  </ul>

  <!-- 3. PRAZO -->
  <div style="margin-bottom:3px"><b style="color:#0E3D1A">3. PRAZO DE EXECUÇÃO</b></div>
  <p style="margin:0 0 8px 0;text-align:justify">
    O prazo total para a entrega do documento final, impresso e em meio digital (PDF), será de <b>${prazo_dias} dias úteis</b>, contados a partir da aprovação desta proposta e da disponibilização das informações necessárias pela contratante.
  </p>

  <!-- 4. INVESTIMENTO -->
  <div style="margin-bottom:3px"><b style="color:#0E3D1A">4. INVESTIMENTO</b></div>
  <p style="margin:0 0 8px 0">
    O valor total para a prestação dos serviços descritos acima é de <b>${fmtBRL(valor)}</b> (${valorPorExtenso(valor)}).<br/>
    <b>Condições de Pagamento:</b> ${condicoes}<br/>
    <b>Formas aceitas:</b> Boleto bancário, PIX ou transferência.
  </p>

  <!-- 5. VALIDADE -->
  <div style="margin-bottom:3px"><b style="color:#0E3D1A">5. VALIDADE DA PROPOSTA</b></div>
  <p style="margin:0 0 8px 0">Esta proposta é válida por <b>${validade_dias} dias</b> a partir da data de emissão.</p>

  <!-- 6. RESPONSABILIDADES -->
  <div style="margin-bottom:3px"><b style="color:#0E3D1A">6. RESPONSABILIDADES TÉCNICAS E LEGAIS</b></div>
  <p style="margin:0 0 8px 0;text-align:justify">
    <b>Da Contratada (Bio Logus):</b> emissão de ART (Anotação de Responsabilidade Técnica) e enquadramento às normas da RDC ANVISA nº 222/2018 e CONAMA nº 358/2005.<br/>
    <b>Do Cliente:</b> fornecimento de plantas arquitetônicas (se houver), acesso às instalações e execução das melhorias estruturais propostas no plano.
  </p>

  <!-- 7. ACEITE -->
  <div style="margin-bottom:3px"><b style="color:#0E3D1A">7. DE ACORDO / ACEITE</b></div>
  <p style="margin:0 0 10px 0">Para aprovação, por favor, assine este documento e devolva-o por e-mail ou WhatsApp.</p>

  <div style="font-size:11px;line-height:2">
    <div><b>De acordo:</b></div>
    <div>Nome: ______________________________________________</div>
    <div>Cargo: ______________________________________________</div>
    <div>Data: _____ / _____ / __________</div>
    <div style="margin-top:16px;width:55%;border-top:1px solid #111;text-align:center;padding-top:4px">Assinatura</div>
  </div>

  <!-- RODAPÉ -->
  <div style="margin-top:12px;font-size:8px;color:#9ca3af;text-align:center;border-top:1px solid #e5e7eb;padding-top:4px">
    RDC ANVISA nº 222/2018 · CONAMA nº 358/2005 · NBR 10.004/2004 · Lei nº 12.305/2010 (PNRS)
  </div>
</div>`;
}

function NovaPgrssSimples() {
  const navigate = useNavigate();
  const salvar = useServerFn(salvarPropostaPgrss);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [valor, setValor] = useState("");
  const [numero] = useState(gerarNumero());
  const [prazo, setPrazo] = useState("30");
  const [validade, setValidade] = useState("30");
  const [condicoes, setCondicoes] = useState("50% no aceite da proposta e 50% na entrega do documento final");
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    supabase.from("clientes").select(
      "id,razao_social,nome_fantasia,cnpj,endereco,numero,bairro,cidade,estado,cep,email,telefone,responsavel_tecnico,responsavel_financeiro"
    ).order("razao_social").then(({ data }) => setClientes((data as Cliente[]) || []));
  }, []);

  const cliente = clientes.find((c) => c.id === clienteId) ?? null;
  const valorNum = parseFloat(valor.replace(",", ".")) || 0;

  const htmlGerado = cliente && valorNum > 0 ? gerarHtmlPgrss({
    numero,
    data_emissao: new Date().toISOString().slice(0, 10),
    validade_dias: parseInt(validade) || 30,
    cliente,
    valor: valorNum,
    condicoes,
    prazo_dias: parseInt(prazo) || 30,
  }) : null;

  const handleSalvar = async () => {
    if (!cliente) return toast.error("Selecione o cliente");
    if (!valorNum || valorNum <= 0) return toast.error("Informe o valor do PGRSS");
    if (!htmlGerado) return;
    setSaving(true);
    try {
      const result = await salvar({
        data: {
          cliente_id: clienteId,
          numero,
          validade: (() => { const d = new Date(); d.setDate(d.getDate() + (parseInt(validade) || 30)); return d.toISOString().slice(0, 10); })(),
          questionario: {
            tipo_estabelecimento: "Consultório",
            area_construida: 0, qtd_funcionarios: 0, qtd_leitos: 0, qtd_salas: 0,
            gera_grupo_a: true, gera_grupo_b: false, gera_grupo_c: false,
            gera_grupo_d: true, gera_grupo_e: true,
            possui_abrigo_temporario: false, possui_armazenamento_externo: false,
            possui_coleta_especializada: false, possui_mtr: false,
            possui_licenciamento: false, possui_treinamento: false, possui_pgrss_vigente: false,
            distancia_km: 0, qtd_visitas: 1, qtd_treinamentos: 1,
            incluir_art: true, incluir_atualizacao_anual: false, incluir_consultoria_mensal: false,
            meses_consultoria: 0, porte: "pequeno", observacoes: "",
          },
          conteudo_html: htmlGerado,
          itens: [{ descricao: "Elaboração do PGRSS", quantidade: 1, unidade: "un", valor_unitario: valorNum, valor_total: valorNum }],
          valor_total: valorNum,
        },
      });
      toast.success("Proposta PGRSS salva!");
      navigate({ to: "/propostas/pgrss/$id", params: { id: result.id } });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleImprimir = () => {
    if (!htmlGerado) return;
    const style = document.createElement("style");
    style.id = "__pgrss_print__";
    style.textContent = `@media print { body > *:not(#__pgrss_wrap__) { display:none!important; } #__pgrss_wrap__ { display:block!important; position:fixed; inset:0; background:#fff; z-index:99999; } }`;
    document.head.appendChild(style);
    const wrap = document.createElement("div");
    wrap.id = "__pgrss_wrap__";
    wrap.innerHTML = htmlGerado;
    document.body.appendChild(wrap);
    window.print();
    document.body.removeChild(wrap);
    document.head.removeChild(style);
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 16px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <FileText size={22} color="#0D6B54" />
        <div>
          <h1 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>Nova Proposta PGRSS</h1>
          <p style={{ fontSize: "12px", color: "#6B7671", margin: 0 }}>Plano de Gerenciamento de Resíduos de Serviços de Saúde · {numero}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: preview && htmlGerado ? "1fr 1fr" : "1fr", gap: "24px" }}>
        {/* Formulário */}
        <div style={{ background: "#fff", border: "1px solid #E2E8E5", borderRadius: "12px", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Cliente */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#0D6B54", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700 }}>1</div>
              <span style={{ fontWeight: 600, fontSize: "13px" }}>Cliente *</span>
            </div>
            <Select value={clienteId} onValueChange={setClienteId}>
              <SelectTrigger><SelectValue placeholder="Selecionar cliente cadastrado…" /></SelectTrigger>
              <SelectContent>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.razao_social}{c.cnpj ? ` — ${c.cnpj}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {cliente && (
              <div style={{ marginTop: "10px", background: "#EAF4ED", borderLeft: "3px solid #0D6B54", borderRadius: "0 8px 8px 0", padding: "10px 14px", fontSize: "12px", color: "#084D3C" }}>
                <strong>{cliente.razao_social}</strong>
                {cliente.cnpj && <> · CNPJ: {cliente.cnpj}</>}
                {cliente.cidade && <> · {cliente.cidade}/{cliente.estado || "GO"}</>}
                {(cliente.responsavel_tecnico || cliente.responsavel_financeiro) && (
                  <> · A/C: {cliente.responsavel_tecnico || cliente.responsavel_financeiro}</>
                )}
              </div>
            )}
          </div>

          {/* Valor */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#0D6B54", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700 }}>2</div>
              <span style={{ fontWeight: 600, fontSize: "13px" }}>Valor do PGRSS *</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontWeight: 700, color: "#6B7671" }}>R$</span>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex.: 450,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                style={{ fontFamily: "monospace", fontSize: "15px", fontWeight: 600 }}
              />
            </div>
            {valorNum > 0 && (
              <p style={{ fontSize: "11px", color: "#0D6B54", marginTop: "4px" }}>
                {valorPorExtenso(valorNum)}
              </p>
            )}
          </div>

          {/* Condições */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#0D6B54", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700 }}>3</div>
              <span style={{ fontWeight: 600, fontSize: "13px" }}>Condições e prazos</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <Label style={{ fontSize: "11px" }}>Condições de pagamento</Label>
                <Select value={condicoes} onValueChange={setCondicoes}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50% no aceite da proposta e 50% na entrega do documento final">50% aceite + 50% entrega</SelectItem>
                    <SelectItem value="100% no aceite da proposta">100% no aceite</SelectItem>
                    <SelectItem value="100% na entrega do documento final">100% na entrega</SelectItem>
                    <SelectItem value="30 dias após a emissão da nota fiscal">30 dias após NF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label style={{ fontSize: "11px" }}>Prazo de execução (dias úteis)</Label>
                <Select value={prazo} onValueChange={setPrazo}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 dias úteis</SelectItem>
                    <SelectItem value="20">20 dias úteis</SelectItem>
                    <SelectItem value="30">30 dias úteis</SelectItem>
                    <SelectItem value="45">45 dias úteis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label style={{ fontSize: "11px" }}>Validade da proposta (dias)</Label>
                <Select value={validade} onValueChange={setValidade}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="60">60 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div style={{ display: "flex", gap: "10px", paddingTop: "8px", borderTop: "1px solid #E2E8E5" }}>
            <button
              type="button"
              onClick={() => setPreview(!preview)}
              disabled={!htmlGerado}
              style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #0D6B54", background: preview ? "#EAF4ED" : "#fff", color: "#0D6B54", cursor: htmlGerado ? "pointer" : "default", fontSize: "13px", fontWeight: 500, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", opacity: htmlGerado ? 1 : 0.4 }}
            >
              <Eye size={15} /> {preview ? "Ocultar prévia" : "Pré-visualizar"}
            </button>
            <button
              type="button"
              onClick={handleImprimir}
              disabled={!htmlGerado}
              style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #E2E8E5", background: "#fff", cursor: htmlGerado ? "pointer" : "default", fontSize: "13px", fontWeight: 500, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", opacity: htmlGerado ? 1 : 0.4 }}
            >
              Imprimir / PDF
            </button>
            <button
              type="button"
              onClick={handleSalvar}
              disabled={saving || !htmlGerado}
              style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: "#0D6B54", color: "#fff", cursor: htmlGerado ? "pointer" : "default", fontSize: "13px", fontWeight: 600, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", opacity: htmlGerado ? 1 : 0.4 }}
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Salvar proposta
            </button>
          </div>
        </div>

        {/* Prévia A4 */}
        {preview && htmlGerado && (
          <div style={{ border: "1px solid #E2E8E5", borderRadius: "12px", overflow: "hidden", background: "#F7F8F6" }}>
            <div style={{ padding: "10px 16px", borderBottom: "1px solid #E2E8E5", fontSize: "12px", fontWeight: 600, color: "#6B7671", background: "#fff" }}>
              Prévia — folha A4
            </div>
            <div style={{ overflowY: "auto", maxHeight: "80vh", padding: "16px" }}>
              <div style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,.1)", borderRadius: "4px" }}
                dangerouslySetInnerHTML={{ __html: htmlGerado }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
