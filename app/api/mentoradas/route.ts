import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET — lista todas as mentoradas
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("mentoradas")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST — cria mentorada + envia convite por e-mail
export async function POST(req: NextRequest) {
  const body = await req.json();

  let userId: string | null = null;
  let loginCriado = false;

  // Convite por e-mail via Supabase Auth
  if (body.email?.trim()) {
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      body.email.trim(),
      {
        data: { tipo: "mentorada", nome: body.nome },
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/mentorada`,
      }
    );
    if (!authError && authData?.user) {
      userId = authData.user.id;
      loginCriado = true;
    }
  }

  // Salva no banco
  const { data, error } = await supabaseAdmin
    .from("mentoradas")
    .insert({
      user_id: userId,
      nome: body.nome,
      email: body.email ?? null,
      whatsapp: body.whatsapp ?? null,
      instagram: body.instagram ?? null,
      aniversario: body.aniversario ?? null,
      programa: body.programa ?? "Mentoria Individual",
      inicio: body.inicio ?? null,
      status: body.status ?? "ativo",
      sessoes_feitas: body.sessoes ?? 0,
      total_sessoes: body.totalSessoes ?? 6,
      proxima_sessao: body.proxima ?? null,
      notas: body.notas ?? null,
      pilares: body.pilares ?? [],
      origem: body.origem ?? null,
      valor_negociado: body.valorNegociado ?? 0,
      forma_pagamento: body.formaPagamento ?? "cartao",
      total_parcelas: body.totalParcelas ?? 1,
      anotacoes_negociacao: body.anotacoesNegociacao ?? null,
      cor: body.cor ?? "#C9A84C",
      login_criado: loginCriado,
      acesso: body.acesso ?? "mentoria",
      mostrar_financeiro: body.mostrarFinanceiro ?? false,
      produtos_ativos: body.produtosAtivos ?? {},
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ...data, loginCriado });
}

// DELETE — remove mentorada e usuário Auth
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  // Busca user_id antes de deletar
  const { data: m } = await supabaseAdmin.from("mentoradas").select("user_id").eq("id", id).single();

  const { error } = await supabaseAdmin.from("mentoradas").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Remove da Auth se tiver login
  if (m?.user_id) {
    await supabaseAdmin.auth.admin.deleteUser(m.user_id);
  }

  return NextResponse.json({ ok: true });
}

// PATCH — atualiza mentorada
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...campos } = body;

  const { data, error } = await supabaseAdmin
    .from("mentoradas")
    .update({
      nome: campos.nome,
      email: campos.email,
      whatsapp: campos.whatsapp,
      instagram: campos.instagram,
      aniversario: campos.aniversario,
      programa: campos.programa,
      inicio: campos.inicio,
      status: campos.status,
      sessoes_feitas: campos.sessoes,
      total_sessoes: campos.totalSessoes,
      proxima_sessao: campos.proxima,
      notas: campos.notas,
      pilares: campos.pilares,
      origem: campos.origem,
      valor_negociado: campos.valorNegociado,
      forma_pagamento: campos.formaPagamento,
      total_parcelas: campos.totalParcelas,
      anotacoes_negociacao: campos.anotacoesNegociacao,
      cor: campos.cor,
      acesso: campos.acesso,
      mostrar_financeiro: campos.mostrarFinanceiro,
      produtos_ativos: campos.produtosAtivos,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
