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
};

export function ClienteSearchSelect({
  clientes,
  value,
  onChange,
  placeholder = "Buscar cliente por nome ou CNPJ…",
}: {
  clientes: ClienteOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
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
            <span className="truncate">
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
              {clientes.map((c) => (
                <CommandItem
                  key={c.id}
                  value={c.id}
                  onSelect={() => {
                    onChange(c.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === c.id ? "opacity-100" : "opacity-0")} />
                  <div className="flex flex-col">
                    <span className="text-sm">{nomeExibicao(c)}</span>
                    <span className="text-xs text-muted-foreground">
                      {c.cnpj}
                      {c.cidade && ` · ${c.cidade}`}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
