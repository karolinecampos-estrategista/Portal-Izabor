import { supabaseAdmin } from "./supabase-admin";

export type ProdutoAcesso = "seja_incomum" | "club_bw" | "box_livro" | "evento";

export const PORTAL_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://projeto-iza-nine.vercel.app";

// Gera slug único baseado no nome (ex: "Ana Silva" → "as", "Andrea Santos" → "ands")
function normalizarTexto(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
}

export async function gerarSlugUnico(nome: string): Promise<string> {
  const partes = nome.trim().split(/\s+/).map(normalizarTexto).filter(Boolean);
  const primeiro = partes[0] ?? "bw";
  const ultimo   = partes[partes.length - 1] ?? "";
  const iniciais = partes.map(p => p[0]).join("");
  const multiParte = partes.length > 1 && primeiro !== ultimo;

  // Candidatos do mais descritivo/único para o mais curto.
  // Ordem importa: nomes parecidos divergem cedo e ficam identificáveis.
  const raw = [
    multiParte ? primeiro + ultimo : "",          // "anasilva" / "anasantos"
    multiParte ? primeiro + (ultimo[0] ?? "") : "",// "anas"
    multiParte ? primeiro + ultimo.slice(0, 2) : "",// "anasa"
    iniciais,                                      // "as" ou "i" (nome único)
    primeiro,                                      // "ana" / "izabor"
  ];
  const candidatos = [...new Set(raw.filter(Boolean))];

  const { data: existentes } = await supabaseAdmin
    .from("mentoradas")
    .select("slug")
    .in("slug", candidatos);

  const usados = new Set((existentes ?? []).map((r: { slug: string }) => r.slug));

  for (const c of candidatos) {
    if (!usados.has(c)) return c;
  }

  // Fallback: iniciais + N (ex: "as2", "as3") — diferencia melhor nomes similares
  let i = 2;
  while (true) {
    const slug = `${iniciais}${i}`;
    const { data } = await supabaseAdmin.from("mentoradas").select("slug").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    i++;
  }
}

export async function criarAcessoExtraordinaria(
  email: string | null | undefined,
  nome: string,
  produto: ProdutoAcesso | ProdutoAcesso[]
): Promise<{ ok: boolean; mensagem: string; conviteEnviado: boolean; linkAcesso?: string; slug?: string }> {
  if (!email?.trim()) {
    return { ok: false, mensagem: "Sem e-mail — acesso não criado.", conviteEnviado: false };
  }

  const emailNorm = email.trim().toLowerCase();
  const produtos  = Array.isArray(produto) ? produto : [produto];
  const flags: Record<string, boolean> = {};
  produtos.forEach((p) => { flags[`acesso_${p}`] = true; });

  // 1. Verifica se já existe mentorada
  const { data: existente } = await supabaseAdmin
    .from("mentoradas")
    .select("id, nome, convite_enviado, slug")
    .eq("email", emailNorm)
    .maybeSingle();

  if (existente) {
    // Atualiza flags de produto
    const slug = existente.slug ?? await gerarSlugUnico(nome);
    await supabaseAdmin.from("mentoradas")
      .update({ ...flags, slug })
      .eq("id", existente.id);

    // Gera magic link apontando para /acesso (que processa o token e redireciona para definir-senha)
    const redirectTo = `${PORTAL_URL}/acesso`;
    const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: emailNorm,
      options: { redirectTo },
    });

    const linkAcesso = (linkData as { properties?: { action_link?: string } })?.properties?.action_link ?? redirectTo;

    return {
      ok: true,
      mensagem: `Acessos atualizados para ${existente.nome}. Use o link abaixo para enviar à aluna.`,
      conviteEnviado: false,
      linkAcesso,
      slug,
    };
  }

  // 2. Usuária nova — gera slug único
  const slug = await gerarSlugUnico(nome);
  // redirectTo aponta para /acesso que já processa o token (PKCE ou hash) e redireciona para definir-senha
  const redirectTo = `${PORTAL_URL}/acesso`;

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    emailNorm,
    { data: { nome, tipo: "mentorada" }, redirectTo }
  );

  if (authError) {
    // Auth já existe mas não tem mentorada — cria o registro
    const { data: perfil } = await supabaseAdmin
      .from("perfis").select("id").eq("email", emailNorm).maybeSingle();

    if (perfil) {
      await supabaseAdmin.from("mentoradas").upsert({
        id: perfil.id, nome, email: emailNorm, ...flags, convite_enviado: true, slug,
      });
      await supabaseAdmin.from("perfis").upsert({ id: perfil.id, tipo: "mentorada", nome, email: emailNorm });

      // Gera magic link real (com token) para o admin copiar e enviar à aluna
      const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink", email: emailNorm, options: { redirectTo },
      });
      const linkAcesso = (linkData as { properties?: { action_link?: string } })?.properties?.action_link ?? redirectTo;

      return { ok: true, mensagem: "Acesso criado. Use o link abaixo para enviar à aluna.", conviteEnviado: false, linkAcesso, slug };
    }

    return { ok: false, mensagem: `Erro ao criar acesso: ${authError.message}`, conviteEnviado: false };
  }

  const userId = authData?.user?.id;
  if (!userId) return { ok: false, mensagem: "Usuário criado mas ID não retornado.", conviteEnviado: false };

  await supabaseAdmin.from("mentoradas").upsert({
    id: userId, nome, email: emailNorm, ...flags, convite_enviado: true, slug,
  });
  await supabaseAdmin.from("perfis").upsert({
    id: userId, tipo: "mentorada", nome, email: emailNorm,
  });

  // Gera magic link real (com token) para o admin copiar — o email de convite já foi enviado
  const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink", email: emailNorm, options: { redirectTo },
  });
  const linkAcesso = (linkData as { properties?: { action_link?: string } })?.properties?.action_link ?? redirectTo;

  return {
    ok: true,
    mensagem: `Convite enviado para ${email}.`,
    conviteEnviado: true,
    linkAcesso,  // Agora é o link real com token, não só a URL do portal
    slug,
  };
}
