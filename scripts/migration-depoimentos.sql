-- Tabela de depoimentos das mentoradas (aguardam aprovação da Izabor)
CREATE TABLE IF NOT EXISTS depoimentos (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentorada_id UUID NOT NULL REFERENCES mentoradas(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL,
  programa    TEXT,
  conteudo    TEXT NOT NULL,
  tipo        TEXT DEFAULT 'texto' CHECK (tipo IN ('texto','imagem','video')),
  status      TEXT DEFAULT 'pendente' CHECK (status IN ('pendente','aprovado','rejeitado')),
  conteudo_editado TEXT,   -- Izabor pode refinar antes de publicar
  criado_em   TIMESTAMPTZ DEFAULT NOW(),
  aprovado_em TIMESTAMPTZ
);

-- Apenas admins podem ver todos; mentoradas vêem só os aprovados (via API server-side)
ALTER TABLE depoimentos ENABLE ROW LEVEL SECURITY;

-- Service role bypassa RLS — todas as operações usam supabaseAdmin
