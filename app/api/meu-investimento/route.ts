import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "não autenticado" }, { status: 401 });

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: "token inválido" }, { status: 401 });

  // Busca o registro principal da mentorada
  const { data: mentorada } = await supabaseAdmin
    .from("mentoradas")
    .select("email, nome, acesso_seja_incomum, acesso_club_bw, acesso_box_livro, acesso_evento")
    .or(`id.eq.${user.id},user_id.eq.${user.id}`)
    .maybeSingle();

  if (!mentorada?.email) {
    return NextResponse.json({ produtos: [] });
  }

  const email = mentorada.email;
  const produtos: {
    chave: string;
    nome: string;
    tipo: string;
    emoji: string;
    cor: string;
    dataCompra?: string | null;
    mesInicio?: string | null;
    mesFim?: string | null;
    statusAcesso?: string | null;
    statusPagamento?: string | null;
    valor?: number | null;
    formaPagamento?: string | null;
  }[] = [];

  // Seja Incomum
  if (mentorada.acesso_seja_incomum) {
    const { data: si } = await supabaseAdmin
      .from("seja_incomum_compradores")
      .select("data_compra, status_acesso, status_pagamento, valor, forma_pagamento")
      .eq("email", email)
      .maybeSingle();
    produtos.push({
      chave: "seja_incomum",
      nome: "Seja Incomum",
      tipo: "Video Aulas",
      emoji: "👑",
      cor: "#C9A84C",
      dataCompra: si?.data_compra ?? null,
      statusAcesso: si?.status_acesso ?? "ativo",
      statusPagamento: si?.status_pagamento ?? null,
      valor: si?.valor ?? null,
      formaPagamento: si?.forma_pagamento ?? null,
    });
  }

  // Club BW
  if (mentorada.acesso_club_bw) {
    const { data: bw } = await supabaseAdmin
      .from("club_bw_compradores")
      .select("data_compra, mes_inicio, mes_fim, status_acesso, status_pagamento, valor, forma_pagamento")
      .eq("email", email)
      .maybeSingle();
    produtos.push({
      chave: "club_bw",
      nome: "Club BW",
      tipo: "Mentoria",
      emoji: "💜",
      cor: "#a78bfa",
      dataCompra: bw?.data_compra ?? null,
      mesInicio: bw?.mes_inicio ?? null,
      mesFim: bw?.mes_fim ?? null,
      statusAcesso: bw?.status_acesso ?? "ativo",
      statusPagamento: bw?.status_pagamento ?? null,
      valor: bw?.valor ?? null,
      formaPagamento: bw?.forma_pagamento ?? null,
    });
  }

  // Box do Livro
  if (mentorada.acesso_box_livro) {
    const { data: box } = await supabaseAdmin
      .from("box_livro_compradores")
      .select("data_compra, variante, status_entrega, status_pagamento, valor, forma_pagamento")
      .eq("email", email)
      .maybeSingle();
    produtos.push({
      chave: "box_livro",
      nome: "Box do Livro",
      tipo: "Lançamento",
      emoji: "📖",
      cor: "#86efac",
      dataCompra: box?.data_compra ?? null,
      statusAcesso: box?.status_entrega ?? "pendente",
      statusPagamento: box?.status_pagamento ?? null,
      valor: box?.valor ?? null,
      formaPagamento: box?.forma_pagamento ?? null,
    });
  }

  // Evento Simplesmente Seja
  if (mentorada.acesso_evento) {
    const { data: ev } = await supabaseAdmin
      .from("evento_compradores")
      .select("data_compra, status_acesso")
      .eq("email", email)
      .maybeSingle();
    produtos.push({
      chave: "evento",
      nome: "Simplesmente Seja",
      tipo: "Evento Presencial",
      emoji: "🔥",
      cor: "#fb923c",
      dataCompra: ev?.data_compra ?? null,
      statusAcesso: ev?.status_acesso ?? "ativo",
    });
  }

  return NextResponse.json({ produtos, nome: mentorada.nome });
}
