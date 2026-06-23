import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ClipboardCheck, Scale, PenLine, CheckCircle2, Loader2,
  Send, DollarSign, FileCheck, Plus, Eye, Eraser, RefreshCw
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/boletim")({
  component: BoletimPage,
});

type Boletim = {
  id: string;
  mtr_id: string;
  cliente_id: string;
  data_coleta: string;
  peso_coletado: number;
  unidade: string;
  nome_responsavel: string | null;
  assinatura_cliente: string | null;
  observacoes: string | null;
  status: string;
  cdf_id: string | null;
  pagamento_confirmado: boolean;
  cdf_enviado: boolean;
  data_envio_cdf: string | null;
  mtrs?: { numero: string; descricao_residuo: string } | null;
  clientes?: { razao_social: string; fantasia: string | null; email?: string | null } | null;
};

type MTR = { id: string; numero: string; descricao_residuo: string; cliente_id: string; quantidade: number; unidade: string; clientes?: { razao_social: string; fantasia: string | null } | null };

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  coletado:    { label: "Coletado",        color: "bg-blue-100 text-blue-800" },
  pago:        { label: "Pago",            color: "bg-green-100 text-green-800" },
  cdf_emitido: { label: "CDF Emitido",     color: "bg-teal-100 text-teal-800" },
  cdf_enviado: { label: "CDF Enviado ✓",   color: "bg-emerald-100 text-emerald-800" },
};

// Canvas de assinatura
function AssinaturaCanvas({ onChange }: { onChange: (data: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current; if (!canvas) return;
    drawing.current = true;
    lastPos.current = getPos(e, canvas);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!drawing.current) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#0D9488";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    drawing.current = false;
    const canvas = canvasRef.current; if (!canvas) return;
    onChange(canvas.toDataURL("image/png"));
  };

  const limpar = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Assinatura do responsável</Label>
        <Button type="button" variant="ghost" size="sm" onClick={limpar} className="h-7 text-xs gap-1">
          <Eraser className="h-3 w-3" /> Limpar
        </Button>
      </div>
      <div className="border-2 border-dashed border-border rounded-lg overflow-hidden bg-muted/20 touch-none">
        <canvas
          ref={canvasRef}
          width={600}
          height={160}
          className="w-full h-32 cursor-crosshair"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
      </div>
      <p className="text-xs text-muted-foreground">Assine acima com o dedo ou mouse</p>
    </div>
  );
}

function BoletimPage() {
  const qc = useQueryClient();
  const { user } = Route.useRouteContext();

  const [openNovo, setOpenNovo] = useState(false);
  const [openVer, setOpenVer] = useState<Boletim | null>(null);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [dataFiltro, setDataFiltro] = useState(() => new Date().toISOString().slice(0, 10));

  // Form fields
  const [mtrSelecionado, setMtrSelecionado] = useState<MTR | null>(null);
  const [peso, setPeso] = useState("");
  const [nomeResp, setNomeResp] = useState("");
  const [obs, setObs] = useState("");
  const [assinatura, setAssinatura] = useState("");

  const { data: mtrsAbertos = [] } = useQuery({
    queryKey: ["mtrs-abertos"],
    queryFn: async () => {
      const { data } = await supabase
        .from("mtrs")
        .select("id, numero, descricao_residuo, cliente_id, quantidade, unidade, clientes(razao_social, fantasia)")
        .in("status", ["emitido", "em_transporte"])
        .order("data_emissao", { ascending: false });
      return (data ?? []) as MTR[];
    },
  });

  const { data: boletins = [], isLoading } = useQuery({
    queryKey: ["boletins", dataFiltro],
    queryFn: async () => {
      const { data } = await supabase
        .from("boletins_medicao")
        .select("*, mtrs(numero, descricao_residuo), clientes(razao_social, fantasia)")
        .eq("data_coleta", dataFiltro)
        .order("created_at", { ascending: false });
      return (data ?? []) as Boletim[];
    },
  });

  const boletinsFiltrados = filtroStatus === "todos" ? boletins : boletins.filter((b) => b.status === filtroStatus);

  // Criar boletim → baixa MTR → gera CDF automaticamente
  const criarBoletim = useMutation({
    mutationFn: async () => {
      if (!mtrSelecionado || !peso) throw new Error("Preencha o peso");

      // 1. Criar CDF automaticamente
      const numeroCdf = `CDF-${dataFiltro.replace(/-/g, "")}-${mtrSelecionado.numero.replace(/[^0-9]/g, "").slice(-4)}`;
      const { data: cdfData, error: cdfError } = await supabase
        .from("cdfs")
        .insert([{
          mtr_id: mtrSelecionado.id,
          numero: numeroCdf,
          data_destinacao: dataFiltro,
          quantidade_destinada: Number(peso),
          tecnologia: "Incineração",
          destinador: "ECO INCINERAR GESTAO AMBIENTAL LTDA",
          owner_id: user.id,
        }] as never[])
        .select("id")
        .single();
      if (cdfError) throw cdfError;

      // 2. Criar boletim
      const { error: bolError } = await supabase.from("boletins_medicao").insert([{
        owner_id: user.id,
        mtr_id: mtrSelecionado.id,
        cliente_id: mtrSelecionado.cliente_id,
        data_coleta: dataFiltro,
        peso_coletado: Number(peso),
        unidade: mtrSelecionado.unidade || "kg",
        nome_responsavel: nomeResp || null,
        assinatura_cliente: assinatura || null,
        observacoes: obs || null,
        status: "cdf_emitido",
        cdf_id: cdfData.id,
        pagamento_confirmado: false,
        cdf_enviado: false,
      }] as never[]);
      if (bolError) throw bolError;

      // 3. Baixar MTR
      await supabase.from("mtrs").update({ status: "destinado", quantidade: Number(peso) }).eq("id", mtrSelecionado.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boletins"] });
      qc.invalidateQueries({ queryKey: ["mtrs"] });
      qc.invalidateQueries({ queryKey: ["cdfs"] });
      toast.success("Coleta registrada — CDF gerado automaticamente!");
      setOpenNovo(false);
      setMtrSelecionado(null);
      setPeso(""); setNomeResp(""); setObs(""); setAssinatura("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Confirmar pagamento → libera envio CDF
  const confirmarPagamento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("boletins_medicao").update({
        pagamento_confirmado: true,
        status: "pago",
        data_pagamento: new Date().toISOString(),
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boletins"] });
      toast.success("Pagamento confirmado — CDF liberado para envio");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Enviar CDF por WhatsApp/email
  const enviarCdf = useMutation({
    mutationFn: async (boletim: Boletim) => {
      if (!boletim.pagamento_confirmado) throw new Error("Aguardando confirmação de pagamento");
      const { error } = await supabase.from("boletins_medicao").update({
        cdf_enviado: true,
        status: "cdf_enviado",
        data_envio_cdf: new Date().toISOString(),
      }).eq("id", boletim.id);
      if (error) throw error;
      // Abrir WhatsApp com mensagem
      const cliente = boletim.clientes?.fantasia || boletim.clientes?.razao_social || "";
      const msg = encodeURIComponent(
        `Olá! Segue o Certificado de Destinação Final (CDF ${boletim.cdf_id?.slice(0, 8)?.toUpperCase()}) referente à coleta de resíduos realizada em ${new Date(boletim.data_coleta + "T12:00:00").toLocaleDateString("pt-BR")}.\n\nPeso coletado: ${boletim.peso_coletado} ${boletim.unidade}\nGerador: ${cliente}\n\nQualquer dúvida, estamos à disposição.\n\nBiologus Ambiental`
      );
      window.open(`https://wa.me/?text=${msg}`, "_blank");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boletins"] });
      toast.success("CDF marcado como enviado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const kpis = {
    total: boletins.length,
    coletados: boletins.filter((b) => b.status === "cdf_emitido").length,
    aguardandoPagamento: boletins.filter((b) => !b.pagamento_confirmado && b.status !== "cdf_enviado").length,
    enviados: boletins.filter((b) => b.cdf_enviado).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            Boletim de Medição
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registre o peso coletado e a assinatura do cliente. O CDF é gerado automaticamente e liberado após o pagamento.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input type="date" value={dataFiltro} onChange={(e) => setDataFiltro(e.target.value)} className="w-40" />
          <Button onClick={() => setOpenNovo(true)} disabled={mtrsAbertos.length === 0}>
            <Plus className="h-4 w-4 mr-1" /> Nova coleta
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total do dia", val: kpis.total, icon: ClipboardCheck, color: "text-primary" },
          { label: "CDF gerado", val: kpis.coletados, icon: FileCheck, color: "text-teal-600" },
          { label: "Aguard. pagamento", val: kpis.aguardandoPagamento, icon: DollarSign, color: "text-amber-600" },
          { label: "CDF enviado", val: kpis.enviados, icon: Send, color: "text-emerald-600" },
        ].map((k) => (
          <Card key={k.label} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{k.val}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{k.label}</p>
              </div>
              <k.icon className={`h-6 w-6 ${k.color}`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Fluxo visual */}
      <Card className="p-4 bg-muted/30">
        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
          <span className="flex items-center gap-1 font-medium text-foreground"><Scale className="h-3.5 w-3.5 text-blue-500" /> Peso + Assinatura</span>
          <span>→</span>
          <span className="flex items-center gap-1 font-medium text-foreground"><FileCheck className="h-3.5 w-3.5 text-teal-500" /> CDF gerado auto</span>
          <span>→</span>
          <span className="flex items-center gap-1 font-medium text-foreground"><DollarSign className="h-3.5 w-3.5 text-amber-500" /> Confirmar pagamento</span>
          <span>→</span>
          <span className="flex items-center gap-1 font-medium text-foreground"><Send className="h-3.5 w-3.5 text-emerald-500" /> Enviar CDF ao cliente</span>
        </div>
      </Card>

      {/* Filtro status */}
      <div className="flex gap-2 flex-wrap">
        {["todos", "cdf_emitido", "pago", "cdf_enviado"].map((s) => (
          <button
            key={s}
            onClick={() => setFiltroStatus(s)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filtroStatus === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"
            }`}
          >
            {s === "todos" ? `Todos (${boletins.length})` : STATUS_CONFIG[s]?.label}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <Card>
        {isLoading ? (
          <div className="py-16 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" /></div>
        ) : boletinsFiltrados.length === 0 ? (
          <div className="py-16 text-center">
            <Scale className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum boletim para esta data.</p>
            <p className="text-xs text-muted-foreground mt-1">Clique em "Nova coleta" para registrar.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>MTR</TableHead>
                <TableHead>Peso</TableHead>
                <TableHead>Assinatura</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {boletinsFiltrados.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium text-sm">
                    {b.clientes?.fantasia || b.clientes?.razao_social || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{b.mtrs?.numero ?? "—"}</TableCell>
                  <TableCell className="text-sm font-semibold">{b.peso_coletado} {b.unidade}</TableCell>
                  <TableCell>
                    {b.assinatura_cliente
                      ? <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle2 className="h-3.5 w-3.5" /> Assinado</span>
                      : <span className="text-xs text-muted-foreground">Sem assinatura</span>
                    }
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_CONFIG[b.status]?.color ?? "bg-gray-100 text-gray-700"}`}>
                      {STATUS_CONFIG[b.status]?.label ?? b.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpenVer(b)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!b.pagamento_confirmado && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1 text-amber-700 border-amber-300 hover:bg-amber-50"
                          onClick={() => confirmarPagamento.mutate(b.id)}
                          disabled={confirmarPagamento.isPending}
                        >
                          <DollarSign className="h-3.5 w-3.5" /> Confirmar pgto
                        </Button>
                      )}
                      {b.pagamento_confirmado && !b.cdf_enviado && (
                        <Button
                          size="sm"
                          className="h-8 text-xs gap-1"
                          onClick={() => enviarCdf.mutate(b)}
                          disabled={enviarCdf.isPending}
                        >
                          <Send className="h-3.5 w-3.5" /> Enviar CDF
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Dialog: Nova Coleta */}
      <Dialog open={openNovo} onOpenChange={setOpenNovo}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              Registrar Coleta
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">

            {/* MTR */}
            <div className="space-y-1.5">
              <Label>MTR *</Label>
              <Select onValueChange={(v) => setMtrSelecionado(mtrsAbertos.find((m) => m.id === v) ?? null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o MTR" />
                </SelectTrigger>
                <SelectContent>
                  {mtrsAbertos.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.numero} — {m.clientes?.fantasia || m.clientes?.razao_social}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {mtrSelecionado && (
                <div className="bg-muted/50 rounded-md p-3 text-xs space-y-1">
                  <p><span className="text-muted-foreground">Resíduo:</span> {mtrSelecionado.descricao_residuo}</p>
                  <p><span className="text-muted-foreground">Cliente:</span> {mtrSelecionado.clientes?.fantasia || mtrSelecionado.clientes?.razao_social}</p>
                </div>
              )}
            </div>

            {/* Peso */}
            <div className="space-y-1.5">
              <Label>Peso coletado (kg) *</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="0.000"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  className="text-lg font-semibold"
                />
                <span className="text-sm text-muted-foreground">kg</span>
              </div>
            </div>

            {/* Responsável */}
            <div className="space-y-1.5">
              <Label>Nome do responsável (opcional)</Label>
              <Input
                placeholder="Quem assinou no cliente"
                value={nomeResp}
                onChange={(e) => setNomeResp(e.target.value)}
              />
            </div>

            {/* Assinatura */}
            <AssinaturaCanvas onChange={setAssinatura} />

            {/* Observações */}
            <div className="space-y-1.5">
              <Label>Observações (opcional)</Label>
              <Input
                placeholder="Ex: embalagem danificada, acesso restrito..."
                value={obs}
                onChange={(e) => setObs(e.target.value)}
              />
            </div>

            {/* Aviso CDF automático */}
            <div className="bg-teal-50 border border-teal-200 rounded-md p-3 text-xs text-teal-800 flex items-start gap-2">
              <FileCheck className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">CDF gerado automaticamente</p>
                <p className="mt-0.5 opacity-80">O certificado fica retido até a confirmação do pagamento. Após pagar, clique em "Enviar CDF" para liberar ao cliente.</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenNovo(false)}>Cancelar</Button>
            <Button
              onClick={() => criarBoletim.mutate()}
              disabled={criarBoletim.isPending || !mtrSelecionado || !peso}
            >
              {criarBoletim.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Scale className="h-4 w-4 mr-2" />
              Registrar coleta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Ver boletim */}
      {openVer && (
        <Dialog open={!!openVer} onOpenChange={() => setOpenVer(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Boletim de Medição</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Cliente</p><p className="font-medium">{openVer.clientes?.fantasia || openVer.clientes?.razao_social}</p></div>
                <div><p className="text-xs text-muted-foreground">MTR</p><p className="font-medium">{openVer.mtrs?.numero}</p></div>
                <div><p className="text-xs text-muted-foreground">Data</p><p className="font-medium">{new Date(openVer.data_coleta + "T12:00:00").toLocaleDateString("pt-BR")}</p></div>
                <div><p className="text-xs text-muted-foreground">Peso</p><p className="font-bold text-primary">{openVer.peso_coletado} {openVer.unidade}</p></div>
                <div><p className="text-xs text-muted-foreground">Responsável</p><p className="font-medium">{openVer.nome_responsavel || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_CONFIG[openVer.status]?.color}`}>
                    {STATUS_CONFIG[openVer.status]?.label}
                  </span>
                </div>
              </div>
              {openVer.assinatura_cliente && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Assinatura do cliente</p>
                  <div className="border rounded-md p-2 bg-white">
                    <img src={openVer.assinatura_cliente} alt="Assinatura" className="max-h-24 w-full object-contain" />
                  </div>
                </div>
              )}
              {openVer.observacoes && (
                <div><p className="text-xs text-muted-foreground">Observações</p><p className="text-sm">{openVer.observacoes}</p></div>
              )}
              <div className="border-t pt-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status do pagamento</p>
                {openVer.pagamento_confirmado
                  ? <p className="text-sm text-green-600 flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Pagamento confirmado</p>
                  : <p className="text-sm text-amber-600 flex items-center gap-1"><DollarSign className="h-4 w-4" /> Aguardando pagamento</p>
                }
                {openVer.cdf_enviado
                  ? <p className="text-sm text-emerald-600 flex items-center gap-1"><Send className="h-4 w-4" /> CDF enviado em {openVer.data_envio_cdf ? new Date(openVer.data_envio_cdf).toLocaleDateString("pt-BR") : "—"}</p>
                  : <p className="text-sm text-muted-foreground flex items-center gap-1"><RefreshCw className="h-4 w-4" /> CDF ainda não enviado</p>
                }
              </div>
            </div>
            <DialogFooter>
              {!openVer.pagamento_confirmado && (
                <Button variant="outline" className="text-amber-700 border-amber-300" onClick={() => { confirmarPagamento.mutate(openVer.id); setOpenVer(null); }}>
                  <DollarSign className="h-4 w-4 mr-1" /> Confirmar pagamento
                </Button>
              )}
              {openVer.pagamento_confirmado && !openVer.cdf_enviado && (
                <Button onClick={() => { enviarCdf.mutate(openVer); setOpenVer(null); }}>
                  <Send className="h-4 w-4 mr-1" /> Enviar CDF
                </Button>
              )}
              <Button variant="ghost" onClick={() => setOpenVer(null)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
