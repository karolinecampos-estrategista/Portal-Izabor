import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Lê .env.local manualmente
const envPath = resolve(__dirname, "../.env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf-8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.split("=")[0].trim(), l.split("=").slice(1).join("=").trim()])
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const ADMIN_ID = "2e89ebd4-7741-4713-9041-e34f114264e1";
const NOVA_SENHA = "IzaBW@2025!";

const { error } = await supabase.auth.admin.updateUserById(ADMIN_ID, {
  password: NOVA_SENHA,
});

if (error) {
  console.error("❌ Erro:", error.message);
} else {
  console.log("✅ Senha redefinida com sucesso!");
  console.log("   E-mail: izaborcruzprojetos@gmail.com");
  console.log("   Senha:  IzaBW@2025!");
}
