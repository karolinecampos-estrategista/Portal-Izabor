import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Run this SQL in Supabase Dashboard > SQL Editor",
    sql: [
      "ALTER TABLE sessoes ADD COLUMN IF NOT EXISTS link_meet TEXT;",
      "ALTER TABLE sessoes ADD COLUMN IF NOT EXISTS horario TEXT;",
    ],
  });
}
