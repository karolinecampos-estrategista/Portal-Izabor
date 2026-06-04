-- Migração: adicionar campo tipo na tabela tarefas
-- Cole no Supabase > SQL Editor > Run

ALTER TABLE tarefas ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'acao';
