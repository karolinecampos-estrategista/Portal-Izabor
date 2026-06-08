import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Run this SQL in Supabase Dashboard > SQL Editor",
    sql: [
      "ALTER TABLE sessoes ADD COLUMN IF NOT EXISTS link_meet TEXT;",
      "ALTER TABLE sessoes ADD COLUMN IF NOT EXISTS horario TEXT;",
      // Financeiro: vincula lançamentos a alunas do cadastro
      "ALTER TABLE lancamentos_financeiros ADD COLUMN IF NOT EXISTS mentorada_id UUID REFERENCES mentoradas(id) ON DELETE SET NULL;",
      "ALTER TABLE lancamentos_financeiros ADD COLUMN IF NOT EXISTS numero_parcela INT;",
      // Depoimentos: vínculo com mentorada e controle de status
      // Tarefas: vínculo por ID com mentorada
      "ALTER TABLE tarefas ADD COLUMN IF NOT EXISTS mentorada_id UUID REFERENCES mentoradas(id) ON DELETE SET NULL;",
      "ALTER TABLE tarefas ADD COLUMN IF NOT EXISTS tipo TEXT;",
      // Desafios: vínculo por ID com mentorada
      "ALTER TABLE desafios ADD COLUMN IF NOT EXISTS mentorada_id UUID REFERENCES mentoradas(id) ON DELETE SET NULL;",
      // Devocionais: vínculo por ID com mentorada
      "ALTER TABLE devocionais ADD COLUMN IF NOT EXISTS mentorada_id UUID REFERENCES mentoradas(id) ON DELETE SET NULL;",
      // Depoimentos
      "ALTER TABLE depoimentos ADD COLUMN IF NOT EXISTS mentorada_id UUID REFERENCES mentoradas(id) ON DELETE SET NULL;",
      "ALTER TABLE depoimentos ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pendente';",
      "ALTER TABLE depoimentos ADD COLUMN IF NOT EXISTS aprovado_em TIMESTAMPTZ;",
      "ALTER TABLE depoimentos ADD COLUMN IF NOT EXISTS conteudo_editado TEXT;",
      // Chat Comunidade BW
      "CREATE TABLE IF NOT EXISTS mensagens_chat (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id TEXT NOT NULL, nome TEXT NOT NULL, conteudo TEXT NOT NULL, canal TEXT NOT NULL DEFAULT 'comunidade', criado_em TIMESTAMPTZ NOT NULL DEFAULT now());",
      "ALTER TABLE mensagens_chat REPLICA IDENTITY FULL;",
      "ALTER PUBLICATION supabase_realtime ADD TABLE mensagens_chat;",
    ],
  });
}
