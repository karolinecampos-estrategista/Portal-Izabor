import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  "https://hsutkpgtlhlvhugvtmelk.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdWtwZ3RsaGx2aHVndnRtZWxrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU4NDUzNCwiZXhwIjoyMDk2MTYwNTM0fQ.EDN2Hvdrkqri4me-R5fkPSpqXTw30IPrLoPg3uMHL6g",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Cria o usuário admin
const { data, error } = await supabaseAdmin.auth.admin.createUser({
  email: "izaborcruzprojetos@gmail.com",
  password: "IzaBW@2025!",
  email_confirm: true,
  user_metadata: { tipo: "admin", nome: "Izabor Cruz" },
});

if (error) {
  console.error("❌ Erro ao criar usuário:", error.message);
  process.exit(1);
}

console.log("✅ Usuário criado:", data.user.id);

// Garante que o perfil admin está correto
const { error: perfil } = await supabaseAdmin
  .from("perfis")
  .upsert({
    id: data.user.id,
    tipo: "admin",
    nome: "Izabor Cruz",
    email: "izaborcruzprojetos@gmail.com",
  });

if (perfil) {
  console.error("❌ Erro ao salvar perfil:", perfil.message);
} else {
  console.log("✅ Perfil admin configurado!");
  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Login admin criado com sucesso!");
  console.log("E-mail:  izaborcruzprojetos@gmail.com");
  console.log("Senha:   IzaBW@2025!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}
