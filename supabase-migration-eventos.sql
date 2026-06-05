-- Migration: Tabela de Eventos e campo email no Box do Livro
-- Rodar no Supabase > SQL Editor > Run

-- 1. Tabela de eventos (cadastro/gestão dos eventos da Izabor)
CREATE TABLE IF NOT EXISTS eventos (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome            TEXT        NOT NULL,
  descricao       TEXT,
  data_evento     DATE,
  horario         TEXT,
  local           TEXT,
  endereco        TEXT,
  tipo            TEXT        DEFAULT 'presencial',  -- presencial | online | hibrido
  status          TEXT        DEFAULT 'ativo',       -- ativo | em-breve | encerrado | cancelado
  link_inscricao  TEXT,
  vagas_total     INTEGER,
  vagas_vip       INTEGER,
  notas           TEXT,
  criado_em       TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Adicionar campo email na tabela box_livro_compradores (caso não exista)
ALTER TABLE box_livro_compradores
  ADD COLUMN IF NOT EXISTS email TEXT;

-- 3. Tabela Club BW — compradores/alunas
CREATE TABLE IF NOT EXISTS club_bw_compradores (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          TEXT        NOT NULL,
  email         TEXT,
  whatsapp      TEXT,
  instagram     TEXT,
  data_compra   DATE        DEFAULT CURRENT_DATE,
  status_acesso TEXT        DEFAULT 'ativo' CHECK (status_acesso IN ('ativo','encerrado','cancelado')),
  mes_inicio    TEXT,
  mes_fim       TEXT,
  notas         TEXT,
  criado_em     TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE club_bw_compradores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin gerencia club_bw_compradores" ON club_bw_compradores;
CREATE POLICY "Admin gerencia club_bw_compradores" ON club_bw_compradores FOR ALL USING (
  EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND tipo = 'admin')
);

-- 4. Tabela de ingressos dos eventos
CREATE TABLE IF NOT EXISTS evento_ingressos (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome           TEXT        NOT NULL,
  email          TEXT,
  telefone       TEXT,
  whatsapp       TEXT,
  evento_nome    TEXT,
  tipo_ingresso  TEXT        DEFAULT 'normal' CHECK (tipo_ingresso IN ('normal','vip','cortesia')),
  status         TEXT        DEFAULT 'confirmado' CHECK (status IN ('confirmado','pendente','cancelado')),
  data_ingresso  DATE        DEFAULT CURRENT_DATE,
  notas          TEXT,
  criado_em      TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE evento_ingressos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin gerencia evento_ingressos" ON evento_ingressos;
CREATE POLICY "Admin gerencia evento_ingressos" ON evento_ingressos FOR ALL USING (
  EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND tipo = 'admin')
);
