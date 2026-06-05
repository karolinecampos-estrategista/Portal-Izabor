"use client";

import { useEffect, useState } from "react";
import { Activity, TrendingUp, TrendingDown, Minus, Loader2, Phone, Mail, Instagram } from "lucide-react";

type CheckIn = {
  id: string;
  nome: string;
  programa: string | null;
  humor: number;
  semana: string | null;
  texto: string | null;
  criado_em: string;
  mentoradas?: { nome: string | null; cor: string; whatsapp: string | null; email: string | null; instagram: string | null } | null;
};

const EMOJIS = ["😔", "😟", "😐", "🙂", "🤩"];
const LABELS = ["Muito difícil", "Difícil", "Regular", "Bem", "Incrível!"];

function humorColor(h: number) {
  if (h <= 2) return "#fca5a5";
  if (h === 3) return "#fcd34d";
  return "#86efac";
}

function HumorIcon({ h }: { h: number }) {
  if (h <= 2) return <TrendingDown size={14} style={{ color: "#fca5a5" }} />;
  if (h === 3) return <Minus size={14} style={{ color: "#fcd34d" }} />;
  return <TrendingUp size={14} style={{ color: "#86efac" }} />;
}

function diasAtras(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const dias = Math.floor(diff / 86400000);
  if (dias === 0) return "Hoje";
  if (dias === 1) return "Ontem";
  return `${dias}d atrás`;
}

function iniciais(nome: string) {
  return nome.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function CheckinAdminPage() {
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch("/api/checkins")
      .then((r) => r.json())
      .then((data) => {
        setCheckins(Array.isArray(data) ? data : []);
        setCarregando(false);
      });
  }, []);

  if (carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "var(--text-muted)" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 14 }}>Carregando check-ins...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Activity size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Mentoradas</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Check-in Semanal</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Como suas extraordinárias estão chegando nesta semana.</p>
      </div>

      {checkins.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
          <Activity size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 14 }}>Nenhum check-in recebido ainda.</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>As mentoradas respondem no portal delas e os dados aparecem aqui.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14, marginBottom: 24 }}>
          {checkins.map((c) => {
            const cor = c.mentoradas?.cor ?? "#C9A84C";
            return (
              <div key={c.id} className="card" style={{ padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: cor + "20", border: `1px solid ${cor}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: cor, fontWeight: 700, flexShrink: 0 }}>
                    {iniciais(c.mentoradas?.nome ?? c.nome)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.mentoradas?.nome ?? c.nome}</p>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>
                      {c.semana ?? "Esta semana"} · {diasAtras(c.criado_em)}
                    </p>
                  </div>
                  <HumorIcon h={c.humor} />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--bg-input)", borderRadius: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 20 }}>{EMOJIS[c.humor - 1]}</span>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: humorColor(c.humor), margin: 0 }}>{LABELS[c.humor - 1]}</p>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>Humor {c.humor}/5</p>
                  </div>
                </div>

                {c.texto && (
                  <p style={{ fontSize: 12, color: "var(--text-soft)", lineHeight: 1.6, margin: "0 0 12px", fontStyle: "italic" }}>
                    &ldquo;{c.texto}&rdquo;
                  </p>
                )}

                {/* Contatos rápidos */}
                {(c.mentoradas?.whatsapp || c.mentoradas?.email || c.mentoradas?.instagram) && (
                  <div style={{ display: "flex", gap: 6, marginTop: c.texto ? 0 : 0, paddingTop: 12, borderTop: "1px solid var(--border)", flexWrap: "wrap" }}>
                    {c.mentoradas?.whatsapp && (
                      <a
                        href={`https://wa.me/55${c.mentoradas.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 7, background: "rgba(134,239,172,0.08)", border: "1px solid rgba(134,239,172,0.2)", color: "#86efac", fontSize: 11, fontWeight: 600, textDecoration: "none" }}
                      >
                        <Phone size={11} /> WhatsApp
                      </a>
                    )}
                    {c.mentoradas?.email && (
                      <a
                        href={`mailto:${c.mentoradas.email}`}
                        style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 7, background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", color: "var(--gold)", fontSize: 11, fontWeight: 600, textDecoration: "none" }}
                      >
                        <Mail size={11} /> E-mail
                      </a>
                    )}
                    {c.mentoradas?.instagram && (
                      <a
                        href={`https://instagram.com/${c.mentoradas.instagram.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 7, background: "rgba(249,168,212,0.08)", border: "1px solid rgba(249,168,212,0.2)", color: "#f9a8d4", fontSize: 11, fontWeight: 600, textDecoration: "none" }}
                      >
                        <Instagram size={11} /> Instagram
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ padding: "14px 18px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10 }}>
        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
          💡 As mentoradas respondem o check-in no portal delas e os dados aparecem aqui em tempo real.
        </p>
      </div>
    </div>
  );
}
