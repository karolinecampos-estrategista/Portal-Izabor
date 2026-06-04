-- Migração: adicionar colunas que faltam na tabela devocionais
-- Cole no Supabase > SQL Editor > Run

ALTER TABLE devocionais ADD COLUMN IF NOT EXISTS versiculo TEXT;
ALTER TABLE devocionais ADD COLUMN IF NOT EXISTS categoria TEXT DEFAULT 'Fe';
ALTER TABLE devocionais ADD COLUMN IF NOT EXISTS destaque BOOLEAN DEFAULT FALSE;
