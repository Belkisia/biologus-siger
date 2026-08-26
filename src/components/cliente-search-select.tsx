import { useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type ClienteOption = {
  id: string;
  razao_social: string;
  fantasia?: string | null;
  nome_fantasia?: string | null;
  cnpj?: string | null;
  cidade?: string | null;
  status?: string | null;
};

export function ClienteSearchSelect({
  clientes,
  value,
  onChange,
  placeholder = "Buscar cliente por nome ou CNPJ…",
  bloquearBloqueados = false,
}: {
  clientes: ClienteOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  /** Se true, impede selecionar clientes com status "bloqueado" (ex.: inadimplência) */
  bloquearBloqueados?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selecionado = clientes.find((c) => c.id === value);
  const nomeExibicao = (c: ClienteOption) => c.fantasia || c.nome_fantasia || c.razao_social;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {selecionado ? (
            <span className="truncate flex items-center gap-2">
              {selecionado.status === "bloqueado" && <span title="Cliente bloqueado">🔒</span>}
              {nomeExibicao(selecionado)}
              {selecionado.cnpj && <span className="text-muted-foreground ml-2 text-xs">{selecionado.cnpj}</span>}
            </span>
          ) : (
            <span className="text-muted-foreground flex items-center gap-2">
              <Search className="h-4 w-4" />
              {placeholder}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command
          filter={(itemId, search) => {
            const c = clientes.find((x) => x.id === itemId);
            if (!c) return 0;
            const alvo = `${nomeExibicao(c)} ${c.razao_social} ${c.cnpj ?? ""} ${c.cidade ?? ""}`.toLowerCase();
            return alvo.includes(search.toLowerCase()) ? 1 : 0;
          }}
        >
          <CommandInput placeholder="Digite o nome, CNPJ ou cidade…" />
          <CommandList>
            <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
            <CommandGroup>
              {clientes.map((c) => {
                const bloqueado = c.status === "bloqueado";
                const desabilitado = bloqueado && bloquearBloqueados;
                return (
                  <CommandItem
                    key={c.id}
                    value={c.id}
                    disabled={desabilitado}
                    onSelect={() => {
                      if (desabilitado) return;
                      onChange(c.id);
                      setOpen(false);
                    }}
                    className={desabilitado ? "opacity-50" : ""}
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === c.id ? "opacity-100" : "opacity-0")} />
                    <div className="flex flex-col">
                      <span className="text-sm flex items-center gap-1.5">
                        {bloqueado && <span title="Cliente bloqueado (inadimplência)">🔒</span>}
                        {nomeExibicao(c)}
                        {bloqueado && <span className="text-xs text-destructive font-medium">bloqueado</span>}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {c.cnpj}
                        {c.cidade && ` · ${c.cidade}`}
                      </span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
