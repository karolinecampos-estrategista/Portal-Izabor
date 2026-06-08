import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mentoradaId = searchParams.get("mentorada_id");

  let query = supabaseAdmin
    .from("diagnosticos")
    .select(`*, mentoradas ( id, nome, cor, whatsapp, email, instagram, programa, status )`)
    .order("criado_em", { ascending: false });

  if (mentoradaId) query = query.eq("mentorada_id", mentoradaId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const diagnosticos = data ?? [];

  // Fallback: para registros antigos sem mentorada_id, resolve pelo nome
  const semVinculo = diagnosticos.filter((d) => !d.mentoradas && d.nome);
  if (semVinculo.length > 0) {
    const nomes = [...new Set(semVinculo.map((d: { nome: string }) => d.nome))];
    const { data: porNome } = await supabaseAdmin
      .from("mentoradas")
      .select("id, nome, cor, whatsapp, email, instagram, programa, status")
      .in("nome", nomes);
    if (porNome) {
      const idx: Record<string, typeof porNome[0]> = {};
      for (const m of porNome) idx[m.nome] = m;
      for (const d of diagnosticos) {
        if (!d.mentoradas && d.nome && idx[d.nome]) d.mentoradas = idx[d.nome];
      }
    }
  }

  return NextResponse.json(diagnosticos);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const insertData: Record<string, unknown> = {
    user_id: body.user_id ?? null,
    nome: body.nome,
    email: body.email ?? null,
    programa: body.programa ?? null,
    perfil: body.perfil ?? null,
    cor: body.cor ?? "#C9A84C",
    foco: body.foco ?? [],
    respostas: body.respostas ?? [],
  };
  if (body.mentorada_id) insertData.mentorada_id = body.mentorada_id;

  const { data, error } = await supabaseAdmin
    .from("diagnosticos")
    .insert(insertData)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
