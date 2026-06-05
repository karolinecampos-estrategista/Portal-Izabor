-- ============================================================
-- MIGRATION — Tabelas de compradores dos produtos
-- Rodar no Supabase > SQL Editor > Run
-- ============================================================

-- ── SEJA INCOMUM (Mentoria Individual) — Compradores ─────────
CREATE TABLE IF NOT EXISTS seja_incomum_compradores (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          TEXT NOT NULL,
  email         TEXT,
  whatsapp      TEXT,
  instagram     TEXT,
  data_compra   DATE DEFAULT CURRENT_DATE,
  status_acesso TEXT DEFAULT 'ativo' CHECK (status_acesso IN ('ativo','pendente','inativo')),
  progresso     INTEGER DEFAULT 0 CHECK (progresso BETWEEN 0 AND 100),
  notas         TEXT,
  criado_em     TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE seja_incomum_compradores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin gerencia seja_incomum_compradores" ON seja_incomum_compradores;
CREATE POLICY "Admin gerencia seja_incomum_compradores" ON seja_incomum_compradores FOR ALL USING (
  EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND tipo = 'admin')
);

-- ── EVENTO (Simplesmente Seja) — Compradores ─────────────────
CREATE TABLE IF NOT EXISTS evento_compradores (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          TEXT NOT NULL,
  email         TEXT,
  whatsapp      TEXT,
  instagram     TEXT,
  data_compra   DATE DEFAULT CURRENT_DATE,
  tipo_ingresso TEXT DEFAULT 'geral' CHECK (tipo_ingresso IN ('vip','geral','cortesia')),
  status_acesso TEXT DEFAULT 'confirmado' CHECK (status_acesso IN ('confirmado','pendente','cancelado')),
  presenca      TEXT DEFAULT 'pendente' CHECK (presenca IN ('pendente','presente','ausente')),
  notas         TEXT,
  criado_em     TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE evento_compradores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin gerencia evento_compradores" ON evento_compradores;
CREATE POLICY "Admin gerencia evento_compradores" ON evento_compradores FOR ALL USING (
  EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND tipo = 'admin')
);

-- ── BOX DO LIVRO — Compradores ────────────────────────────────
CREATE TABLE IF NOT EXISTS box_livro_compradores (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome              TEXT NOT NULL,
  whatsapp          TEXT,
  instagram         TEXT,
  data_compra       DATE DEFAULT CURRENT_DATE,
  variante          TEXT DEFAULT 'completo' CHECK (variante IN ('completo','so-livro','devocional-30')),
  status_entrega    TEXT DEFAULT 'pendente' CHECK (status_entrega IN ('pendente','enviado','entregue')),
  nivel_engajamento TEXT DEFAULT 'sem-contato' CHECK (nivel_engajamento IN ('sem-contato','recebeu','lendo','postou','engajada')),
  status_upsell     TEXT DEFAULT 'nao-abordada' CHECK (status_upsell IN ('nao-abordada','em-conversa','convertida')),
  tem_acesso_bw     BOOLEAN DEFAULT FALSE,
  notas             TEXT,
  criado_em         TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE box_livro_compradores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin gerencia box_livro_compradores" ON box_livro_compradores;
CREATE POLICY "Admin gerencia box_livro_compradores" ON box_livro_compradores FOR ALL USING (
  EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND tipo = 'admin')
);

-- ── CAMPO ACESSO na tabela mentoradas (caso não exista) ──────
ALTER TABLE mentoradas ADD COLUMN IF NOT EXISTS acesso TEXT DEFAULT 'mentoria'
  CHECK (acesso IN ('mentoria','livro','ambos'));

-- ── MIGRATIONS ANTERIORES (devocionais e tarefas) ────────────
ALTER TABLE devocionais ADD COLUMN IF NOT EXISTS versiculo TEXT;
ALTER TABLE devocionais ADD COLUMN IF NOT EXISTS categoria TEXT DEFAULT 'Fe';
ALTER TABLE devocionais ADD COLUMN IF NOT EXISTS destaque BOOLEAN DEFAULT FALSE;
ALTER TABLE tarefas ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'acao';
