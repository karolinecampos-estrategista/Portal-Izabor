-- Migration: adicionar campos de pagamento nas tabelas de compradores
-- Execute no Supabase SQL Editor

ALTER TABLE seja_incomum_compradores
  ADD COLUMN IF NOT EXISTS status_pagamento TEXT DEFAULT 'pendente',
  ADD COLUMN IF NOT EXISTS valor NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS forma_pagamento TEXT;

ALTER TABLE club_bw_compradores
  ADD COLUMN IF NOT EXISTS status_pagamento TEXT DEFAULT 'pendente',
  ADD COLUMN IF NOT EXISTS valor NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS forma_pagamento TEXT;

ALTER TABLE box_livro_compradores
  ADD COLUMN IF NOT EXISTS status_pagamento TEXT DEFAULT 'pendente',
  ADD COLUMN IF NOT EXISTS valor NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS forma_pagamento TEXT;
