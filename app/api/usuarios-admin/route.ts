import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  if (authError) return NextResponse.json({ error: authError.message }, { status: 500 });

  const { data: perfis } = await supabaseAdmin.from("perfis").select("id, nome, tipo");
  // Busca mentoradas com todos os campos de acesso (legado user_id e novo id)
  const { data: mentoradas } = await supabaseAdmin
    .from("mentoradas")
    .select("id, user_id, acesso, produtos_ativos, mostrar_financeiro, acesso_seja_incomum, acesso_club_bw, acesso_box_livro, acesso_evento");

  const perfisMap = new Map((perfis ?? []).map((p: Record<string, unknown>) => [p.id as string, p]));

  // Suporta legado (user_id) e novo sistema (id como PK = auth user id)
  const mentoradasMap = new Map<string, Record<string, unknown>>();
  (mentoradas ?? []).forEach((m: Record<string, unknown>) => {
    if (m.id)      mentoradasMap.set(m.id as string, m);
    if (m.user_id && m.user_id !== m.id) mentoradasMap.set(m.user_id as string, m);
  });

  const users = authData.users
    .map((u) => {
      const perfil = perfisMap.get(u.id) ?? {};
      const m = mentoradasMap.get(u.id) ?? {};

      // Mescla produtos_ativos (legado JSON) com colunas booleanas (novo sistema)
      const produtosAtivos = {
        ...(m.produtos_ativos as Record<string, boolean> ?? {}),
        ...(m.acesso_seja_incomum ? { seja_incomum: true } : {}),
        ...(m.acesso_club_bw      ? { club_bw: true }      : {}),
        ...(m.acesso_box_livro    ? { box_livro: true }    : {}),
        ...(m.acesso_evento       ? { evento: true }       : {}),
      };

      return {
        id: u.id,
        email: u.email ?? "",
        nome: (perfil as Record<string, unknown>).nome ?? u.user_metadata?.nome ?? u.user_metadata?.full_name ?? null,
        tipo: (perfil as Record<string, unknown>).tipo ?? "mentorada",
        acesso: m.acesso ?? null,
        produtos_ativos: produtosAtivos,
        bloqueado: !!u.banned_until,
        ultimo_acesso: u.last_sign_in_at ?? null,
        criado_em: u.created_at,
      };
    })
    .filter((u) => u.tipo !== "admin");

  return NextResponse.json(users);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, acao, acesso, produtosAtivos } = body;

  if (acao === "bloquear") {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(id, { ban_duration: "876000h" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (acao === "desbloquear") {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(id, { ban_duration: "none" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (acao === "atualizar_acesso") {
    const update: Record<string, unknown> = {};
    if (acesso !== undefined) update.acesso = acesso;
    if (produtosAtivos !== undefined) update.produtos_ativos = produtosAtivos;

    // Tenta pelo id (novo sistema), cai no user_id (legado) se não encontrar
    const { error } = await supabaseAdmin
      .from("mentoradas")
      .update(update)
      .or(`id.eq.${id},user_id.eq.${id}`);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (acao === "resetar_senha") {
    const { data: user } = await supabaseAdmin.auth.admin.getUserById(id);
    if (user.user?.email) {
      const { error } = await supabaseAdmin.auth.resetPasswordForEmail(user.user.email);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
