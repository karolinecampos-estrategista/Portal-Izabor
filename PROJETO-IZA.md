# Portal Izabor Cruz — Documentação Completa

> **LEIA ESTE ARQUIVO ANTES DE QUALQUER SESSÃO.** Ele contém o estado atual, o que já foi feito e exatamente o que fazer a seguir.

---

## 1. Informações do Projeto

| Campo | Valor |
|---|---|
| **Cliente** | Izabor Cruz — Mentora de Mulheres INCOMUNS |
| **Stack** | Next.js 16 · TypeScript · Tailwind · Supabase · Vercel |
| **URL produção** | https://projeto-iza-nine.vercel.app |
| **Diretório local** | `/Users/karolinecampos/Downloads/Claude/projeto-iza` |
| **Vercel scope** | `izabor-cruz-projetos-projects` |
| **Supabase URL** | `https://hsukpgtlhlvhugvtmelk.supabase.co` |
| **GitHub** | https://github.com/karolinecampos-estrategista/Portal-Izabor |

### ⚠️ CONTAS SEPARADAS — NUNCA MISTURAR COM AS CONTAS DA KAROLINE

> Tudo deste projeto sobe na conta da **Izabor Cruz**, não na conta pessoal da Karoline Campos.

| Serviço | Conta | Login |
|---|---|---|
| **Vercel** | Conta da Izabor (`izabor-cruz-projetos-projects`) | izaborcruzprojetos@gmail.com |
| **Supabase** | Projeto `portal-izabor` na conta da Izabor | izaborcruzprojetos@gmail.com |
| **GitHub** | Repositório na conta da Izabor | https://github.com/karolinecampos-estrategista/Portal-Izabor |

### Credenciais
- **Admin portal:** izaborcruzprojetos@gmail.com / IzaBW@2025!
- **Supabase dashboard:** izaborcruzprojetos@gmail.com / IzaProjetos2026 (**senha DIFERENTE do portal**)
- **Env vars (.env.local):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

### Deploy — SEMPRE usar o scope da Izabor
```bash
cd /Users/karolinecampos/Downloads/Claude/projeto-iza
npx vercel --prod --yes --scope izabor-cruz-projetos-projects
```
> Se rodar sem `--scope izabor-cruz-projetos-projects` pode subir na conta errada (Karoline). Sempre confirmar.

---

## 2. Estado Atual — Atualizado em 05/06/2026

### ✅ Sidebar Admin — Estrutura final

**Seção Produtos**
- SI · Cadastro → `/seja-incomum`
- SI · Aulas → `/aulas-bw`
- Livro · Compradores → `/box-livro`
- Livro · Conteúdo → `/box-livro/conteudo`
- Eventos · Cadastro → `/eventos` ← compradores de INGRESSO (não gestão de eventos)

**Seção Club BW**
- Cadastro → `/club-bw` ← PRIMEIRO item
- Dashboard → `/dashboard-mentorandas`
- Diagnósticos → `/diagnosticos`
- Check-in Semanal → `/checkin`
- Sessões → `/sessoes`
- Planos de Ação → `/planos`
- Devocionais → `/devocionais`
- Desafios → `/desafios`
- Tarefas → `/tarefas-mentoradas`
- Depoimentos → `/depoimentos-admin`
- Chat → `/chat-admin`

**Seção Conta**
- Acessos · Extraordinárias → `/usuarios`
- Configurações → `/configuracoes`

### ✅ Terminologia por produto — IMPORTANTE

| Produto | Participantes chamam-se |
|---|---|
| Seja Incomum (SI) | **Alunas** |
| Club BW | **Mentoradas** |

### ✅ Status por produto

| Produto | Status aceitos |
|---|---|
| SI | ativo / pendente / inativo |
| Club BW | **ativo / encerrado / cancelado** (NÃO usar pendente/inativo) |
| Box Livro | ativo / pendente / cancelado |
| Eventos | confirmado / pendente / cancelado |

---

## 3. Sistema de Acesso das Extraordinárias (implementado 04/06/2026)

### Como funciona
Ao cadastrar compradora em qualquer seção → sistema automaticamente:
1. Cria usuária no Supabase Auth via `inviteUserByEmail` → envia e-mail de convite
2. Cria registro em `mentoradas` com **apenas** o produto adquirido liberado (boolean = true)
3. Admin pode liberar/revogar outros produtos individualmente via painel ProdutosAcesso

### Arquivos do sistema
- `lib/criar-acesso-extraordinaria.ts` — função central (email, nome, produto) → cria/atualiza acesso
- `app/api/acesso-extraordinaria/route.ts` — GET ?email= / PATCH (toggle acesso) / POST (reenviar convite)
- `components/ProdutosAcesso.tsx` — painel admin com 4 produtos, status, link e botões
  - Prop `defaultProduto?: "seja_incomum" | "club_bw" | "box_livro" | "evento"`

### Página /usuarios — Gestão de Acessos
- `app/usuarios/page.tsx` — lista todas as extraordinárias, bloquear/liberar, reset de senha
- `app/api/usuarios-admin/route.ts` — usa `supabaseAdmin.auth.admin.listUsers()` + join perfis + mentoradas
- Ações disponíveis: `bloquear` (ban 876000h) / `desbloquear` / `atualizar_acesso` / `resetar_senha`

### Bug corrigido: perfil/route.ts
O arquivo `app/api/perfil/route.ts` foi corrigido para suportar DOIS sistemas de acesso (legado user_id + novo id):
```typescript
// query com .or() para pegar registro pelo user_id OU id
const { data: m } = await supabaseAdmin
  .from("mentoradas")
  .select("acesso, mostrar_financeiro, produtos_ativos, acesso_seja_incomum, acesso_club_bw, acesso_box_livro, acesso_evento")
  .or(`user_id.eq.${user.id},id.eq.${user.id}`)
  .maybeSingle();

// mescla sistema legado (produtos_ativos JSON) + novo (colunas booleanas)
const produtosAtivos = {
  ...(m?.produtos_ativos ?? {}),
  ...(m?.acesso_seja_incomum ? { seja_incomum: true } : {}),
  ...(m?.acesso_club_bw      ? { club_bw: true }      : {}),
  ...(m?.acesso_box_livro    ? { box_livro: true }    : {}),
  ...(m?.acesso_evento       ? { evento: true }       : {}),
};
```

---

## 4. Banco de Dados — Tabelas

| Tabela | Finalidade |
|---|---|
| `perfis` | id, nome, tipo (admin/mentorada), email |
| `mentoradas` | Acesso portal + flags de produtos |
| `seja_incomum_compradores` | Alunas do Seja Incomum |
| `club_bw_compradores` | Mentoradas do Club BW (status: ativo/encerrado/cancelado) |
| `box_livro_compradores` | Compradores do Box Livro (inclui campo email) |
| `evento_ingressos` | Compradores de ingresso do evento |
| `aulas_bw` | Aulas por módulo |
| `devocionais` | Mensagens publicáveis |
| `desafios` | Desafios enviáveis |
| `tarefas` | Tarefas das mentoradas |
| `check_ins` | Check-ins semanais das mentoradas |
| `diagnosticos` | Quiz emocional/espiritual |
| `sessoes` | Histórico de sessões |
| `planos` + `marcos` | Planos de ação e metas |

### Colunas de acesso em `mentoradas`
- `acesso_seja_incomum` BOOLEAN DEFAULT false
- `acesso_club_bw` BOOLEAN DEFAULT false
- `acesso_box_livro` BOOLEAN DEFAULT false
- `acesso_evento` BOOLEAN DEFAULT false
- `convite_enviado` BOOLEAN DEFAULT false

---

## 5. Migrations — Estado

| Arquivo | Status |
|---|---|
| `supabase-schema.sql` | ✅ base do banco |
| `supabase-migration-produtos.sql` | ✅ executado — cria seja_incomum_compradores, evento_compradores, box_livro_compradores |
| `supabase-migration-acesso-produtos.sql` | ✅ executado — adiciona 5 colunas booleanas a mentoradas |
| `supabase-migration-devocionais.sql` | ✅ executado |
| `supabase-migration-tarefas.sql` | ✅ executado |
| `supabase-migration-eventos.sql` | ⚠️ **PENDENTE** — rodar no Supabase > SQL Editor |

### Conteúdo do migration pendente (`supabase-migration-eventos.sql`)
Cria 4 coisas:
1. Tabela `eventos` (gestão de eventos — reservada para futuro)
2. Campo `email` em `box_livro_compradores`
3. Tabela `club_bw_compradores` (status: ativo/encerrado/cancelado)
4. Tabela `evento_ingressos` (tipo: normal/vip/cortesia; status: confirmado/pendente/cancelado)

---

## 6. Páginas — APIs e Funcionalidades

### Admin

| Página | Rota | API | Tabela | Status |
|---|---|---|---|---|
| SI · Cadastro | `/seja-incomum` | `/api/seja-incomum` | `seja_incomum_compradores` | ✅ |
| SI · Aulas | `/aulas-bw` | `/api/aulas` | `aulas_bw` | ✅ |
| Livro · Compradores | `/box-livro` | `/api/box-livro` | `box_livro_compradores` | ✅ |
| Livro · Conteúdo | `/box-livro/conteudo` | — | — | ✅ |
| Eventos · Ingressos | `/eventos` | `/api/evento-ingressos` | `evento_ingressos` | ✅ |
| Club BW · Cadastro | `/club-bw` | `/api/club-bw` | `club_bw_compradores` | ✅ |
| Dashboard mentoradas | `/dashboard-mentorandas` | `/api/mentoradas` | `mentoradas` | ✅ |
| Diagnósticos | `/diagnosticos` | `/api/diagnosticos` | `diagnosticos` | ✅ |
| Check-in | `/checkin` | `/api/checkins` | `check_ins` | ✅ |
| Sessões | `/sessoes` | `/api/sessoes` | `sessoes` | ✅ |
| Planos | `/planos` | `/api/planos` | `planos` | ✅ |
| Devocionais | `/devocionais` | `/api/devocionais` | `devocionais` | ✅ |
| Desafios | `/desafios` | `/api/desafios` | `desafios` | ✅ |
| Tarefas admin | `/tarefas-mentoradas` | `/api/tarefas` | `tarefas` | ✅ |
| Gestão de acessos | `/usuarios` | `/api/usuarios-admin` | Auth + perfis + mentoradas | ✅ |

### Portal da Mentorada

| Página | Rota | Status |
|---|---|---|
| Home | `/mentorada` | ✅ |
| Aulas | `/mentorada/aulas` | ✅ (protegida por acesso SI) |
| Devocional | `/mentorada/devocional` | ✅ |
| Box do Livro | `/mentorada/box-livro` | ✅ (protegida por acesso livro) |
| Check-in | `/mentorada/checkin` | ✅ |
| Tarefas | `/mentorada/tarefas` | ✅ |
| Jornada/Desafios | `/mentorada/jornada` | ✅ |
| Diagnóstico | `/mentorada/diagnostico` | ✅ |
| Plano de ação | `/mentorada/plano` | ✅ |
| Depoimentos | `/mentorada/depoimentos` | ✅ |

---

## 7. Componentes Importantes

### `components/ProdutosAcesso.tsx`
Painel admin que aparece no detalhe de cada compradora. Exibe os 4 produtos com botão Liberar/Revogar.
- Usar prop `defaultProduto` ao renderizar em cada seção:
  - SI: `<ProdutosAcesso email={c.email} nome={c.nome} />` (default já é seja_incomum)
  - Club BW: `<ProdutosAcesso email={c.email} nome={c.nome} defaultProduto="club_bw" />`
  - Box Livro: `<ProdutosAcesso email={c.email} nome={c.nome} defaultProduto="box_livro" />`
  - Evento: `<ProdutosAcesso email={c.email} nome={c.nome} defaultProduto="evento" />`

### `components/BloqueadoPorProduto.tsx`
Envolve páginas da mentorada com tela de bloqueio se ela não tem o produto.
- Páginas protegidas: `/mentorada/aulas`, `/mentorada/box-livro`, `/mentorada/devocional`

### `lib/criar-acesso-extraordinaria.ts`
Chamado em todas as APIs de cadastro de compradora. Best-effort: `.catch(() => null)` nunca bloqueia.

---

## 8. Testes Realizados (05/06/2026) — TODOS ✅

| Teste | Resultado |
|---|---|
| Login admin (Izabor) | ✅ |
| Cadastro aluna em SI + criação de conta Extraordinária | ✅ |
| Cadastro mentorada em Club BW + criação de conta | ✅ |
| Cadastro compradora em Box Livro + criação de conta | ✅ |
| Cadastro ingresso em Eventos | ✅ |
| Criar tarefa (admin → mentorada) | ✅ |
| Criar desafio (admin) | ✅ |
| Criar devocional (admin) | ✅ |
| /usuarios — logins visíveis, bloquear/liberar | ✅ |
| Login como extraordinária (Ana — somente SI) | ✅ |
| Aulas SI acessíveis para Ana | ✅ |
| Box do Livro bloqueado para Ana (sem acesso) | ✅ |
| Devocional acessível para Ana | ✅ |
| Tarefas visíveis para Ana | ✅ (2 pendentes) |
| Check-in enviado por Ana | ✅ |
| Jornada/Desafios acessível para Ana | ✅ |

---

## 9. Como Retomar em Novo Chat

Cole no início do novo chat:

> "Estou trabalhando no portal da Izabor Cruz. O projeto está em `/Users/karolinecampos/Downloads/Claude/projeto-iza`. Leia o arquivo `PROJETO-IZA.md` na raiz do projeto para entender tudo que já foi feito e o que fazer a seguir."

---

## 10. Próximos Passos Sugeridos

1. **Rodar migration pendente** — `supabase-migration-eventos.sql` no Supabase > SQL Editor (cria tabelas club_bw_compradores e evento_ingressos)
2. **E-mail personalizado** — Resend para enviar convite com visual da Izabor (logo, QR Code)
3. **Domínio personalizado** — apontar domínio da Izabor para o Vercel
4. **Portal de Eventos completo** — QR Code de ingresso, check-in no evento (scanner), materiais pós-evento

---

## 11. Identidade do Negócio da Izabor

**Programas:** Seja Incomum (Mentoria Individual) · Club BW (6 meses) · Box do Livro · Evento "Simplesmente Seja"
**Pilares:** Fé · Mentalidade · Liderança · Emocional · Família
**Tom:** Acolhedor, espiritual, transformador. Deus e fé como centro.
**IMPORTANTE:** O diagnóstico e check-in são sobre a MULHER, não sobre o negócio. Nunca perguntar sobre faturamento.
**Instagram:** @izaborcruz_ · **YouTube:** @izaborcruz_
