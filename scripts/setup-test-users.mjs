import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  "https://hsukpgtlhlvhugvtmelk.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdWtwZ3RsaGx2aHVndnRtZWxrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU4NDUzNCwiZXhwIjoyMDk2MTYwNTM0fQ.EDN2Hvdrkqri4me-R5fkPSpqXTw30IPrLoPg3uMHL6g"
);

const TEST_PASSWORD = "Teste@12345";

const TEST_USERS = [
  {
    email: "test.si@izabor.test",
    nome: "Ana Teste SI",
    acesso_seja_incomum: true,
    acesso_club_bw: false,
    acesso_box_livro: false,
    acesso_evento: false,
    slug: "test-si",
  },
  {
    email: "test.bw@izabor.test",
    nome: "Beatriz Teste BW",
    acesso_seja_incomum: false,
    acesso_club_bw: true,
    acesso_box_livro: false,
    acesso_evento: false,
    slug: "test-bw",
  },
  {
    email: "test.sibw@izabor.test",
    nome: "Carla Teste SI+BW",
    acesso_seja_incomum: true,
    acesso_club_bw: true,
    acesso_box_livro: false,
    acesso_evento: false,
    slug: "test-sibw",
  },
  {
    email: "test.livro@izabor.test",
    nome: "Diana Teste Livro",
    acesso_seja_incomum: false,
    acesso_club_bw: false,
    acesso_box_livro: true,
    acesso_evento: false,
    slug: "test-livro",
  },
];

async function createOrUpdateUser(u) {
  // Verifica se já existe no Auth
  const { data: existingList } = await supabaseAdmin.auth.admin.listUsers();
  const existing = existingList?.users?.find((x) => x.email === u.email);

  let userId;

  if (existing) {
    console.log(`  → Já existe: ${u.email} (${existing.id})`);
    // Atualiza a senha para garantir que é conhecida
    await supabaseAdmin.auth.admin.updateUserById(existing.id, {
      password: TEST_PASSWORD,
      email_confirm: true,
    });
    userId = existing.id;
  } else {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: u.email,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { nome: u.nome, tipo: "mentorada" },
    });
    if (error) {
      console.error(`  ✗ Erro ao criar ${u.email}:`, error.message);
      return null;
    }
    userId = data.user.id;
    console.log(`  ✓ Criado: ${u.email} (${userId})`);
  }

  // Upsert em mentoradas
  const { error: mErr } = await supabaseAdmin.from("mentoradas").upsert({
    id: userId,
    nome: u.nome,
    email: u.email,
    acesso_seja_incomum: u.acesso_seja_incomum,
    acesso_club_bw: u.acesso_club_bw,
    acesso_box_livro: u.acesso_box_livro,
    acesso_evento: u.acesso_evento,
    convite_enviado: true,
    slug: u.slug,
  });
  if (mErr) console.error(`  ✗ Erro em mentoradas:`, mErr.message);

  // Upsert em perfis
  const { error: pErr } = await supabaseAdmin.from("perfis").upsert({
    id: userId,
    tipo: "mentorada",
    nome: u.nome,
    email: u.email,
  });
  if (pErr) console.error(`  ✗ Erro em perfis:`, pErr.message);

  return userId;
}

async function cleanup() {
  console.log("\n🧹 Removendo usuários de teste...");
  for (const u of TEST_USERS) {
    const { data: list } = await supabaseAdmin.auth.admin.listUsers();
    const user = list?.users?.find((x) => x.email === u.email);
    if (user) {
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      await supabaseAdmin.from("mentoradas").delete().eq("id", user.id);
      await supabaseAdmin.from("perfis").delete().eq("id", user.id);
      console.log(`  ✓ Removido: ${u.email}`);
    }
  }
}

const cmd = process.argv[2];

if (cmd === "cleanup") {
  await cleanup();
} else {
  console.log("🚀 Criando usuários de teste...\n");
  for (const u of TEST_USERS) {
    console.log(`Processando: ${u.nome}`);
    await createOrUpdateUser(u);
  }
  console.log("\n✅ Concluído! Credenciais de teste:");
  console.log("──────────────────────────────────────────────────────");
  for (const u of TEST_USERS) {
    const acessos = Object.entries({
      SI: u.acesso_seja_incomum,
      BW: u.acesso_club_bw,
      Livro: u.acesso_box_livro,
      Evento: u.acesso_evento,
    }).filter(([, v]) => v).map(([k]) => k).join("+") || "nenhum";
    console.log(`  ${u.email}  |  Senha: ${TEST_PASSWORD}  |  Acesso: ${acessos}`);
  }
  console.log("──────────────────────────────────────────────────────");
}
