import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mentoradaId = searchParams.get("mentorada_id");

  let query = supabaseAdmin
    .from("check_ins")
    .select(`*, mentoradas ( id, nome, cor, whatsapp, email, instagram, programa, status, aniversario )`)
    .order("criado_em", { ascending: false });

  if (mentoradaId) query = query.eq("mentorada_id", mentoradaId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const checkins = data ?? [];

  // Fallback: para check-ins sem mentorada_id (registros antigos), tenta resolver pelo nome
  const semVinculo = checkins.filter((c) => !c.mentoradas && c.nome);
  if (semVinculo.length > 0) {
    const nomes = [...new Set(semVinculo.map((c: { nome: string }) => c.nome))];
    const { data: porNome } = await supabaseAdmin
      .from("mentoradas")
      .select("id, nome, cor, whatsapp, email, instagram, programa, status, aniversario")
      .in("nome", nomes);

    if (porNome) {
      const idx: Record<string, typeof porNome[0]> = {};
      for (const m of porNome) idx[m.nome] = m;
      for (const c of checkins) {
        if (!c.mentoradas && c.nome && idx[c.nome]) c.mentoradas = idx[c.nome];
      }
    }
  }

  return NextResponse.json(checkins);
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
