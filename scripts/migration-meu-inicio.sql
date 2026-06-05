-- Tabela Meu Começo — fotos e mensagem por mentorada (Club BW)
CREATE TABLE IF NOT EXISTS meu_inicio (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentorada_id  UUID NOT NULL REFERENCES mentoradas(id) ON DELETE CASCADE,
  foto_inicio   TEXT,        -- URL da foto do começo (antes)
  foto_atual    TEXT,        -- URL da foto atual (depois / mais recente)
  mensagem      TEXT,        -- Mensagem personalizada da Izabor
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mentorada_id)       -- uma linha por mentorada
);

ALTER TABLE meu_inicio ENABLE ROW LEVEL SECURITY;
-- Service role (supabaseAdmin) bypassa RLS — todas operações são server-side

-- Bucket de storage para as fotos (criar manualmente no Supabase dashboard):
-- Storage > New bucket > nome: "meu-inicio" > Public: SIM
