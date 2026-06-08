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
    ],
  });
}
