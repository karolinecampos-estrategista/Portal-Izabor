# Portal Izabor Cruz — Documentação Completa

> **LEIA ESTE ARQUIVO ANTES DE QUALQUER SESSÃO.** Ele contém o estado atual, o que já foi feito e exatamente o que fazer a seguir.

---

## 1. Informações do Projeto

| Campo | Valor |
|---|---|
| **Cliente** | Izabor Cruz — Mentora de Mulheres INCOMUNS |
| **Stack** | Next.js 16 · TypeScript · Tailwind · Supabase · Vercel |
| **URL produção** | https://projeto-iza.vercel.app *(conta Izabor)* |
| **Diretório local** | `/Users/karolinecampos/Downloads/Claude/projeto-iza` |
| **Vercel scope** | `izabor-cruz-projetos-projects` |
| **Supabase URL** | `https://hsutkpgtlhlvhugvtmelk.supabase.co` |
| **Supabase projeto** | `portal-izabor` |
| **Design** | Dark theme premium — fundo `#080808`, dourado `#C9A84C` |

### Credenciais de acesso
> ⚠️ Credenciais removidas deste arquivo por segurança. Guardar em local seguro (1Password, Notion privado, etc.)
- **Admin login:** izaborcruzprojetos@gmail.com + senha definida pela Izabor
- **Supabase keys:** encontradas em Supabase Dashboard → Settings → API
- **Variáveis de ambiente:** configuradas no Vercel Dashboard da conta Izabor

### Como fazer deploy
```bash
cd /Users/karolinecampos/Downloads/Claude/projeto-iza
npx vercel --prod --yes --scope izabor-cruz-projetos-projects
```

---

## 2. Estado Atual — O Que Está Pronto

### ✅ Frontend completo (todas as páginas)
Dois portais separados com design dark/gold premium:
- **Admin (Izabor)** em `/` — dashboard, mentoradas, aulas, devocionais, desafios, tarefas, sessões, check-ins, planos, diagnósticos, box do livro, financeiro
- **Mentorada** em `/mentorada/*` — início, agenda, aulas, devocional, check-in, plano, tarefas, jornada, diagnóstico, box do livro, depoimentos, chat, financeiro

### ✅ Backend Supabase — Database
Tabelas criadas e ativas:
- `perfis` — tipo admin/mentorada, vinculado a auth.users
- `mentoradas` — cadastro completo das mentoradas
- `sessoes` — histórico de sessões
- `check_ins` — check-ins semanais
- `diagnosticos` — quiz emocional/espiritual
- `planos` + `marcos` — planos de ação e metas
- `devocionais` — mensagens publicáveis
- `aulas_bw` — aulas por módulo
- `desafios` — desafios enviáveis
- `tarefas` — tarefas das mentoradas

Trigger automático: ao criar usuário no Auth → cria perfil na tabela `perfis`.  
RLS (Row Level Security) ativo em todas as tabelas.

### ✅ Autenticação real
- Login com Supabase Auth (email + senha)
- Verificação de tipo (admin vs mentorada) via tabela `perfis`
- Redirecionamento automático: admin → `/`, mentorada → `/mentorada`
- Logout real em ambas as sidebars
- Loading spinner durante verificação de sessão

### ✅ Mentoradas — API conectada (mock data removido)
- `GET /api/mentoradas` — lista do banco
- `POST /api/mentoradas` — cria + envia convite por e-mail (Supabase Auth)
- `PATCH /api/mentoradas` — edita dados
- Página `/mentorandas` carrega dados reais do Supabase
- Ao cadastrar mentorada com e-mail → convite automático enviado

### ✅ Admin configurado
- ID: `2e89ebd4-7741-4713-9041-e34f114264e1`
- Email: `izaborcruzprojetos@gmail.com`
- Tipo: `admin` na tabela `perfis`

---

## 3. Próximos Passos — Em Ordem de Prioridade

### ✅ FASE 1 — Conectar seções ao Supabase (CONCLUÍDA em 04/06/2026)

APIs criadas e páginas atualizadas:

| Seção | API | Página admin | Status |
|---|---|---|---|
| Mentoradas | `app/api/mentoradas/route.ts` | `app/mentorandas/page.tsx` | ✅ |
| Sessões | `app/api/sessoes/route.ts` | `app/sessoes/page.tsx` | ✅ |
| Check-ins | `app/api/checkins/route.ts` | `app/checkin/page.tsx` | ✅ |
| Devocionais | `app/api/devocionais/route.ts` | `app/devocionais/page.tsx` | ✅ |
| Aulas BW | `app/api/aulas/route.ts` | `app/aulas-bw/page.tsx` | ✅ |
| Desafios | `app/api/desafios/route.ts` ✅ | `app/desafios/page.tsx` ✅ | ✅ |
| Tarefas | `app/api/tarefas/route.ts` ✅ | `app/tarefas-mentoradas/page.tsx` ✅ | ✅ |
| Planos | `app/api/planos/route.ts` ✅ | `app/planos/page.tsx` ✅ | ✅ |
| Diagnósticos | `app/api/diagnosticos/route.ts` ✅ | `app/diagnosticos/page.tsx` ✅ | ✅ |

**MIGRATIONS PENDENTES — Rodar no Supabase > SQL Editor:**
```sql
-- Arquivo 1: supabase-migration-devocionais.sql
ALTER TABLE devocionais ADD COLUMN IF NOT EXISTS versiculo TEXT;
ALTER TABLE devocionais ADD COLUMN IF NOT EXISTS categoria TEXT DEFAULT 'Fe';
ALTER TABLE devocionais ADD COLUMN IF NOT EXISTS destaque BOOLEAN DEFAULT FALSE;

-- Arquivo 2: supabase-migration-tarefas.sql
ALTER TABLE tarefas ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'acao';
```

### 🟡 FASE 2 — Portal da mentorada com dados reais (próxima etapa)

### 🟡 FASE 2 — Portal da Mentorada com dados reais

Após a Fase 1, o portal da mentorada precisa mostrar dados reais:
- Devocional do dia → busca do banco (mais recente publicado)
- Desafios da semana → busca do banco para aquela mentorada
- Próximos encontros → busca das sessões agendadas
- Aulas → busca aulas publicadas
- Plano de ação → busca plano da mentorada
- Check-in → salva no banco

### 🟡 FASE 3 — E-mail personalizado (Resend)

Supabase envia e-mail básico de convite. Para e-mails personalizados (com logo da Izabor, QR code, etc.):

1. Criar conta em resend.com com e-mail da Izabor
2. Adicionar env var: `RESEND_API_KEY`
3. Criar `app/api/email/route.ts`
4. Personalizar: boas-vindas, reset de senha, confirmações

```bash
# Adicionar env var no Vercel da Izabor:
npx vercel env add RESEND_API_KEY production --scope izabor-cruz-projetos-projects
```

### 🟡 FASE 4 — URL do site no Vercel

Adicionar a URL oficial para que os links nos e-mails de convite funcionem corretamente:
```bash
npx vercel env add NEXT_PUBLIC_SITE_URL production --scope izabor-cruz-projetos-projects
# Valor: https://projeto-iza.vercel.app (ou domínio personalizado)
```

### 🟢 FASE 5 — Portal de Eventos

Ver seção 7 abaixo.

---

## 4. Estrutura de Arquivos

```
projeto-iza/
├── app/
│   ├── api/
│   │   ├── mentoradas/route.ts   ✅ GET, POST, PATCH
│   │   ├── sessoes/route.ts      ✅ GET, POST, PATCH
│   │   ├── checkins/route.ts     ✅ GET, POST
│   │   ├── devocionais/route.ts  ✅ GET, POST, PATCH, DELETE
│   │   └── aulas/route.ts        ✅ GET, POST, PATCH, DELETE
│   ├── login/page.tsx            ✅ auth real
│   ├── mentorandas/page.tsx      ✅ dados reais
│   ├── sessoes/page.tsx          ✅ dados reais
│   ├── checkin/page.tsx          ✅ dados reais
│   ├── devocionais/page.tsx      ✅ dados reais
│   ├── aulas-bw/page.tsx         ✅ dados reais
│   ├── (demais páginas admin)    ⏳ ainda mock
│   └── mentorada/
│       └── (todas as páginas)    ⏳ ainda mock
├── components/
│   ├── LayoutShell.tsx           ✅ auth guard real
│   ├── Sidebar.tsx               ✅ logout real
│   └── SidebarMentorada.tsx      ✅ logout real
├── lib/
│   ├── supabase.ts               ✅ cliente público
│   └── supabase-admin.ts         ✅ cliente admin
├── scripts/
│   └── criar-admin.mjs           utilitário
├── supabase-schema.sql            ✅ schema completo
└── .env.local                     ✅ credenciais locais
```

---

## 5. Backup e Segurança

### Backup do banco (Supabase)
O plano gratuito do Supabase não tem backup automático com point-in-time recovery. Estratégia recomendada:

**Backup manual semanal:**
1. Supabase dashboard → Settings → Database
2. Clica em "Database backups" (se disponível no plano)
3. OU: SQL Editor → rodar `pg_dump` via query para exportar dados

**Backup do schema (já feito):**
- Arquivo `supabase-schema.sql` na raiz do projeto
- Se o banco for deletado acidentalmente, rodar esse arquivo recria tudo

**Upgrade recomendado (quando houver clientes reais):**
- Supabase Pro ($25/mês) → backups diários automáticos + point-in-time recovery

### Backup do código
- Código está local em `/Users/karolinecampos/Downloads/Claude/projeto-iza`
- Recomendado: criar repositório no GitHub para backup automático
```bash
# Quando quiser criar backup no GitHub:
cd /Users/karolinecampos/Downloads/Claude/projeto-iza
git init
git add .
git commit -m "Portal Izabor Cruz — versão inicial"
# Criar repo em github.com e fazer push
```

### Variáveis de ambiente no Vercel (já configuradas)
```
NEXT_PUBLIC_SUPABASE_URL        ✅
NEXT_PUBLIC_SUPABASE_ANON_KEY   ✅
SUPABASE_SERVICE_ROLE_KEY       ✅
NEXT_PUBLIC_SITE_URL            ⏳ adicionar
RESEND_API_KEY                  ⏳ adicionar (Fase 3)
```

---

## 6. Como Retomar o Trabalho em um Novo Chat

**Copie e cole isso no início de qualquer novo chat:**

> "Estou trabalhando no portal da Izabor Cruz. O projeto está em `/Users/karolinecampos/Downloads/Claude/projeto-iza`. Leia o arquivo `PROJETO-IZA.md` na raiz do projeto para entender tudo que já foi feito e o que fazer a seguir."

O arquivo que você está lendo agora contém TUDO. Qualquer Claude que ler isso sabe exatamente onde estamos e o que fazer.

---

## 7. Visão Futura — Portal de Eventos

Quando a Izabor quiser expandir para eventos:

### Fluxo técnico completo
```
Compra confirmada (Hotmart/Kiwify/Monetizze)
    → Webhook para: /api/webhook/compra
    → API route recebe dados da compra
    → Cria usuário no Supabase Auth (inviteUserByEmail)
    → Gera QR Code único (biblioteca: npm install qrcode)
    → Resend envia e-mail com login + QR Code
    → Participante aparece no dashboard como "Confirmado"
    → No evento: scanner valida QR → status vira "Presente"
```

### Módulos do portal de eventos
- Página do evento (data, programação, palestrantes)
- Gerenciamento de ingressos (variantes: VIP, regular, etc.)
- QR Code por participante
- Check-in no evento (scanner mobile)
- Dashboard: comprou / compareceu / não compareceu
- Materiais pós-evento (acesso exclusivo para presentes)
- CRM de leads (quem demonstrou interesse mas não comprou)

### Implementação (quando chegar a hora)
1. `npm install qrcode` + `npm install @types/qrcode`
2. `app/api/webhook/[plataforma]/route.ts` — recebe webhook
3. `app/api/eventos/route.ts` — CRUD de eventos
4. `app/api/ingressos/route.ts` — gerencia participantes
5. Tabelas novas no Supabase: `eventos`, `ingressos`, `participantes`

---

## 8. CRM e Remarketing (Visão Futura)

- Pipeline de leads (Kanban: Lead → Interesse → Proposta → Fechado)
- Histórico de interações por lead
- Alertas de follow-up automáticos
- Segmentação por origem (Instagram, evento, indicação, anúncio)
- Geração de copy personalizada por IA para cada segmento
- Gestão de anúncios Meta Ads / TikTok Ads

---

## 9. Identidade do Negócio da Izabor

**Programas:** Mentoria Individual · Mentoria BW (24 sessões) · Club BW · Imersão BW  
**Pilares:** Fé · Mentalidade · Liderança (+ Emocional, Família)  
**Tom:** Acolhedor, espiritual, transformador. Deus e fé como centro.  
**Abordagem:** Inteligência emocional e espiritual — o negócio melhora como consequência da transformação interior.  
**Instagram:** @izaborcruz_ · **YouTube:** @izaborcruz_

**IMPORTANTE:** O diagnóstico e o check-in são sobre a MULHER, não sobre o negócio. Nunca perguntar sobre faturamento, clientes ou métricas no diagnóstico.
