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
import { Loader2, Eye, Save, Printer } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { salvarPropostaPgrss } from "@/lib/pgrss.functions";

export const Route = createFileRoute("/_authenticated/pgrss-nova")({
  component: NovaPgrssSimples,
});

type Cliente = {
  id: string; razao_social: string; nome_fantasia: string | null;
  cnpj: string; endereco: string | null; numero: string | null;
  bairro: string | null; cidade: string | null; estado: string | null;
  cep: string | null; email: string | null; telefone: string | null;
  responsavel_tecnico: string | null; responsavel_financeiro: string | null;
};

const EMPRESA = {
  nome: "Bio Logus Soluções Ambientais",
  cnpj: "26.484.921/0001-60",
  endereco: "Rua dos Ferroviários Qd 01 Lt 05, Parque Industrial João Brás 2, Goiânia-GO, CEP 74.483-115",
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
    const milhar = Math.floor(n / 1000);
    const resto = n % 1000;
    const parteMilhar = milhar === 1 ? "mil" : converter(milhar) + " mil";
    return resto === 0 ? parteMilhar : parteMilhar + (resto < 100 ? " e " : ", ") + converter(resto);
  }

  const parteInt = converterMilhares(inteiro);
  const reaisStr = `${parteInt} ${inteiro === 1 ? "real" : "reais"}`;
  if (centavos === 0) return reaisStr;
  const centStr = `${converter(centavos)} ${centavos === 1 ? "centavo" : "centavos"}`;
  return `${reaisStr} e ${centStr}`;
}

function NovaPgrssSimples() {
  const navigate = useNavigate();
  const salvar = useServerFn(salvarPropostaPgrss);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState<string>("");
  const [valor, setValor] = useState<string>("");
  const [prazo, setPrazo] = useState<string>("30");
  const [validade, setValidade] = useState<string>("30");
  const [condicoes, setCondicoes] = useState<string>("50% no aceite da proposta e 50% na entrega do documento final");
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("clientes")
        .select("id,razao_social,nome_fantasia,cnpj,endereco,numero,bairro,cidade,estado,cep,email,telefone,responsavel_tecnico,responsavel_financeiro")
        .order("razao_social");
      setClientes((data ?? []) as Cliente[]);
    })();
  }, []);

  const cliente = clientes.find((c) => c.id === clienteId);
  const valorNum = Number(valor.replace(/\./g, "").replace(",", ".")) || 0;

  function numeroAuto() {
    const ano = new Date().getFullYear();
    const seq = String(Math.floor(Math.random() * 9000) + 1000);
    return `PGRSS-${ano}-${seq}`;
  }

  function gerarHtml(numero: string): string {
    if (!cliente) return "";
    const dataBR = new Date().toLocaleDateString("pt-BR");
    const enderecoCli = [
      cliente.endereco, cliente.numero, cliente.bairro,
      cliente.cidade && cliente.estado ? `${cliente.cidade}/${cliente.estado}` : cliente.cidade,
      cliente.cep,
    ].filter(Boolean).join(", ");
    return `
<div style="width:190mm;min-height:277mm;margin:0 auto;padding:10mm 12mm;color:#111;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.45;box-sizing:border-box">
  <div style="border-bottom:2px solid #0E3D1A;padding-bottom:6px;margin-bottom:10px">
    <div style="font-size:14px;font-weight:800;color:#0E3D1A">${EMPRESA.nome}</div>
    <div style="font-size:10px;color:#374151">CNPJ: ${EMPRESA.cnpj} · ${EMPRESA.endereco}</div>
  </div>
  <div style="text-align:center;margin-bottom:10px">
    <div style="font-size:15px;font-weight:800;color:#0E3D1A">PROPOSTA COMERCIAL Nº ${numero}</div>
    <div style="font-size:10px;color:#374151">Data: ${dataBR}</div>
  </div>

  <div style="margin-bottom:8px">
    <div><b>À</b> ${cliente.razao_social}${cliente.nome_fantasia ? " (" + cliente.nome_fantasia + ")" : ""}</div>
    <div><b>CNPJ:</b> ${cliente.cnpj} &nbsp; <b>End.:</b> ${enderecoCli || "—"}</div>
    <div><b>A/C:</b> ${cliente.responsavel_tecnico || cliente.responsavel_financeiro || "Responsável"} &nbsp; <b>Contato:</b> ${cliente.email || "—"} · ${cliente.telefone || "—"}</div>
    <div><b>Ref.:</b> Proposta Técnica para Elaboração de PGRSS (Plano de Gerenciamento de Resíduos de Serviços de Saúde)</div>
  </div>

  <div style="margin-bottom:4px"><b style="color:#0E3D1A">1. APRESENTAÇÃO</b></div>
  <p style="margin:0 0 8px 0;text-align:justify">A ${EMPRESA.nome} é especializada em consultoria ambiental e engenharia de saúde e segurança do trabalho. Apresentamos a seguir nossa proposta para a elaboração do PGRSS, atendendo à Resolução RDC ANVISA nº 222/2018 e demais legislações municipais e estaduais vigentes.</p>

  <div style="margin-bottom:4px"><b style="color:#0E3D1A">2. ESCOPO DOS SERVIÇOS</b></div>
  <ul style="margin:0 0 8px 16px;padding:0">
    <li><b>Diagnóstico e Classificação:</b> identificação e quantificação dos resíduos (Grupos A, B, C, D e E) conforme a RDC ANVISA nº 222/2018.</li>
    <li><b>Elaboração do Documento (PGRSS):</b> redação do plano detalhando segregação, acondicionamento, identificação, transporte interno, armazenamento e destinação final.</li>
    <li><b>Emissão de ART</b> (Anotação de Responsabilidade Técnica) pelo profissional responsável.</li>
  </ul>

  <div style="margin-bottom:4px"><b style="color:#0E3D1A">3. PRAZO DE EXECUÇÃO</b></div>
  <p style="margin:0 0 8px 0;text-align:justify">O prazo total para a entrega do documento final, impresso e em meio digital (PDF), será de <b>${prazo} dias úteis</b>, contados a partir da aprovação desta proposta e da disponibilização das informações necessárias pela contratante.</p>

  <div style="margin-bottom:4px"><b style="color:#0E3D1A">4. INVESTIMENTO</b></div>
  <p style="margin:0 0 8px 0">O valor total para a prestação dos serviços descritos acima é de <b>${fmtBRL(valorNum)}</b> (${valorPorExtenso(valorNum)}).<br/>
    <b>Condições de Pagamento:</b> ${condicoes}.<br/>
    <b>Formas aceitas:</b> Boleto bancário, PIX ou transferência bancária.
  </p>

  <div style="margin-bottom:4px"><b style="color:#0E3D1A">5. VALIDADE DA PROPOSTA</b></div>
  <p style="margin:0 0 8px 0">Esta proposta é válida por <b>${validade} dias</b> a partir da data de emissão.</p>

  <div style="margin-bottom:4px"><b style="color:#0E3D1A">6. RESPONSABILIDADES TÉCNICAS E LEGAIS</b></div>
  <p style="margin:0 0 8px 0;text-align:justify"><b>Da Contratada:</b> emissão de ART e enquadramento às normas da RDC ANVISA nº 222/2018 e CONAMA nº 358/2005.<br/>
    <b>Do Cliente:</b> fornecimento de plantas arquitetônicas (se houver), acesso às instalações e execução das melhorias estruturais propostas no plano.
  </p>

  <div style="margin-bottom:4px"><b style="color:#0E3D1A">7. DE ACORDO / ACEITE</b></div>
  <p style="margin:0 0 10px 0">Para aprovação, por favor, assine este documento e devolva-o por e-mail ou WhatsApp.</p>

  <div style="font-size:11px;line-height:1.9">
    <div><b>De acordo:</b></div>
    <div>Nome: ______________________________________________</div>
    <div>Cargo: ______________________________________________</div>
    <div>Data: ____ / ____ / ______</div>
    <div style="margin-top:14px;border-top:1px solid #111;width:60%;text-align:center;padding-top:4px">Assinatura</div>
  </div>

  <div style="margin-top:10px;font-size:8.5px;color:#6b7280;text-align:center;border-top:1px solid #e5e7eb;padding-top:4px">
    RDC ANVISA nº 222/2018 · CONAMA nº 358/2005 · Lei nº 12.305/2010 (PNRS)
  </div>
</div>`;
  }

  function imprimir() {
    if (!cliente) return toast.error("Selecione um cliente");
    if (valorNum <= 0) return toast.error("Informe o valor");
    const html = gerarHtml(numeroAuto());
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:210mm;height:297mm;border:none;";
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) { document.body.removeChild(iframe); return; }
    doc.open();
    doc.write(`<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;margin:0;padding:0;color:#111}@media print{@page{size:A4;margin:10mm}}</style></head><body>${html}</body></html>`);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 3000);
    }, 600);
  }

  async function onSalvar() {
    if (!cliente) return toast.error("Selecione um cliente");
    if (valorNum <= 0) return toast.error("Informe o valor");
    setSaving(true);
    try {
      const numero = numeroAuto();
      const html = gerarHtml(numero);
      const res = await salvar({
        data: {
          cliente_id: cliente.id,
          numero,
          validade: new Date(Date.now() + Number(validade) * 86400000).toISOString().slice(0, 10),
          questionario: {
            tipo_estabelecimento: "—",
            area_construida: 0, qtd_funcionarios: 0, qtd_leitos: 0, qtd_salas: 0,
            gera_grupo_a: false, gera_grupo_b: false, gera_grupo_c: false, gera_grupo_d: false, gera_grupo_e: false,
            possui_abrigo_temporario: false, possui_armazenamento_externo: false,
            possui_coleta_especializada: false, possui_mtr: false, possui_licenciamento: false,
            possui_treinamento: false, possui_pgrss_vigente: false,
            distancia_km: 0, qtd_visitas: 1, qtd_treinamentos: 0,
            incluir_art: true, incluir_atualizacao_anual: false, incluir_consultoria_mensal: false,
            meses_consultoria: 0, porte: "pequeno",
            observacoes: condicoes,
          },
          conteudo_html: html,
          itens: [{
            descricao: "Elaboração de PGRSS (Plano de Gerenciamento de Resíduos de Serviços de Saúde)",
            quantidade: 1, unidade: "serv",
            valor_unitario: valorNum, valor_total: valorNum,
          }],
          valor_total: valorNum,
        },
      });
      toast.success("✅ Proposta PGRSS salva com sucesso!");
      // Força navegação hard para garantir que o bundle novo seja carregado
      window.location.href = `/propostas/pgrss/${res.id}`;
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nova Proposta PGRSS</h1>
        <p className="text-sm text-muted-foreground">Modelo profissional em folha A4 única.</p>
      </div>

      {/* 1. Cliente */}
      <section className="border rounded-lg p-4 space-y-3">
        <h2 className="font-semibold text-lg">1. Cliente</h2>
        <Select value={clienteId} onValueChange={setClienteId}>
          <SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
          <SelectContent>
            {clientes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.razao_social}{c.nome_fantasia ? ` (${c.nome_fantasia})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {cliente && (
          <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm space-y-1">
            <div><b>{cliente.razao_social}</b>{cliente.nome_fantasia && ` — ${cliente.nome_fantasia}`}</div>
            <div>CNPJ: {cliente.cnpj}</div>
            <div>
              {[cliente.endereco, cliente.numero, cliente.bairro, cliente.cidade && cliente.estado ? `${cliente.cidade}/${cliente.estado}` : cliente.cidade, cliente.cep].filter(Boolean).join(", ")}
            </div>
            <div>{cliente.email || "—"} · {cliente.telefone || "—"}</div>
            {cliente.responsavel_tecnico && <div>Resp. técnico: {cliente.responsavel_tecnico}</div>}
          </div>
        )}
      </section>

      {/* 2. Valor */}
      <section className="border rounded-lg p-4 space-y-3">
        <h2 className="font-semibold text-lg">2. Valor do PGRSS</h2>
        <div>
          <Label>Valor (R$)</Label>
          <Input
            type="text"
            inputMode="decimal"
            placeholder="Ex.: 3500,00"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
          {valorNum > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {fmtBRL(valorNum)} — {valorPorExtenso(valorNum)}
            </p>
          )}
        </div>
      </section>

      {/* 3. Condições */}
      <section className="border rounded-lg p-4 space-y-3">
        <h2 className="font-semibold text-lg">3. Condições</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <Label>Condições de pagamento</Label>
            <Select value={condicoes} onValueChange={setCondicoes}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="50% no aceite da proposta e 50% na entrega do documento final">50% aceite + 50% entrega</SelectItem>
                <SelectItem value="100% no aceite da proposta">100% no aceite</SelectItem>
                <SelectItem value="100% na entrega do documento final">100% na entrega</SelectItem>
                <SelectItem value="3 parcelas iguais (entrada + 2 mensais)">3 parcelas iguais</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Prazo de execução (dias úteis)</Label>
            <Select value={prazo} onValueChange={setPrazo}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["5", "7", "15", "20", "30", "45", "60"].map((d) => (
                  <SelectItem key={d} value={d}>{d} dias úteis</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Validade da proposta (dias)</Label>
            <Select value={validade} onValueChange={setValidade}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["15", "30", "45", "60", "90"].map((d) => (
                  <SelectItem key={d} value={d}>{d} dias</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => setPreview((p) => !p)} disabled={!cliente || valorNum <= 0}>
          <Eye className="mr-2 h-4 w-4" />{preview ? "Ocultar pré-visualização" : "Pré-visualizar"}
        </Button>
        <Button variant="outline" onClick={imprimir} disabled={!cliente || valorNum <= 0}>
          <Printer className="mr-2 h-4 w-4" />Imprimir / PDF
        </Button>
        <Button onClick={onSalvar} disabled={saving || !cliente || valorNum <= 0}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Salvar proposta
        </Button>
      </div>

      {preview && cliente && valorNum > 0 && (
        <div className="border rounded-lg bg-white overflow-auto">
          <div dangerouslySetInnerHTML={{ __html: gerarHtml(numeroAuto()) }} />
        </div>
      )}
    </div>
  );
}
