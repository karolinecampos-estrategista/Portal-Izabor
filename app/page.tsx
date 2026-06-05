"use client";

import { useState, useEffect } from "react";
import {
  BookHeart, Users, CalendarDays, Flame, Star,
  ChevronRight, Crown, Cake, Phone, Instagram, ClipboardList,
} from "lucide-react";
import Link from "next/link";

type Mentoranda = {
  id: string; nome: string; cor: string; programa: string;
  sessoes_feitas: number; total_sessoes: number;
  aniversario: string | null; whatsapp: string | null; instagram: string | null;
  status: string;
};
type Sessao = { id: string; mentorada_nome: string; data: string; duracao: string; status: string };
type Devocional = { id: string; publicado: boolean };

const PILARES = [
  { label: "Fé", desc: "Dependência total de Deus", icon: "✝️" },
  { label: "Mentalidade", desc: "Transformação do pensamento", icon: "🧠" },
  { label: "Liderança", desc: "Ativar o extraordinário", icon: "👑" },
];

function diasParaAniversario(data: string) {
  if (!data) return 9999;
  const hoje = new Date();
  const [d, m] = data.split("/").map(Number);
  let proxima = new Date(hoje.getFullYear(), m - 1, d);
  if (proxima < hoje) proxima = new Date(hoje.getFullYear() + 1, m - 1, d);
  return Math.ceil((proxima.getTime() - hoje.getTime()) / 86400000);
}
function isHoje(data: string) {
  if (!data) return false;
  const hoje = new Date();
  const [d, m] = data.split("/").map(Number);
  return d === hoje.getDate() && m === hoje.getMonth() + 1;
}
function formatarDataSessao(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return { dia: String(d.getDate()).padStart(2, "0"), mes: d.toLocaleString("pt-BR", { month: "short" }).toUpperCase().replace(".", "") };
}

export default function Dashboard() {
  const hoje = new Date();
  const diasSemana = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];
  const meses = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
  const dataStr = `${diasSemana[hoje.getDay()]}, ${hoje.getDate()} de ${meses[hoje.getMonth()]} de ${hoje.getFullYear()}`;
  const mesAtual = hoje.getMonth() + 1;

  const [mentorandas, setMentorandas] = useState<Mentoranda[]>([]);
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [devCount, setDevCount] = useState(0);

  useEffect(() => {
    fetch("/api/mentoradas").then((r) => r.json()).then((d) => setMentorandas(Array.isArray(d) ? d : []));
    fetch("/api/sessoes").then((r) => r.json()).then((d) => setSessoes(Array.isArray(d) ? d : []));
    fetch("/api/devocionais").then((r) => r.json()).then((d) => setDevCount(Array.isArray(d) ? d.length : 0));
  }, []);

  const ativas = mentorandas.filter((m) => m.status === "ativo").length;
  const sessoesDoMes = sessoes.filter((s) => {
    if (!s.data) return false;
    const m = parseInt(s.data.split("-")[1]);
    return m === mesAtual && s.status === "realizada";
  }).length;
  const proximasSessoes = sessoes
    .filter((s) => s.status === "agendada" && s.data >= hoje.toISOString().split("T")[0])
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(0, 4);
  const aniversarios = mentorandas
    .filter((m) => m.aniversario)
    .map((m) => ({ ...m, diff: diasParaAniversario(m.aniversario!), hoje: isHoje(m.aniversario!) }))
    .sort((a, b) => a.diff - b.diff)
    .slice(0, 4);

  const STATS = [
    { label: "Mentoradas Ativas", value: String(ativas || 0), icon: Users, color: "#C9A84C", bg: "rgba(201,168,76,0.1)" },
    { label: "Devocionais Criados", value: String(devCount), icon: BookHeart, color: "#a78bfa", bg: "rgba(139,92,246,0.1)" },
    { label: "Sessões este Mês", value: String(sessoesDoMes), icon: CalendarDays, color: "#93c5fd", bg: "rgba(59,130,246,0.1)" },
    { label: "Total de Sessões", value: String(sessoes.filter((s) => s.status === "realizada").length), icon: ClipboardList, color: "#f9a8d4", bg: "rgba(236,72,153,0.1)" },
  ];

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <Crown size={16} style={{ color: "var(--gold)" }} />
          <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{dataStr}</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0 }}>Bem-vinda, Izabor ✨</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Construindo Mulheres INCOMUNS.</p>
      </div>

      {/* Palavra do dia */}
      <div className="card glow-gold" style={{ padding: "20px 24px", marginBottom: 24, background: "linear-gradient(135deg, #111111 0%, #161208 100%)", border: "1px solid var(--gold-border)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)" }} />
        <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
          <Flame size={14} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Palavra do Dia</span>
        </div>
        <p style={{ fontSize: 16, fontStyle: "italic", color: "var(--text-soft)", lineHeight: 1.7, margin: "0 0 8px" }}>
          &ldquo;O que você gera no secreto com Deus é o que te sustenta em público.&rdquo;
        </p>
        <p style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600 }}>— Izabor Cruz</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
        {STATS.map((s) => (
          <div key={s.label} className="card" style={{ padding: "16px 18px" }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.label}</span>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <s.icon size={14} style={{ color: s.color }} />
              </div>
            </div>
            <p className="stat-value">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Mentorandas + Próximas sessões */}
      <div className="grid-cols-2" style={{ marginBottom: 24 }}>

        {/* Mentorandas */}
        <div className="card" style={{ padding: "18px 20px" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <div className="flex items-center gap-2">
              <Users size={14} style={{ color: "var(--gold)" }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Mentoradas</span>
            </div>
            <Link href="/mentorandas" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)", textDecoration: "none" }}>
              Ver todas <ChevronRight size={12} />
            </Link>
          </div>
          {mentorandas.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>Nenhuma mentorada cadastrada ainda.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {mentorandas.filter((m) => m.status === "ativo").slice(0, 4).map((m) => {
                const prog = m.total_sessoes > 0 ? Math.round((m.sessoes_feitas / m.total_sessoes) * 100) : 0;
                return (
                  <div key={m.id}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 5 }}>
                      <div className="flex items-center gap-2">
                        <div className="avatar" style={{ background: m.cor + "20", color: m.cor, width: 28, height: 28, fontSize: 11 }}>
                          {m.nome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 500, margin: 0 }}>{m.nome.split(" ")[0]}</p>
                          <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>{m.programa}</p>
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: m.cor, fontWeight: 600 }}>{m.sessoes_feitas}/{m.total_sessoes}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${prog}%`, background: m.cor }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Próximas sessões */}
        <div className="card" style={{ padding: "18px 20px" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <div className="flex items-center gap-2">
              <CalendarDays size={14} style={{ color: "var(--gold)" }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Próximas Sessões</span>
            </div>
            <Link href="/sessoes" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)", textDecoration: "none" }}>
              Ver todas <ChevronRight size={12} />
            </Link>
          </div>
          {proximasSessoes.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>Nenhuma sessão agendada.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {proximasSessoes.map((s) => {
                const { dia, mes } = formatarDataSessao(s.data);
                return (
                  <div key={s.id} className="flex items-center gap-3" style={{ padding: "10px 12px", background: "var(--bg-input)", borderRadius: 8, border: "1px solid var(--border)" }}>
                    <div style={{ minWidth: 36, textAlign: "center", background: "rgba(201,168,76,0.12)", borderRadius: 6, padding: "4px 0" }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--gold)", margin: 0, lineHeight: 1 }}>{dia}</p>
                      <p style={{ fontSize: 9, color: "var(--gold)", margin: 0, fontWeight: 600 }}>{mes}</p>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 500, margin: 0 }}>{s.mentorada_nome}</p>
                      <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>{s.duracao}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Aniversários */}
      {aniversarios.length > 0 && (
        <div className="card" style={{ padding: "18px 20px", marginBottom: 24 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
            <div className="flex items-center gap-2">
              <Cake size={14} style={{ color: "var(--gold)" }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Aniversários</span>
              {aniversarios.some((a) => a.hoje) && (
                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "rgba(201,168,76,0.15)", color: "var(--gold)", border: "1px solid var(--gold-border)", fontWeight: 700 }}>🎂 Hoje!</span>
              )}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 8 }}>
            {aniversarios.map((a) => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: a.hoje ? "linear-gradient(135deg,#111 0%,#161208 100%)" : "var(--bg-input)", borderRadius: 8, border: `1px solid ${a.hoje ? "var(--gold-border)" : "var(--border)"}` }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: a.cor + "20", border: `1px solid ${a.cor}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 14 }}>🎂</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.nome.split(" ")[0]}</p>
                  <p style={{ fontSize: 10, color: a.hoje ? "var(--gold)" : "var(--text-muted)", margin: 0, fontWeight: a.hoje ? 700 : 400 }}>
                    {a.hoje ? "Hoje! 🎉" : `${a.aniversario} · em ${a.diff} dia${a.diff !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {a.whatsapp && (
                    <a href={`https://wa.me/55${a.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer" style={{ color: "#86efac", opacity: 0.7 }}>
                      <Phone size={12} />
                    </a>
                  )}
                  {a.instagram && (
                    <a href={`https://instagram.com/${a.instagram.replace("@","")}`} target="_blank" rel="noopener noreferrer" style={{ color: "#f9a8d4", opacity: 0.7 }}>
                      <Instagram size={12} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pilares */}
      <div className="card" style={{ padding: "20px 24px", marginBottom: 8 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
          <Star size={14} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Os 3 Pilares — Build Woman</span>
        </div>
        <div className="grid-cols-3">
          {PILARES.map((p) => (
            <div key={p.label} style={{ padding: "16px", background: "var(--bg-input)", borderRadius: 10, border: "1px solid var(--border)", textAlign: "center" }}>
              <span style={{ fontSize: 22 }}>{p.icon}</span>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)", margin: "8px 0 4px" }}>{p.label}</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <p style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center" }}>
          Portal exclusivo · Izabor Cruz — Ativando Mulheres para viverem o extraordinário ✨
        </p>
      </div>
    </div>
  );
}
