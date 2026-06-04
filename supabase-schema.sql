-- ============================================================
-- PORTAL IZABOR CRUZ — Schema completo do banco de dados
-- Cole tudo isso no Supabase > SQL Editor > Run
-- ============================================================

-- ── PERFIS (admin ou mentorada) ──────────────────────────────
CREATE TABLE IF NOT EXISTS perfis (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo        TEXT NOT NULL CHECK (tipo IN ('admin', 'mentorada')),
  nome        TEXT NOT NULL,
  email       TEXT,
  programa    TEXT,
  criado_em   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Perfil próprio" ON perfis FOR ALL USING (auth.uid() = id);
CREATE POLICY "Admin vê todos" ON perfis FOR SELECT USING (
  EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND tipo = 'admin')
);

-- ── MENTORADAS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mentoradas (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID REFERENCES auth.users(id),
  nome                  TEXT NOT NULL,
  email                 TEXT,
  whatsapp              TEXT,
  instagram             TEXT,
  aniversario           TEXT,
  programa              TEXT DEFAULT 'Mentoria Individual',
  inicio                TEXT,
  status                TEXT DEFAULT 'ativo' CHECK (status IN ('ativo','concluido','pausado')),
  sessoes_feitas        INTEGER DEFAULT 0,
  total_sessoes         INTEGER DEFAULT 6,
  proxima_sessao        TEXT,
  notas                 TEXT,
  pilares               TEXT[] DEFAULT '{}',
  origem                TEXT,
  valor_negociado       DECIMAL DEFAULT 0,
  forma_pagamento       TEXT DEFAULT 'cartao',
  total_parcelas        INTEGER DEFAULT 1,
  anotacoes_negociacao  TEXT,
  cor                   TEXT DEFAULT '#C9A84C',
  login_criado          BOOLEAN DEFAULT FALSE,
  criado_em             TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE mentoradas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin gerencia mentoradas" ON mentoradas FOR ALL USING (
  EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND tipo = 'admin')
);
CREATE POLICY "Mentorada vê próprio cadastro" ON mentoradas FOR SELECT USING (
  user_id = auth.uid()
);

-- ── SESSÕES ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessoes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentorada_id    UUID REFERENCES mentoradas(id) ON DELETE CASCADE,
  mentorada_nome  TEXT,
  cor             TEXT DEFAULT '#C9A84C',
  data            DATE,
  duracao         TEXT DEFAULT '60 min',
  status          TEXT DEFAULT 'agendada' CHECK (status IN ('agendada','realizada','faltou','remarcada')),
  resumo          TEXT,
  acoes           TEXT[] DEFAULT '{}',
  gravacao        TEXT,
  criado_em       TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE sessoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin gerencia sessoes" ON sessoes FOR ALL USING (
  EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND tipo = 'admin')
);
CREATE POLICY "Mentorada vê suas sessoes" ON sessoes FOR SELECT USING (
  mentorada_id IN (SELECT id FROM mentoradas WHERE user_id = auth.uid())
);

-- ── CHECK-INS SEMANAIS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS check_ins (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id),
  mentorada_id  UUID REFERENCES mentoradas(id),
  nome          TEXT,
  programa      TEXT,
  humor         INTEGER CHECK (humor BETWEEN 1 AND 5),
  texto         TEXT,
  semana        TEXT,
  criado_em     TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin vê check-ins" ON check_ins FOR SELECT USING (
  EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND tipo = 'admin')
);
CREATE POLICY "Mentorada gerencia próprio check-in" ON check_ins FOR ALL USING (
  user_id = auth.uid()
);

-- ── DIAGNÓSTICOS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS diagnosticos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id),
  nome        TEXT,
  email       TEXT,
  programa    TEXT,
  perfil      TEXT,
  cor         TEXT,
  foco        TEXT[] DEFAULT '{}',
  respostas   JSONB DEFAULT '[]',
  criado_em   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE diagnosticos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin vê diagnosticos" ON diagnosticos FOR SELECT USING (
  EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND tipo = 'admin')
);
CREATE POLICY "Mentorada gerencia próprio diagnostico" ON diagnosticos FOR ALL USING (
  user_id = auth.uid()
);

-- ── PLANOS DE AÇÃO ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS planos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentorada_id    UUID REFERENCES mentoradas(id) ON DELETE CASCADE,
  mentorada_nome  TEXT,
  cor             TEXT DEFAULT '#C9A84C',
  programa        TEXT,
  criado_em       TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS marcos (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plano_id  UUID REFERENCES planos(id) ON DELETE CASCADE,
  texto     TEXT NOT NULL,
  feito     BOOLEAN DEFAULT FALSE,
  semana    TEXT DEFAULT 'A definir',
  ordem     INTEGER DEFAULT 0
);
ALTER TABLE planos ENABLE ROW LEVEL SECURITY;
ALTER TABLE marcos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin gerencia planos" ON planos FOR ALL USING (
  EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND tipo = 'admin')
);
CREATE POLICY "Mentorada vê próprio plano" ON planos FOR SELECT USING (
  mentorada_id IN (SELECT id FROM mentoradas WHERE user_id = auth.uid())
);
CREATE POLICY "Admin gerencia marcos" ON marcos FOR ALL USING (
  EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND tipo = 'admin')
);
CREATE POLICY "Mentorada vê marcos" ON marcos FOR SELECT USING (
  plano_id IN (
    SELECT id FROM planos WHERE mentorada_id IN (
      SELECT id FROM mentoradas WHERE user_id = auth.uid()
    )
  )
);

-- ── DEVOCIONAIS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS devocionais (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo          TEXT NOT NULL,
  tipo            TEXT DEFAULT 'texto' CHECK (tipo IN ('texto','video')),
  conteudo        TEXT,
  link_video      TEXT,
  publicado       BOOLEAN DEFAULT FALSE,
  destino         TEXT DEFAULT 'todas-bw',
  mentorada_nome  TEXT,
  criado_em       TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE devocionais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin gerencia devocionais" ON devocionais FOR ALL USING (
  EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND tipo = 'admin')
);
CREATE POLICY "Mentorada vê devocionais publicados" ON devocionais FOR SELECT USING (
  publicado = TRUE AND (
    destino = 'todas-bw' OR
    mentorada_nome IN (SELECT nome FROM mentoradas WHERE user_id = auth.uid())
  )
);

-- ── AULAS BW ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS aulas_bw (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo      TEXT NOT NULL,
  descricao   TEXT,
  duracao     TEXT,
  modulo      TEXT,
  ordem       INTEGER DEFAULT 1,
  status      TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho','publicada')),
  link        TEXT,
  thumbnail   TEXT DEFAULT '✝️',
  criado_em   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE aulas_bw ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin gerencia aulas" ON aulas_bw FOR ALL USING (
  EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND tipo = 'admin')
);
CREATE POLICY "Mentorada vê aulas publicadas" ON aulas_bw FOR SELECT USING (
  status = 'publicada'
);

-- ── DESAFIOS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS desafios (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo          TEXT NOT NULL,
  descricao       TEXT,
  pilar           TEXT DEFAULT 'Fe',
  prazo           DATE,
  destino         TEXT DEFAULT 'todas-bw',
  mentorada_nome  TEXT,
  criado_em       TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE desafios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin gerencia desafios" ON desafios FOR ALL USING (
  EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND tipo = 'admin')
);
CREATE POLICY "Mentorada vê desafios" ON desafios FOR SELECT USING (
  destino = 'todas-bw' OR
  mentorada_nome IN (SELECT nome FROM mentoradas WHERE user_id = auth.uid())
);

-- ── TAREFAS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tarefas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo          TEXT NOT NULL,
  descricao       TEXT,
  status          TEXT DEFAULT 'Pendente',
  prioridade      TEXT DEFAULT 'Media',
  pilar           TEXT,
  mentorada_nome  TEXT,
  data_entrega    DATE,
  criado_em       TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin gerencia tarefas" ON tarefas FOR ALL USING (
  EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND tipo = 'admin')
);
CREATE POLICY "Mentorada vê suas tarefas" ON tarefas FOR SELECT USING (
  mentorada_nome IN (SELECT nome FROM mentoradas WHERE user_id = auth.uid())
);

-- ── FUNÇÃO: criar perfil automaticamente ao registrar ─────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.perfis (id, tipo, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'tipo', 'mentorada'),
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
