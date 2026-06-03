import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, FileText, ExternalLink, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface DocumentUploadProps {
  /** Pasta lógica dentro do bucket (ex: "licencas", "mtrs/abc-123") */
  folder: string;
  /** URL atual do documento (path no bucket), se houver */
  value?: string | null;
  /** Callback com o novo path no bucket (ou null ao remover) */
  onChange: (path: string | null) => void;
  accept?: string;
  label?: string;
}

const BUCKET = "documentos";

export function DocumentUpload({
  folder,
  value,
  onChange,
  accept = "application/pdf,image/*",
  label = "Documento",
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [opening, setOpening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sem sessão");
      if (file.size > 10 * 1024 * 1024) throw new Error("Arquivo maior que 10MB");

      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${user.id}/${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;

      // Remove anterior (best-effort)
      if (value) await supabase.storage.from(BUCKET).remove([value]).catch(() => {});

      onChange(path);
      toast.success("Documento enviado");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleOpen = async () => {
    if (!value) return;
    setOpening(true);
    try {
      const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(value, 3600);
      if (error) throw error;
      window.open(data.signedUrl, "_blank");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setOpening(false);
    }
  };

  const handleRemove = async () => {
    if (!value) return;
    if (!confirm("Remover documento?")) return;
    await supabase.storage.from(BUCKET).remove([value]).catch(() => {});
    onChange(null);
    toast.success("Documento removido");
  };

  return (
    <div className="space-y-1">
      {label && <p className="text-sm font-medium">{label}</p>}
      <div className="flex items-center gap-2 flex-wrap">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        />
        <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
          {value ? "Substituir" : "Enviar arquivo"}
        </Button>
        {value && (
          <>
            <Button type="button" size="sm" variant="ghost" onClick={handleOpen} disabled={opening}>
              {opening ? <Loader2 className="h-3 w-3 animate-spin" /> : <ExternalLink className="h-3 w-3" />}
              Abrir
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={handleRemove}>
              <X className="h-3 w-3" /> Remover
            </Button>
            <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {value.split("/").pop()?.slice(0, 30)}
            </span>
          </>
        )}
      </div>
      <p className="text-xs text-muted-foreground">PDF ou imagem, até 10MB. Acesso restrito ao seu usuário.</p>
    </div>
  );
}
