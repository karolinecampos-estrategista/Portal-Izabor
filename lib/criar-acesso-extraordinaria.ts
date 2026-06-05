import { supabaseAdmin } from "./supabase-admin";

export type ProdutoAcesso = "seja_incomum" | "club_bw" | "box_livro" | "evento";

const PORTAL_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://projeto-iza-nine.vercel.app";

/**
 * Cria ou atualiza o acesso da Extraordinária quando ela é cadastrada em
 * qualquer produto. Se o e-mail já existe na tabela mentoradas, apenas
 * atualiza o flag do produto. Se não existe, envia convite via Supabase Auth
 * e cria o registro na tabela mentoradas.
 *
 * Não bloqueia o cadastro do comprador se falhar — é best-effort.
 */
export async function criarAcessoExtraordinaria(
  email: string | null | undefined,
  nome: string,
  produto: ProdutoAcesso
): Promise<{ ok: boolean; mensagem: string }> {
  if (!email?.trim()) {
    return { ok: false, mensagem: "Sem e-mail — acesso não criado." };
  }

  const campo = `acesso_${produto}` as const;

  // 1. Verifica se já existe mentorada com esse email
  const { data: existente } = await supabaseAdmin
    .from("mentoradas")
    .select("id, nome, convite_enviado")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  if (existente) {
    // Já existe — só atualiza o flag do produto
    await supabaseAdmin
      .from("mentoradas")
      .update({ [campo]: true })
      .eq("id", existente.id);
    return { ok: true, mensagem: `Acesso ${produto} liberado para ${existente.nome}.` };
  }

  // 2. Não existe — cria via convite Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    email.trim().toLowerCase(),
    {
      data: { nome, tipo: "mentorada" },
      redirectTo: `${PORTAL_URL}/acesso`,
    }
  );

  if (authError) {
    // Usuário já existe no Auth mas não tem mentoradas — tenta buscar pelo perfil
    const { data: perfil } = await supabaseAdmin
      .from("perfis")
      .select("id")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();

    if (perfil) {
      // Cria o registro de mentorada linkado ao usuário existente
      await supabaseAdmin.from("mentoradas").upsert({
        id: perfil.id,
        nome,
        email: email.trim().toLowerCase(),
        [campo]: true,
        convite_enviado: true,
      });
      return { ok: true, mensagem: `Acesso criado via perfil existente.` };
    }

    return { ok: false, mensagem: `Erro ao criar acesso: ${authError.message}` };
  }

  const userId = authData?.user?.id;
  if (!userId) return { ok: false, mensagem: "Usuário criado mas ID não retornado." };

  // 3. Cria registro de mentorada com o acesso do produto
  await supabaseAdmin.from("mentoradas").upsert({
    id: userId,
    nome,
    email: email.trim().toLowerCase(),
    [campo]: true,
    convite_enviado: true,
  });

  // 4. Garante perfil como mentorada
  await supabaseAdmin.from("perfis").upsert({
    id: userId,
    tipo: "mentorada",
    nome,
    email: email.trim().toLowerCase(),
  });

  return { ok: true, mensagem: `Convite enviado para ${email} com acesso ${produto}.` };
}
