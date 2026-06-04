"use client";

"use client";

import {
  BookHeart,
  Users,
  CalendarDays,
  TrendingUp,
  Flame,
  Star,
  ChevronRight,
  Heart,
  Crown,
  Cake,
  Phone,
  Instagram,
} from "lucide-react";
import Link from "next/link";

const TODAY_VERSE = {
  text: "O que você gera no secreto com Deus é o que te sustenta em público.",
  ref: "Izabor Cruz",
};

const STATS = [
  { label: "Mentorandas Ativas", value: "12", icon: Users, color: "#C9A84C", bg: "rgba(201,168,76,0.1)" },
  { label: "Devocionais Escritos", value: "47", icon: BookHeart, color: "#a78bfa", bg: "rgba(139,92,246,0.1)" },
  { label: "Sessões este Mês", value: "28", icon: CalendarDays, color: "#93c5fd", bg: "rgba(59,130,246,0.1)" },
  { label: "Mulheres Impactadas", value: "230+", icon: Heart, color: "#f9a8d4", bg: "rgba(236,72,153,0.1)" },
];

const MENTORANDAS_RECENTES = [
  { nome: "Ana Paula", prog: 75, fase: "Imersão BW", cor: "#C9A84C" },
  { nome: "Camila Souza", prog: 50, fase: "Mentoria Individual", cor: "#a78bfa" },
  { nome: "Fernanda Lima", prog: 90, fase: "Club BW", cor: "#86efac" },
  { nome: "Juliana Matos", prog: 30, fase: "Mentoria Individual", cor: "#93c5fd" },
];

const PROXIMOS_EVENTOS = [
  { dia: "26", mes: "MAI", titulo: "Mentoria — Ana Paula", hora: "10:00", tipo: "mentoria" },
  { dia: "27", mes: "MAI", titulo: "Club BW — Encontro Mensal", hora: "19:30", tipo: "club" },
  { dia: "29", mes: "MAI", titulo: "Live Instagram — Inteligência Emocional", hora: "20:00", tipo: "live" },
  { dia: "02", mes: "JUN", titulo: "Imersão BW — Abertura", hora: "09:00", tipo: "imersao" },
];

const tipoColor: Record<string, string> = {
  mentoria: "#C9A84C",
  club: "#a78bfa",
  live: "#93c5fd",
  imersao: "#f9a8d4",
};

const PILARES = [
  { label: "Fé", desc: "Dependência total de Deus", icon: "✝️" },
  { label: "Mentalidade", desc: "Transformação do pensamento", icon: "🧠" },
  { label: "Liderança", desc: "Ativar o extraordinário", icon: "👑" },
];

const ANIVERSARIOS = [
  { nome: "Ana Paula Ferreira", data: "12/08", cor: "#C9A84C", whatsapp: "(11) 99999-0001", instagram: "@anapaula.empreende" },
  { nome: "Camila Souza",       data: "03/11", cor: "#a78bfa", whatsapp: "(21) 98888-0002", instagram: "@camilasouz" },
  { nome: "Juliana Matos",      data: "28/06", cor: "#93c5fd", whatsapp: "(11) 96666-0004", instagram: "@juliana.matos" },
  { nome: "Fernanda Lima",      data: "15/04", cor: "#86efac", whatsapp: "(31) 97777-0003", instagram: "@fernandalima.lider" },
  { nome: "Renata Costa",       data: "07/02", cor: "#f9a8d4", whatsapp: "(85) 95555-0005", instagram: "@renata.incr" },
  { nome: "Patricia Alves",     data: "19/09", cor: "#fca5a5", whatsapp: "(47) 94444-0006", instagram: "@patricia.alves.bw" },
];

function proximosAniversarios() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  return ANIVERSARIOS.map((a) => {
    const [d, m] = a.data.split("/").map(Number);
    let proxima = new Date(ano, m - 1, d);
    if (proxima < hoje) proxima = new Date(ano + 1, m - 1, d);
    const diff = Math.ceil((proxima.getTime() - hoje.getTime()) / 86400000);
    return { ...a, diff, proxima };
  }).sort((a, b) => a.diff - b.diff).slice(0, 4);
}

function isHoje(data: string) {
  const hoje = new Date();
  const [d, m] = data.split("/").map(Number);
  return d === hoje.getDate() && m === (hoje.getMonth() + 1);
}

export default function Dashboard() {
  const hoje = new Date();
  const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const meses = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
  const dataStr = `${diasSemana[hoje.getDay()]}, ${hoje.getDate()} de ${meses[hoje.getMonth()]} de ${hoje.getFullYear()}`;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <Crown size={16} style={{ color: "var(--gold)" }} />
          <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{dataStr}</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0 }}>
          Bem-vinda, Izabor ✨
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
          Construindo Mulheres INCOMUNS.
        </p>
      </div>

      {/* Devocional do dia */}
      <div
        className="card glow-gold"
        style={{
          padding: "20px 24px",
          marginBottom: 24,
          background: "linear-gradient(135deg, #111111 0%, #161208 100%)",
          border: "1px solid var(--gold-border)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -30,
            right: -30,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)",
          }}
        />
        <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
          <Flame size={14} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Palavra do Dia
          </span>
        </div>
        <p style={{ fontSize: 16, fontStyle: "italic", color: "var(--text-soft)", lineHeight: 1.7, margin: "0 0 8px" }}>
          "{TODAY_VERSE.text}"
        </p>
        <p style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600 }}>— {TODAY_VERSE.ref}</p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {STATS.map((s) => (
          <div key={s.label} className="card" style={{ padding: "16px 18px" }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.label}</span>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: s.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <s.icon size={14} style={{ color: s.color }} />
              </div>
            </div>
            <p className="stat-value">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div className="grid-cols-2" style={{ marginBottom: 24 }}>

        {/* Mentorandas recentes */}
        <div className="card" style={{ padding: "18px 20px" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <div className="flex items-center gap-2">
              <Users size={14} style={{ color: "var(--gold)" }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Mentorandas</span>
            </div>
            <Link href="/mentorandas" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)", textDecoration: "none" }}>
              Ver todas <ChevronRight size={12} />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {MENTORANDAS_RECENTES.map((m) => (
              <div key={m.nome}>
                <div className="flex items-center justify-between" style={{ marginBottom: 5 }}>
                  <div className="flex items-center gap-2">
                    <div
                      className="avatar"
                      style={{ background: m.cor + "20", color: m.cor, width: 28, height: 28, fontSize: 11 }}
                    >
                      {m.nome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 500, margin: 0 }}>{m.nome}</p>
                      <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>{m.fase}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: m.cor, fontWeight: 600 }}>{m.prog}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${m.prog}%`, background: m.cor }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Próximos eventos */}
        <div className="card" style={{ padding: "18px 20px" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <div className="flex items-center gap-2">
              <CalendarDays size={14} style={{ color: "var(--gold)" }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Próximos Eventos</span>
            </div>
            <Link href="/agenda" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)", textDecoration: "none" }}>
              Ver agenda <ChevronRight size={12} />
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {PROXIMOS_EVENTOS.map((e, i) => (
              <div
                key={i}
                className="flex items-center gap-3"
                style={{
                  padding: "10px 12px",
                  background: "var(--bg-input)",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    minWidth: 36,
                    textAlign: "center",
                    background: tipoColor[e.tipo] + "20",
                    borderRadius: 6,
                    padding: "4px 0",
                  }}
                >
                  <p style={{ fontSize: 14, fontWeight: 700, color: tipoColor[e.tipo], margin: 0, lineHeight: 1 }}>{e.dia}</p>
                  <p style={{ fontSize: 9, color: tipoColor[e.tipo], margin: 0, fontWeight: 600 }}>{e.mes}</p>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.titulo}</p>
                  <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>{e.hora}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Aniversários */}
      {(() => {
        const proximos = proximosAniversarios();
        const hoje = proximos.filter((a) => isHoje(a.data));
        return (
          <div className="card" style={{ padding: "18px 20px", marginBottom: 24 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
              <div className="flex items-center gap-2">
                <Cake size={14} style={{ color: "var(--gold)" }} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Aniversários</span>
                {hoje.length > 0 && (
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "rgba(201,168,76,0.15)", color: "var(--gold)", border: "1px solid var(--gold-border)", fontWeight: 700 }}>
                    🎂 Hoje!
                  </span>
                )}
              </div>
              <Link href="/mentorandas" style={{ fontSize: 11, color: "var(--text-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                Ver todas <ChevronRight size={12} />
              </Link>
            </div>
            {hoje.length > 0 && (
              <div style={{ padding: "12px 14px", background: "linear-gradient(135deg,#111 0%,#161208 100%)", border: "1px solid var(--gold-border)", borderRadius: 10, marginBottom: 12 }}>
                {hoje.map((a) => (
                  <div key={a.nome} className="flex items-center gap-3">
                    <span style={{ fontSize: 24 }}>🎂</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--gold)", margin: 0 }}>Hoje é aniversário de {a.nome}!</p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>Mande uma mensagem especial ✨</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={`https://wa.me/55${a.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 8, background: "rgba(134,239,172,0.12)", border: "1px solid rgba(134,239,172,0.2)", fontSize: 11, color: "#86efac", textDecoration: "none", fontWeight: 600 }}>
                        <Phone size={11} /> WA
                      </a>
                      <a href={`https://instagram.com/${a.instagram.replace("@","")}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 8, background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.2)", fontSize: 11, color: "#f9a8d4", textDecoration: "none", fontWeight: 600 }}>
                        <Instagram size={11} /> IG
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 8 }}>
              {proximos.filter((a) => !isHoje(a.data)).map((a) => (
                <div key={a.nome} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--bg-input)", borderRadius: 8, border: "1px solid var(--border)" }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: a.cor + "20", border: `1px solid ${a.cor}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 14 }}>🎂</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 500, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.nome.split(" ")[0]}</p>
                    <p style={{ fontSize: 10, color: a.cor, margin: 0, fontWeight: 600 }}>
                      {a.data} · em {a.diff} dia{a.diff !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <a href={`https://wa.me/55${a.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer" style={{ color: "#86efac", opacity: 0.7 }}>
                    <Phone size={12} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Pilares */}
      <div className="card" style={{ padding: "20px 24px", marginBottom: 8 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
          <Star size={14} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Os 3 Pilares — Mulher INCOMUM</span>
        </div>
        <div className="grid-cols-3">
          {PILARES.map((p) => (
            <div
              key={p.label}
              style={{
                padding: "16px",
                background: "var(--bg-input)",
                borderRadius: 10,
                border: "1px solid var(--border)",
                textAlign: "center",
              }}
            >
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
