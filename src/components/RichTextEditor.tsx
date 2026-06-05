import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button";
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Undo, Redo, Code } from "lucide-react";
import { useEffect } from "react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
};

export function RichTextEditor({ value, onChange, minHeight = 320 }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "<p></p>",
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none p-4",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "<p></p>", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  const insertVar = (name: string) => {
    editor.chain().focus().insertContent(`{{${name}}}`).run();
  };

  const VARS = [
    "CONTRATO_NUMERO", "DATA_CONTRATO",
    "CLIENTE_RAZAO_SOCIAL", "CLIENTE_NOME_FANTASIA", "CLIENTE_CNPJ", "CLIENTE_CPF",
    "CLIENTE_ENDERECO", "CLIENTE_CIDADE", "CLIENTE_ESTADO", "CLIENTE_CEP",
    "CLIENTE_EMAIL", "CLIENTE_TELEFONE",
    "REPRESENTANTE_NOME", "REPRESENTANTE_CPF",
    "VALOR_MENSAL", "LIMITE_KG", "VALOR_EXCEDENTE", "FREQUENCIA_COLETA",
    "FORMA_PAGAMENTO", "DIA_VENCIMENTO", "VIGENCIA_ANOS",
    "VIGENCIA", "DATA_INICIO", "DATA_FIM",
    "EMPRESA_RAZAO_SOCIAL", "EMPRESA_CNPJ", "EMPRESA_ENDERECO", "EMPRESA_EMAIL", "EMPRESA_TELEFONE",
  ];

  return (
    <div className="border rounded-md flex flex-col">
      <div className="flex flex-wrap items-center gap-1 border-b p-2 bg-muted/40">
        <Button type="button" size="sm" variant={editor.isActive("bold") ? "secondary" : "ghost"} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-4 w-4" /></Button>
        <Button type="button" size="sm" variant={editor.isActive("italic") ? "secondary" : "ghost"} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-4 w-4" /></Button>
        <Button type="button" size="sm" variant={editor.isActive("heading", { level: 1 }) ? "secondary" : "ghost"} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 className="h-4 w-4" /></Button>
        <Button type="button" size="sm" variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></Button>
        <Button type="button" size="sm" variant={editor.isActive("bulletList") ? "secondary" : "ghost"} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="h-4 w-4" /></Button>
        <Button type="button" size="sm" variant={editor.isActive("orderedList") ? "secondary" : "ghost"} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></Button>
        <Button type="button" size="sm" variant={editor.isActive("codeBlock") ? "secondary" : "ghost"} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code className="h-4 w-4" /></Button>
        <span className="mx-1 h-5 w-px bg-border" />
        <Button type="button" size="sm" variant="ghost" onClick={() => editor.chain().focus().undo().run()}><Undo className="h-4 w-4" /></Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => editor.chain().focus().redo().run()}><Redo className="h-4 w-4" /></Button>
        <span className="mx-1 h-5 w-px bg-border" />
        <select
          className="text-xs border rounded px-2 py-1 bg-background"
          defaultValue=""
          onChange={(e) => { if (e.target.value) { insertVar(e.target.value); e.target.value = ""; } }}
        >
          <option value="">Inserir variável…</option>
          {VARS.map((v) => <option key={v} value={v}>{`{{${v}}}`}</option>)}
        </select>
      </div>
      <div style={{ minHeight }} className="overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
