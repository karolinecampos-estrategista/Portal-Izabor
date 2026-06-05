# Ordem de Execução — Portal Izabor Cruz
### Projeto: portal-izabor | Última atualização: 04/06/2026

> **Leia antes de começar:** Este documento é a continuação de um trabalho já em andamento.
> O sistema está em produção em https://projeto-iza.vercel.app
> Antes de qualquer sessão, leia também o `PROJETO-IZA.md` para entender a arquitetura completa.

---

## O que já está pronto (não mexer)

| O que | Status |
|---|---|
| Login admin (Izabor) | ✅ funcionando |
| Cadastro de mentoradas + convite por e-mail | ✅ funcionando |
| Página de Sessões conectada ao banco | ✅ funcionando |
| Página de Check-in admin conectada ao banco | ✅ funcionando |
| Página de Devocionais conectada ao banco | ✅ funcionando |
| Página de Aulas BW conectada ao banco | ✅ funcionando |
| Supabase: tabelas + RLS + Auth configurados | ✅ funcionando |
| Deploy automático no Vercel | ✅ funcionando |

---

## ETAPA 1 — Migration pendente (fazer PRIMEIRO, antes de tudo)

> Tempo estimado: 5 minutos

1. Acesse: supabase.com → projeto `portal-izabor` → **SQL Editor**
2. Cole e execute:

```sql
ALTER TABLE devocionais ADD COLUMN IF NOT EXISTS versiculo TEXT;
ALTER TABLE devocionais ADD COLUMN IF NOT EXISTS categoria TEXT DEFAULT 'Fe';
ALTER TABLE devocionais ADD COLUMN IF NOT EXISTS destaque BOOLEAN DEFAULT FALSE;
```

3. Confirme que rodou sem erro → pronto.

---

## ETAPA 2 — Conectar seções restantes ao banco

> Tempo estimado: 3–4 horas
> Padrão a seguir: igual ao que já foi feito em `app/api/sessoes/route.ts` e `app/sessoes/page.tsx`

Para cada seção abaixo, criar:
- `app/api/[nome]/route.ts` — GET, POST, PATCH (e DELETE quando precisar)
- Atualizar a página admin com `useEffect` + fetch real
- Substituir mock data por estado vazio + spinner de carregamento

### 2.1 Desafios

**Tabela:** `desafios`
**Colunas:** `id, titulo, descricao, pilar, prazo (DATE), destino, mentorada_nome, criado_em`

**API a criar:** `app/api/desafios/route.ts`
- `GET` → lista todos
- `POST` → cria novo
- `DELETE ?id=` → exclui

**Página admin:** `app/desafios/page.tsx`
- Carregar lista do banco
- Formulário de criação → POST
- Botão excluir → DELETE

**Portal mentorada:** `app/mentorada/desafios/page.tsx` (se existir)
- GET filtrado: `destino = 'todas-bw'` OU `mentorada_nome = [nome da mentorada logada]`

---

### 2.2 Tarefas

**Tabela:** `tarefas`
**Colunas:** `id, titulo, descricao, status, prioridade, pilar, mentorada_nome, data_entrega, criado_em`

**API a criar:** `app/api/tarefas/route.ts`
- `GET` → lista todas (admin) ou filtradas por mentorada_nome (mentorada)
- `POST` → cria nova
- `PATCH` → atualiza status (Pendente / Em andamento / Concluída)

**Página admin:** `app/tarefas-mentoradas/page.tsx`
- Carregar lista do banco
- Formulário de criação com seleção de mentorada (dropdown de `/api/mentoradas`)
- Toggle de status

**Portal mentorada:** `app/mentorada/tarefas/page.tsx`
- GET filtrando pelo nome da mentorada logada
- Toggle de status próprio (a mentorada marca como concluída)

---

### 2.3 Planos de Ação

**Tabelas:** `planos` + `marcos` (são duas tabelas ligadas)
**Colunas planos:** `id, mentorada_id, mentorada_nome, cor, programa, criado_em`
**Colunas marcos:** `id, plano_id, texto, feito (boolean), semana, ordem`

**API a criar:** `app/api/planos/route.ts`
- `GET` → lista planos com marcos aninhados (usar `.select('*, marcos(*)')`)
- `POST` → cria plano + insere marcos na tabela `marcos`
- `PATCH` → toggle `feito` de um marco específico (recebe `marco_id` + `feito`)

**Página admin:** `app/planos/page.tsx`
- Carregar lista do banco com marcos
- Formulário de criação: seleciona mentorada + adiciona marcos
- Toggle de cada marco como concluído/pendente

**Portal mentorada:** `app/mentorada/plano/page.tsx`
- GET do plano da mentorada logada
- A mentorada pode marcar marcos como feitos

---

### 2.4 Diagnósticos

**Tabela:** `diagnosticos`
**Colunas:** `id, user_id, nome, email, programa, perfil, cor, foco (TEXT[]), respostas (JSONB), criado_em`

**API a criar:** `app/api/diagnosticos/route.ts`
- `GET` → lista todos (admin)
- `POST` → salva diagnóstico (chamado quando mentorada conclui o quiz)

**Página admin:** `app/diagnosticos/page.tsx`
- Carregar lista do banco

**Portal mentorada:** `app/mentorada/diagnostico/page.tsx`
- IMPORTANTE: hoje usa `localStorage` → migrar para POST na API ao finalizar o quiz
- Buscar `user_id` da sessão atual para salvar junto
- Remover todo uso de `localStorage` nessa página

---

## ETAPA 3 — Portal da Mentorada com dados reais

> Tempo estimado: 2–3 horas
> Cada página do portal mentorada precisa saber QUEM está logada para filtrar os dados.

### Como pegar o user_id da mentorada logada

```typescript
import { supabase } from "@/lib/supabase"; // cliente público

const { data: { session } } = await supabase.auth.getSession();
const userId = session?.user?.id;

// Buscar os dados da mentorada
const { data: mentorada } = await supabase
  .from("mentoradas")
  .select("*")
  .eq("user_id", userId)
  .single();
```

### Páginas a atualizar (em ordem de prioridade)

| Página | O que fazer |
|---|---|
| `app/mentorada/checkin/page.tsx` | Ao submeter → POST `/api/checkins` com user_id + mentorada_id |
| `app/mentorada/diagnostico/page.tsx` | Ao finalizar quiz → POST `/api/diagnosticos` (remover localStorage) |
| `app/mentorada/devocional/page.tsx` | GET `/api/devocionais` filtrado: publicado=true e destino compatível |
| `app/mentorada/aulas/page.tsx` | GET `/api/aulas` filtrado: status='publicada' |
| `app/mentorada/tarefas/page.tsx` | GET `/api/tarefas` filtrado por mentorada_nome |
| `app/mentorada/plano/page.tsx` | GET `/api/planos` filtrado por mentorada_id |
| `app/mentorada/sessoes/page.tsx` (se existir) | GET `/api/sessoes` filtrado por mentorada_id |

### Dashboard da mentorada (página inicial `/mentorada`)
Atualizar os cards de resumo com dados reais:
- Próxima sessão → busca sessão com status='agendada' mais próxima
- Devocional do dia → busca devocional publicado mais recente
- Desafio da semana → busca desafio mais recente destinado a ela

---

## ETAPA 4 — Segurança dos dados

> Tempo estimado: 1 hora
> Verificar e reforçar tudo

### 4.1 Verificar RLS (Row Level Security) no Supabase

No Supabase → Authentication → Policies, confirmar que todas as tabelas têm políticas:

| Tabela | Admin | Mentorada |
|---|---|---|
| mentoradas | TUDO | Só vê próprio cadastro |
| sessoes | TUDO | Só vê suas sessões |
| check_ins | SELECT (ver todas) | ALL (gerencia próprios) |
| diagnosticos | SELECT (ver todas) | ALL (gerencia próprio) |
| planos | TUDO | SELECT (vê próprio) |
| marcos | TUDO | SELECT (vê próprios) |
| devocionais | TUDO | SELECT (só publicados) |
| aulas_bw | TUDO | SELECT (só publicadas) |
| desafios | TUDO | SELECT (destinados a ela) |
| tarefas | TUDO | SELECT (destinadas a ela) |

> **O schema completo está em `supabase-schema.sql`** — já inclui todas as policies. Conferir se alguma ficou faltando.

### 4.2 Variáveis de ambiente (nunca expor as chaves no código)

Verificar no Vercel (Settings → Environment Variables) que estão configuradas:

```
NEXT_PUBLIC_SUPABASE_URL        ✅ já configurado
NEXT_PUBLIC_SUPABASE_ANON_KEY   ✅ já configurado
SUPABASE_SERVICE_ROLE_KEY       ✅ já configurado (usada só no servidor)
NEXT_PUBLIC_SITE_URL            ⏳ adicionar: https://projeto-iza.vercel.app
RESEND_API_KEY                  ⏳ adicionar quando implementar e-mail personalizado
```

Para adicionar:
```bash
npx vercel env add NEXT_PUBLIC_SITE_URL production --scope izabor-cruz-projetos-projects
# Valor: https://projeto-iza.vercel.app
```

### 4.3 Confirmar que a service role key SÓ é usada no servidor

- `lib/supabase-admin.ts` usa `SUPABASE_SERVICE_ROLE_KEY` → só é chamado em `app/api/*/route.ts`
- `lib/supabase.ts` usa `NEXT_PUBLIC_SUPABASE_ANON_KEY` → usado no frontend
- **NUNCA** importar `supabase-admin` em um componente client (`"use client"`)

### 4.4 Proteção de rotas

Verificar que `components/LayoutShell.tsx` está protegendo todas as rotas:
- Se não tiver sessão → redireciona para `/login`
- Se for mentorada tentando acessar rota de admin → redireciona para `/mentorada`
- Se for admin tentando acessar rota de mentorada → deixa passar (admin pode ver tudo)

---

## ETAPA 5 — Backup do código (GitHub)

> Tempo estimado: 15 minutos
> Essencial para não perder o código se algo der errado

```bash
cd /Users/karolinecampos/Downloads/Claude/projeto-iza

# Inicializar git
git init
git add .
git commit -m "Portal Izabor Cruz — versão inicial com Supabase conectado"

# Criar repositório PRIVADO no GitHub (github.com/new)
# Nome sugerido: portal-izabor
# Marcar como PRIVADO

# Conectar e fazer push
git remote add origin https://github.com/[usuario]/portal-izabor.git
git branch -M main
git push -u origin main
```

**Arquivo `.gitignore`** — garantir que existe e contém:
```
.env.local
node_modules/
.next/
```

---

## ETAPA 6 — Backup do banco (Supabase)

> O plano gratuito do Supabase não tem backup automático com recuperação de ponto no tempo.

### Opção A — Backup manual (agora, grátis)
1. Supabase → SQL Editor → rodar:
```sql
-- Exportar dados das tabelas principais
SELECT * FROM mentoradas;
SELECT * FROM sessoes;
SELECT * FROM check_ins;
SELECT * FROM devocionais;
SELECT * FROM aulas_bw;
```
2. Copiar o resultado e guardar em planilha ou documento seguro
3. O schema completo já está em `supabase-schema.sql` — se o banco for deletado, esse arquivo recria tudo

### Opção B — Upgrade Supabase Pro (quando tiver clientes reais)
- Supabase Pro: $25/mês
- Backups diários automáticos
- Point-in-time recovery (recupera banco para qualquer momento)
- **Recomendado assim que a Izabor começar a usar de verdade**

---

## ETAPA 7 — Testes antes de entregar

> Fazer tudo isso antes de passar para a Izabor

### Teste de admin (logar como Izabor)
- [ ] Login com `izaborcruzprojetos@gmail.com` + senha da Izabor
- [ ] Cadastrar uma mentorada de teste com e-mail real → confirmar que recebeu convite
- [ ] Criar uma sessão vinculada a essa mentorada → verificar que aparece na lista
- [ ] Criar um devocional → publicar → verificar que fica visível
- [ ] Criar uma aula → publicar → verificar que fica visível
- [ ] Criar um check-in manualmente via SQL e verificar que aparece na tela

### Teste de mentorada (logar como mentorada de teste)
- [ ] Clicar no link do e-mail de convite → criar senha
- [ ] Logar → confirmar que vai para `/mentorada` e não para `/`
- [ ] Verificar que NÃO consegue acessar `/sessoes`, `/mentorandas`, etc.
- [ ] Preencher check-in → confirmar que aparece no painel admin
- [ ] Fazer diagnóstico → confirmar que salva no banco
- [ ] Ver devocional publicado pelo admin
- [ ] Ver aula publicada pelo admin

### Teste de segurança
- [ ] Tentar acessar `/api/mentoradas` diretamente no navegador → deve retornar erro ou lista vazia
- [ ] Verificar que URLs de API não expõem dados sem autenticação
- [ ] Tentar fazer fetch de `/api/mentoradas` logado como mentorada → não deve retornar dados de outras mentoradas

---

## ETAPA 8 — E-mail personalizado com logo da Izabor (opcional, mas recomendado)

> Hoje o e-mail de convite é o padrão do Supabase (sem logo, sem personalização)

1. Criar conta em resend.com com o e-mail da Izabor
2. Verificar domínio (se tiver domínio próprio) ou usar o domínio do Resend
3. Adicionar a chave no Vercel:
```bash
npx vercel env add RESEND_API_KEY production --scope izabor-cruz-projetos-projects
```
4. Criar `app/api/email/route.ts` com template personalizado:
   - E-mail de boas-vindas (com logo Izabor + link de acesso)
   - E-mail de senha criada
   - Notificação de nova sessão agendada

---

## ETAPA 9 — Entrega para a Izabor

Quando tudo estiver testado:

1. **Enviar as credenciais de acesso:**
   - URL: https://projeto-iza-nine.vercel.app
   - Login admin: `izaborcruzprojetos@gmail.com`
   - Senha: a senha definida (orientar a trocar após o primeiro acesso)

2. **Gravar um vídeo rápido** mostrando como:
   - Cadastrar uma nova mentorada
   - Registrar uma sessão
   - Criar e publicar um devocional
   - Criar e publicar uma aula

3. **Guardar as credenciais do Supabase em lugar seguro** (não apenas aqui):
   - Supabase URL: `https://hsutkpgtlhlvhugvtmelk.supabase.co`
   - Anon key + Service role key (estão no `PROJETO-IZA.md`)

---

## Resumo da ordem de execução

```
[DIA 1]
  ETAPA 1 — Migration SQL devocionais (5 min)
  ETAPA 2.1 — Desafios (API + página)
  ETAPA 2.2 — Tarefas (API + página)

[DIA 2]
  ETAPA 2.3 — Planos de Ação (API + página — a mais complexa)
  ETAPA 2.4 — Diagnósticos (API + migrar localStorage)

[DIA 3]
  ETAPA 3 — Portal da mentorada com dados reais
  ETAPA 4 — Segurança (verificar RLS + env vars)

[DIA 4]
  ETAPA 5 — GitHub (backup do código)
  ETAPA 6 — Backup do banco
  ETAPA 7 — Testes completos
  ETAPA 8 — E-mail personalizado (se tiver tempo)

[DIA 5]
  ETAPA 9 — Entrega para a Izabor
```

---

## Como retomar o trabalho em qualquer chat

Cole isso no início de qualquer sessão nova:

> "Estou trabalhando no portal da Izabor Cruz. O projeto está em `/Users/karolinecampos/Downloads/Claude/projeto-iza`. Leia o arquivo `PROJETO-IZA.md` e o `PARA-O-FELIPE.md` na raiz do projeto para entender tudo que já foi feito e o que fazer a seguir."

---

*Dúvidas ou problemas: verificar sempre o `PROJETO-IZA.md` primeiro — ele tem arquitetura, credenciais e contexto completo.*
