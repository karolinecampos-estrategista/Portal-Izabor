"use client";

import { useState, useEffect } from "react";
import { Stethoscope, ArrowRight, ArrowLeft, CheckCircle, RotateCcw } from "lucide-react";
import { supabase } from "@/lib/supabase";

const PERGUNTAS = [
  {
    id: "momento_emocional",
    titulo: "Como você descreveria seu momento emocional agora?",
    opcoes: [
      { valor: "a", label: "Me sinto sobrecarregada e no limite da minha energia" },
      { valor: "b", label: "Estou funcionando, mas com um cansaço que não passa" },
      { valor: "c", label: "Estou bem, mas sinto que falta algo que não sei nomear" },
      { valor: "d", label: "Me sinto inteira e com clareza do que quero" },
    ],
  },
  {
    id: "fe",
    titulo: "Como está sua vida espiritual hoje?",
    opcoes: [
      { valor: "a", label: "Estou distante de Deus e sinto esse vazio no dia a dia" },
      { valor: "b", label: "Oro mas ainda não confio de verdade, fico no controle de tudo" },
      { valor: "c", label: "Tenho fé mas às vezes ela oscila quando as coisas ficam difíceis" },
      { valor: "d", label: "Minha fé é o centro — ela sustenta tudo na minha vida" },
    ],
  },
  {
    id: "identidade",
    titulo: "Quando você se olha no espelho, o que você vê?",
    opcoes: [
      { valor: "a", label: "Uma mulher que ainda não chegou onde deveria estar" },
      { valor: "b", label: "Alguém que tenta mas ainda duvida muito do próprio valor" },
      { valor: "c", label: "Uma mulher em construção, com muito para crescer" },
      { valor: "d", label: "Uma mulher poderosa, ainda que imperfeita e em processo" },
    ],
  },
  {
    id: "medo",
    titulo: "O medo ocupa qual lugar na sua vida hoje?",
    opcoes: [
      { valor: "a", label: "Me paralisa — evito situações que me exponham ou me desafiem" },
      { valor: "b", label: "Ando com ele, mas ele ainda decide mais do que eu gostaria" },
      { valor: "c", label: "Reconheço o medo mas consigo agir mesmo com ele presente" },
      { valor: "d", label: "O medo existe, mas não tem autoridade sobre as minhas escolhas" },
    ],
  },
  {
    id: "relacionamentos",
    titulo: "Como estão suas relações mais importantes?",
    opcoes: [
      { valor: "a", label: "Estou isolada — o cansaço e a pressão afastaram quem amo" },
      { valor: "b", label: "Minhas relações existem, mas têm sofrido com a minha ausência" },
      { valor: "c", label: "Estou presente, mas sinto que poderia me conectar melhor" },
      { valor: "d", label: "Tenho relações saudáveis que me nutrem e me fortalecem" },
    ],
  },
  {
    id: "proposito",
    titulo: "Você sente que o que faz tem propósito?",
    opcoes: [
      { valor: "a", label: "Não — faço por obrigação ou necessidade, sem sentir sentido" },
      { valor: "b", label: "Às vezes sinto, mas na maior parte do tempo é só execução" },
      { valor: "c", label: "Sinto propósito, mas ainda não conectei isso ao que faço no dia a dia" },
      { valor: "d", label: "Sim — o que faço me move, mesmo nos dias difíceis" },
    ],
  },
  {
    id: "autocuidado",
    titulo: "Como você cuida de você mesma?",
    opcoes: [
      { valor: "a", label: "Não cuido — coloco todos antes de mim e chego no fundo do poço" },
      { valor: "b", label: "Cuido pouco — sei que preciso mas a culpa ainda fala mais alto" },
      { valor: "c", label: "Tenho alguns momentos meus, mas ainda com muito espaço para melhorar" },
      { valor: "d", label: "Me cuido com intenção — entendo que minha saúde é minha prioridade" },
    ],
  },
];

type Perfil = {
  titulo: string;
  descricao: string;
  cor: string;
  mensagem: string;
  foco: string[];
};

const PERFIS: Record<string, Perfil> = {
  restauracao: {
    titulo: "A Mulher que precisa ser restaurada",
    cor: "#93c5fd",
    descricao: "Você chegou até aqui carregando muito. Há uma exaustão real, um vazio que nenhuma conquista profissional consegue preencher. Mas você também chegou até aqui — e isso não é pouco. Deus te encontra exatamente nesse lugar.",
    mensagem: "\"Vinde a mim todos os que estais cansados e sobrecarregados, e eu vos aliviarei.\" — Mateus 11:28",
    foco: ["Restauração emocional e espiritual", "Reconstruir a relação consigo mesma", "Criar base de segurança interior antes de crescer"],
  },
  consolidacao: {
    titulo: "A Mulher que está se encontrando",
    cor: "#C9A84C",
    descricao: "Você já saiu do fundo, mas ainda está no meio do processo. Há dias de clareza e dias de dúvida. Isso é normal — é o sinal de que a transformação está acontecendo. Confie no processo.",
    mensagem: "\"Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento.\" — Provérbios 3:5",
    foco: ["Fortalecer a identidade e a autoconfiança", "Integrar fé e vida prática", "Aprender a agir mesmo com o medo presente"],
  },
  expansao: {
    titulo: "A Mulher que está florescendo",
    cor: "#86efac",
    descricao: "Você tem uma base. Tem fé, tem clareza, tem presença. O próximo nível não é sobre fazer mais — é sobre ser mais. É sobre aprender a liderar a partir de quem você é, não do que você entrega.",
    mensagem: "\"Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz e não de mal, para vos dar o fim que esperais.\" — Jeremias 29:11",
    foco: ["Expandir sem perder o centro", "Liderar a partir da identidade, não da performance", "Sustentar o crescimento com saúde emocional e espiritual"],
  },
};

function calcularPerfil(respostas: Record<string, string>): Perfil {
  const pontos = Object.values(respostas).reduce((acc, v) => {
    const mapa: Record<string, number> = { a: 1, b: 2, c: 3, d: 4 };
    return acc + (mapa[v] || 0);
  }, 0);
  const media = pontos / Object.keys(respostas).length;
  if (media <= 2) return PERFIS.restauracao;
  if (media <= 3) return PERFIS.consolidacao;
  return PERFIS.expansao;
}

async function salvarDiagnostico(respostas: Record<string, string>, perfil: Perfil) {
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id ?? null;

  const { data: mentorada } = userId
    ? await supabase.from("mentoradas").select("nome, email, programa").eq("user_id", userId).single()
    : { data: null };

  await fetch("/api/diagnosticos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      nome: mentorada?.nome ?? session?.user?.email?.split("@")[0] ?? "Mentorada",
      email: mentorada?.email ?? session?.user?.email ?? null,
      programa: mentorada?.programa ?? "Mentoria BW",
      perfil: perfil.titulo,
      cor: perfil.cor,
      foco: perfil.foco,
      respostas: PERGUNTAS.map((p) => ({
        pergunta: p.titulo,
        resposta: p.opcoes.find((o) => o.valor === respostas[p.id])?.label || "",
      })),
    }),
  });
}

export default function DiagnosticoPage() {
  const [passo, setPasso] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [concluido, setConcluido] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const { data } = await supabase
        .from("diagnosticos")
        .select("id")
        .eq("user_id", session.user.id)
        .single();
      if (data) setConcluido(true);
    });
  }, []);

  const totalPassos = PERGUNTAS.length;
  const perguntaAtual = PERGUNTAS[passo];
  const respostaAtual = respostas[perguntaAtual?.id];

  function selecionar(valor: string) {
    setRespostas((prev) => ({ ...prev, [perguntaAtual.id]: valor }));
  }

  async function avancar() {
    if (!respostaAtual) return;
    if (passo < totalPassos - 1) {
      setPasso((p) => p + 1);
    } else {
      const perfil = calcularPerfil(respostas);
      await salvarDiagnostico(respostas, perfil);
      setConcluido(true);
    }
  }

  function voltar() {
    if (passo > 0) setPasso((p) => p - 1);
  }

  function reiniciar() {
    setRespostas({});
    setPasso(0);
    setConcluido(false);
  }

  if (concluido) {
    const perfil = calcularPerfil(respostas);
    return (
      <div style={{ maxWidth: 620, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: `${perfil.cor}18`, border: `1px solid ${perfil.cor}40`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <CheckCircle size={28} style={{ color: perfil.cor }} />
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: 8 }}>
            Seu diagnóstico
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: perfil.cor, margin: 0, lineHeight: 1.3 }}>
            {perfil.titulo}
          </h1>
        </div>

        <div className="card" style={{ padding: "24px", marginBottom: 16, background: "linear-gradient(135deg, #111111 0%, #161208 100%)", border: `1px solid ${perfil.cor}30` }}>
          <p style={{ fontSize: 14, color: "var(--text-soft)", lineHeight: 1.8, margin: "0 0 20px" }}>
            {perfil.descricao}
          </p>
          <p style={{ fontSize: 13, fontStyle: "italic", color: perfil.cor, lineHeight: 1.6, margin: "0 0 20px" }}>
            {perfil.mensagem}
          </p>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              O que vamos trabalhar juntas
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {perfil.foco.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: perfil.cor, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "var(--text-soft)" }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: "18px 20px", marginBottom: 24, background: "linear-gradient(135deg, #111111 0%, #161208 100%)", border: "1px solid var(--gold-border)" }}>
          <p style={{ fontSize: 13, fontStyle: "italic", color: "var(--text-soft)", lineHeight: 1.7, margin: "0 0 6px" }}>
            "Você não está aqui por acidente. Deus te trouxe até este momento com um propósito. Agora é hora de florescer."
          </p>
          <p style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, margin: 0 }}>— Izabor Cruz</p>
        </div>

        <button
          onClick={reiniciar}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 16px", cursor: "pointer", color: "var(--text-muted)", fontSize: 12, margin: "0 auto" }}
        >
          <RotateCcw size={13} /> Refazer diagnóstico
        </button>
      </div>
    );
  }

  const progresso = Math.round(((passo + 1) / totalPassos) * 100);

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Stethoscope size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Pessoal</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Meu Diagnóstico</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
          Seja honesta. Não existe resposta certa — existe a sua verdade.
        </p>
      </div>

      {/* Progresso */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Pergunta {passo + 1} de {totalPassos}</span>
          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600 }}>{progresso}%</span>
        </div>
        <div style={{ height: 4, background: "var(--bg-input)", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progresso}%`, background: "var(--gold)", borderRadius: 999, transition: "width 0.4s ease" }} />
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
          {PERGUNTAS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 999, background: respostas[PERGUNTAS[i].id] ? "var(--gold)" : i === passo ? "rgba(201,168,76,0.4)" : "var(--border)", transition: "background 0.3s" }} />
          ))}
        </div>
      </div>

      {/* Pergunta */}
      <div className="card" style={{ padding: "28px 24px", marginBottom: 16 }}>
        <p style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", margin: "0 0 20px", lineHeight: 1.4 }}>
          {perguntaAtual.titulo}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {perguntaAtual.opcoes.map((op) => {
            const selecionada = respostaAtual === op.valor;
            return (
              <button
                key={op.valor}
                onClick={() => selecionar(op.valor)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 16px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                  background: selecionada ? "var(--gold-light)" : "var(--bg-input)",
                  border: `2px solid ${selecionada ? "var(--gold)" : "var(--border)"}`,
                  transition: "all 0.15s",
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                  border: `2px solid ${selecionada ? "var(--gold)" : "var(--border)"}`,
                  background: selecionada ? "var(--gold)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {selecionada && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#000" }} />}
                </div>
                <span style={{ fontSize: 13, color: selecionada ? "var(--gold)" : "var(--text-soft)", fontWeight: selecionada ? 600 : 400, lineHeight: 1.5 }}>
                  {op.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navegação */}
      <div style={{ display: "flex", gap: 10 }}>
        {passo > 0 && (
          <button onClick={voltar} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 10, background: "none", border: "1px solid var(--border)", cursor: "pointer", color: "var(--text-muted)", fontSize: 13 }}>
            <ArrowLeft size={15} /> Voltar
          </button>
        )}
        <button
          onClick={avancar}
          disabled={!respostaAtual}
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            padding: "13px", borderRadius: 10, border: "none",
            background: !respostaAtual ? "rgba(201,168,76,0.3)" : "var(--gold)",
            cursor: !respostaAtual ? "not-allowed" : "pointer",
            color: "#000", fontSize: 14, fontWeight: 700,
          }}
        >
          {passo < totalPassos - 1 ? <>Próxima <ArrowRight size={16} /></> : <>Ver meu diagnóstico <CheckCircle size={16} /></>}
        </button>
      </div>
    </div>
  );
}
