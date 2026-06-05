import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  if (authError) return NextResponse.json({ error: authError.message }, { status: 500 });

  const { data: perfis } = await supabaseAdmin.from("perfis").select("id, nome, tipo");
  const { data: mentoradas } = await supabaseAdmin.from("mentoradas").select("user_id, acesso, produtos_ativos, mostrar_financeiro");

  const perfisMap = new Map((perfis ?? []).map((p: Record<string, unknown>) => [p.id as string, p]));
  const mentoradasMap = new Map((mentoradas ?? []).map((m: Record<string, unknown>) => [m.user_id as string, m]));

  const users = authData.users
    .map((u) => {
      const perfil = perfisMap.get(u.id) ?? {};
      const mentorada = mentoradasMap.get(u.id) ?? {};
      return {
        id: u.id,
        email: u.email ?? "",
        nome: (perfil as Record<string, unknown>).nome ?? u.user_metadata?.full_name ?? null,
        tipo: (perfil as Record<string, unknown>).tipo ?? "mentorada",
        acesso: (mentorada as Record<string, unknown>).acesso ?? null,
        produtos_ativos: (mentorada as Record<string, unknown>).produtos_ativos ?? {},
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

    const { error } = await supabaseAdmin
      .from("mentoradas")
      .update(update)
      .eq("user_id", id);

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
