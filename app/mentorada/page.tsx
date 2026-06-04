"use client";

import {
  Flame,
  PlaySquare,
  Trophy,
  TrendingUp,
  CalendarDays,
  CheckSquare,
  ChevronRight,
  Instagram,
  Youtube,
  Crown,
  Star,
  Heart,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Devocional = {
  id: string;
  titulo: string;
  conteudo: string | null;
  criado_em: string;
};

type Sessao = {
  id: string;
  data: string;
  duracao: string;
};

export default function HomeMentorada() {
  const [nomeMentorada, setNomeMentorada] = useState("Mentorada");
  const [programa, setPrograma] = useState("");
  const [devocional, setDevocional] = useState<Devocional | null>(null);
  const [proximasSessoes, setProximasSessoes] = useState<Sessao[]>([]);

  const hoje = new Date();
  const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const meses = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
  const dataStr = `${diasSemana[hoje.getDay()]}, ${hoje.getDate()} de ${meses[hoje.getMonth()]}`;

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;

      // Busca dados da mentorada logada
      const { data: mentoranda } = await supabase
        .from("mentoradas")
        .select("nome, programa")
        .eq("user_id", session.user.id)
        .single();

      if (mentoranda) {
        setNomeMentorada(mentoranda.nome.split(" ")[0]);
        setPrograma(mentoranda.programa ?? "");
      }
    });

    // Busca devocional publicado mais recente
    fetch("/api/devocionais")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const publicados = data.filter((d: { publicado: boolean }) => d.publicado);
          if (publicados.length > 0) setDevocional(publicados[0]);
        }
      });

    // Busca próximas sessões agendadas
    fetch("/api/sessoes")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const agendadas = data
            .filter((s: { status: string; data: string }) => s.status === "agendada" && s.data >= hoje.toISOString().split("T")[0])
            .slice(0, 3);
          setProximasSessoes(agendadas);
        }
      });
  }, []);

  // Desafios — conectar à API quando Fase 1.2 estiver pronta
  const [desafios, setDesafios] = useState<{ id: number; texto: string; feito: boolean }[]>([]);
  const feitos = desafios.filter((d) => d.feito).length;
  const progresso = desafios.length > 0 ? Math.round((feitos / desafios.length) * 100) : 0;

  function toggleDesafio(id: number) {
    setDesafios((prev) => prev.map((d) => d.id === id ? { ...d, feito: !d.feito } : d));
  }

  function formatarDataSessao(iso: string) {
    const d = new Date(iso + "T00:00:00");
    return {
      dia: String(d.getDate()).padStart(2, "0"),
      mes: d.toLocaleString("pt-BR", { month: "short" }).toUpperCase().replace(".", ""),
    };
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <Crown size={14} style={{ color: "var(--gold)" }} />
          <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{dataStr}</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0 }}>
          Bem-vinda, {nomeMentorada} ✨
        </h1>
        {programa && (
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
            Você está no <span style={{ color: "var(--gold)" }}>{programa}</span>
          </p>
        )}
      </div>

      {/* Devocional do dia */}
      <div
        className="card glow-gold"
        style={{
          padding: "20px 24px",
          marginBottom: 20,
          background: "linear-gradient(135deg, #111111 0%, #161208 100%)",
          border: "1px solid var(--gold-border)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)" }} />
        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
          <div className="flex items-center gap-2">
            <Flame size={14} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Devocional de Hoje
            </span>
          </div>
          {devocional && (
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {new Date(devocional.criado_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
            </span>
          )}
        </div>
        {devocional ? (
          <>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>{devocional.titulo}</p>
            {devocional.conteudo && (
              <p style={{ fontSize: 13, fontStyle: "italic", color: "var(--text-soft)", lineHeight: 1.7, margin: "0 0 8px" }}>
                &ldquo;{devocional.conteudo.slice(0, 280)}{devocional.conteudo.length > 280 ? "..." : ""}&rdquo;
              </p>
            )}
            <Link href="/mentorada/devocional" style={{ fontSize: 11, color: "var(--gold)", textDecoration: "none", fontWeight: 600 }}>
              Ler devocional completo →
            </Link>
          </>
        ) : (
          <p style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>
            Nenhum devocional publicado ainda. Em breve a Izabor compartilhará uma mensagem.
          </p>
        )}
      </div>

      {/* Progresso da semana + Próximos encontros */}
      <div className="grid-cols-2" style={{ marginBottom: 20 }}>

        {/* Desafios da semana */}
        <div className="card" style={{ padding: "18px 20px" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
            <div className="flex items-center gap-2">
              <Trophy size={14} style={{ color: "var(--gold)" }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Desafios da Semana</span>
            </div>
            <span style={{ fontSize: 12, color: "var(--gold)", fontWeight: 700 }}>{feitos}/{desafios.length}</span>
          </div>

          {/* Barra de progresso */}
          <div style={{ marginBottom: 14 }}>
            <div className="progress-bar" style={{ height: 6, marginBottom: 4 }}>
              <div className="progress-fill" style={{ width: `${progresso}%`, background: progresso === 100 ? "#86efac" : "var(--gold)" }} />
            </div>
            <p style={{ fontSize: 10, color: "var(--text-muted)" }}>{progresso}% concluído</p>
          </div>

          <div className="flex flex-col gap-2">
            {desafios.map((d) => (
              <button
                key={d.id}
                onClick={() => toggleDesafio(d.id)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: d.feito ? "rgba(134,239,172,0.07)" : "var(--bg-input)",
                  border: d.feito ? "1px solid rgba(134,239,172,0.2)" : "1px solid var(--border)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                }}
              >
                <CheckSquare size={15} style={{ color: d.feito ? "#86efac" : "var(--text-muted)", flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 12, color: d.feito ? "var(--text-soft)" : "var(--text)", textDecoration: d.feito ? "line-through" : "none", lineHeight: 1.4 }}>
                  {d.texto}
                </span>
              </button>
            ))}
          </div>

          <Link href="/mentorada/jornada" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)", textDecoration: "none", marginTop: 12 }}>
            Ver jornada completa <ChevronRight size={12} />
          </Link>
        </div>

        {/* Próximos encontros */}
        <div className="card" style={{ padding: "18px 20px" }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
            <CalendarDays size={14} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Próximas Sessões</span>
          </div>
          {proximasSessoes.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>
              Nenhuma sessão agendada no momento.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {proximasSessoes.map((s) => {
                const { dia, mes } = formatarDataSessao(s.data);
                return (
                  <div
                    key={s.id}
                    style={{
                      padding: "12px 14px",
                      background: "var(--bg-input)",
                      borderRadius: 10,
                      border: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div style={{ minWidth: 40, textAlign: "center", background: "rgba(201,168,76,0.12)", borderRadius: 8, padding: "6px 0" }}>
                      <p style={{ fontSize: 16, fontWeight: 700, color: "var(--gold)", margin: 0, lineHeight: 1 }}>{dia}</p>
                      <p style={{ fontSize: 9, color: "var(--gold)", margin: 0, fontWeight: 600 }}>{mes}</p>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 500, margin: 0 }}>Mentoria com Izabor</p>
                      <div className="flex items-center gap-1" style={{ marginTop: 2 }}>
                        <Clock size={10} style={{ color: "var(--text-muted)" }} />
                        <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>{s.duracao}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Atalhos rápidos */}
      <div className="card" style={{ padding: "18px 20px", marginBottom: 20 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
          <Star size={14} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Acesso Rápido</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
          {[
            { href: "/mentorada/aulas", icon: PlaySquare, label: "Aulas", color: "#a78bfa", bg: "rgba(139,92,246,0.1)" },
            { href: "/mentorada/jornada", icon: Trophy, label: "Jornada", color: "#C9A84C", bg: "rgba(201,168,76,0.1)" },
            { href: "/mentorada/depoimentos", icon: Heart, label: "Depoimentos", color: "#f9a8d4", bg: "rgba(236,72,153,0.1)" },
            { href: "/mentorada/financeiro", icon: TrendingUp, label: "Financeiro", color: "#86efac", bg: "rgba(34,197,94,0.1)" },
            { href: "/mentorada/meu-inicio", icon: Crown, label: "Meu Começo", color: "#93c5fd", bg: "rgba(59,130,246,0.1)" },
            { href: "/mentorada/chat", icon: Flame, label: "Chat", color: "#fca5a5", bg: "rgba(239,68,68,0.1)" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: "14px 10px",
                borderRadius: 10,
                background: item.bg,
                border: `1px solid ${item.color}30`,
                textDecoration: "none",
                transition: "all 0.15s",
              }}
            >
              <item.icon size={20} style={{ color: item.color }} />
              <span style={{ fontSize: 11, color: "var(--text-soft)", fontWeight: 500 }}>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Redes sociais */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
        <a
          href="https://www.instagram.com/izaborcruz_?igsh=bDUxaDk0ZG5jNGti"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 18px",
            borderRadius: 10,
            background: "rgba(236,72,153,0.08)",
            border: "1px solid rgba(236,72,153,0.2)",
            textDecoration: "none",
            transition: "all 0.2s",
          }}
        >
          <Instagram size={20} style={{ color: "#f9a8d4" }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#f9a8d4", margin: 0 }}>@izaborcruz_</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>Ver no Instagram</p>
          </div>
        </a>
        <a
          href="https://youtube.com/@izaborcruz_?si=XXPbPzy1o8LX11yq"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 18px",
            borderRadius: 10,
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            textDecoration: "none",
            transition: "all 0.2s",
          }}
        >
          <Youtube size={20} style={{ color: "#fca5a5" }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#fca5a5", margin: 0 }}>Izabor Cruz</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>Ver no YouTube</p>
          </div>
        </a>
      </div>

      <p style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", marginTop: 16 }}>
        Portal exclusivo · Izabor Cruz — Ativando Mulheres para viverem o extraordinário ✨
      </p>
    </div>
  );
}
