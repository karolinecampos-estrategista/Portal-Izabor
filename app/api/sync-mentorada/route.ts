import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// POST — chamado automaticamente quando a mentorada loga
// Vincula o user_id da sessão ao registro da mentorada pelo e-mail
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { user_id, email } = body;

  if (!user_id || !email) {
    return NextResponse.json({ error: "user_id e email obrigatórios" }, { status: 400 });
  }

  // Verifica se já está vinculada (evita update desnecessário)
  const { data: jaVinculada } = await supabaseAdmin
    .from("mentoradas")
    .select("id")
    .eq("id", user_id)
    .maybeSingle();

  if (jaVinculada) return NextResponse.json({ ok: true, vinculo: "id-match" });

  const { data: porUserId } = await supabaseAdmin
    .from("mentoradas")
    .select("id")
    .eq("user_id", user_id)
    .maybeSingle();

  if (porUserId) return NextResponse.json({ ok: true, vinculo: "user_id-match" });

  // Busca pelo e-mail com user_id ainda nulo
  const { data: mentorada, error } = await supabaseAdmin
    .from("mentoradas")
    .select("id, user_id")
    .eq("email", email)
    .maybeSingle();

  if (error || !mentorada) {
    return NextResponse.json({ ok: false, reason: "mentorada-nao-encontrada" });
  }

  if (mentorada.user_id) {
    // Já tem um user_id diferente — não sobrescreve
    return NextResponse.json({ ok: false, reason: "ja-tem-user_id" });
  }

  // Vincula
  const { error: updateError } = await supabaseAdmin
    .from("mentoradas")
    .update({ user_id, login_criado: true })
    .eq("id", mentorada.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, vinculo: "email-sync", mentorada_id: mentorada.id });
}
