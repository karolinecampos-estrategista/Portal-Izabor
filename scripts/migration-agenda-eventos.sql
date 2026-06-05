-- Tabela para eventos pessoais da agenda da Iza (separado das sessões com mentoradas)
-- Futuramente integrará com Google Calendar via google_event_id

CREATE TABLE IF NOT EXISTS eventos_agenda (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo         TEXT        NOT NULL,
  data           DATE        NOT NULL,
  horario        TEXT,                         -- ex: "10:00"
  duracao        TEXT,                         -- ex: "1h", "30min"
  descricao      TEXT,
  tipo           TEXT        DEFAULT 'outro',  -- reuniao | conteudo | pessoal | lembrete | outro
  cor            TEXT        DEFAULT '#C9A84C',
  google_event_id TEXT,                        -- reservado para integração Google Calendar
  criado_em      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE eventos_agenda ENABLE ROW LEVEL SECURITY;

-- Política permissiva para service role (usado pelo supabaseAdmin)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'eventos_agenda' AND policyname = 'service_all'
  ) THEN
    EXECUTE 'CREATE POLICY "service_all" ON eventos_agenda USING (true) WITH CHECK (true)';
  END IF;
END $$;
