import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Remove acentos e deixa minúsculo, para comparações de busca que devem
 * ignorar acentuação (ex: "fenix" encontrar "Fênix"). */
export function normalizarBusca(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
