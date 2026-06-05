import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET — admin lista todos os check-ins
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("check_ins")
    .select(`
      *,
      mentoradas ( nome, cor, whatsapp, email, instagram )
    `)
    .order("criado_em", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST — mentorada envia check-in
export async function POST(req: NextRequest) {
  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from("check_ins")
    .insert({
      user_id: body.user_id ?? null,
      mentorada_id: body.mentorada_id ?? null,
      nome: body.nome,
      programa: body.programa ?? null,
      humor: body.humor,
      texto: body.texto ?? null,
      semana: body.semana ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
