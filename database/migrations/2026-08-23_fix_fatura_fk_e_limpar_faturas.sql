-- Corrige a constraint de FK entre boletins_medicao.fatura_id e
-- faturas.id: hoje ela bloqueia apagar uma fatura enquanto algum
-- boletim estiver ligado a ela ("update or delete on table faturas
-- violates foreign key constraint boletins_medicao_fatura_id_fkey").
-- Passa a ser ON DELETE SET NULL: ao apagar a fatura, o boletim so
-- volta a ficar "nao faturado" (fatura_id some), sem travar a exclusao.
-- Rode no SQL Editor do Supabase.

ALTER TABLE public.boletins_medicao
  DROP CONSTRAINT IF EXISTS boletins_medicao_fatura_id_fkey;

ALTER TABLE public.boletins_medicao
  ADD CONSTRAINT boletins_medicao_fatura_id_fkey
  FOREIGN KEY (fatura_id) REFERENCES public.faturas(id) ON DELETE SET NULL;

-- Limpa todas as faturas de teste geradas ate agora, para comecar
-- a semana com o financeiro zerado. Os boletins_medicao ficam
-- preservados (so perdem o vinculo com a fatura apagada).
DELETE FROM public.faturas;
