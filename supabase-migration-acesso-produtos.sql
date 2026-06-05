-- ============================================================
-- MIGRATION — Acesso por produto para Extraordinárias
-- Rodar no Supabase > SQL Editor > Run
-- ============================================================

-- Adiciona colunas de acesso por produto na tabela mentoradas
ALTER TABLE mentoradas
  ADD COLUMN IF NOT EXISTS acesso_seja_incomum  BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS acesso_club_bw        BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS acesso_box_livro       BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS acesso_evento          BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS convite_enviado        BOOLEAN DEFAULT false;

-- Adiciona email na tabela box_livro_compradores (estava faltando)
ALTER TABLE box_livro_compradores
  ADD COLUMN IF NOT EXISTS email TEXT;
