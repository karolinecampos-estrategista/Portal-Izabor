"use client";

import { useState, useEffect } from "react";
import { User, Instagram, Calendar, Phone, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Mentorada = {
  id: string;
  nome: string;
  email: string | null;
  instagram: string | null;
  whatsapp: string | null;
  aniversario: string | null;
  programa: string | null;
  criado_em: string;
  cor: string;
};

export default function Perfil() {
  const [dados, setDados] = useState<Mentorada | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [temp, setTemp] = useState({ instagram: "", whatsapp: "", aniversario: "" });

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setCarregando(false); return; }

      const { data: m } = await supabase
        .from("mentoradas")
        .select("id, nome, email, instagram, whatsapp, aniversario, programa, criado_em, cor")
        .eq("user_id", session.user.id)
        .single();

      if (m) setDados(m);
      setCarregando(false);
    });
  }, []);

  function abrirEdicao() {
    if (!dados) return;
    setTemp({
      instagram: dados.instagram ?? "",
      whatsapp: dados.whatsapp ?? "",
      aniversario: dados.aniversario ?? "",
    });
    setEditando(true);
  }

  async function salvar() {
    if (!dados) return;
    setSalvando(true);

    await fetch("/api/mentoradas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: dados.id,
        instagram: temp.instagram || null,
        whatsapp: temp.whatsapp || null,
        aniversario: temp.aniversario || null,
      }),
    });

    setDados((prev) => prev ? { ...prev, instagram: temp.instagram || null, whatsapp: temp.whatsapp || null, aniversario: temp.aniversario || null } : prev);
    setSalvando(false);
    setEditando(false);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 3000);
  }

  function dataInicio(iso: string) {
    const d = new Date(iso);
    const meses = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
    return `${meses[d.getMonth()]} ${d.getFullYear()}`;
  }

  if (carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: "var(--text-muted)" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 14 }}>Carregando perfil...</span>
      </div>
    );
  }

  if (!dados) {
    return (
      <div style={{ maxWidth: 500, margin: "0 auto", textAlign: "center", paddingTop: 48 }}>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Perfil não encontrado. Entre em contato com a Izabor.</p>
      </div>
    );
  }

  const iniciais = dados.nome.split(" ").map((n) => n[0]).join("").slice(0, 2);

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <User size={16} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Meu Perfil</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Dados Pessoais</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
          Mantenha suas informações atualizadas para a Izabor.
        </p>
      </div>

      {/* Confirmação salvo */}
      {salvo && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "rgba(134,239,172,0.1)", border: "1px solid rgba(134,239,172,0.3)", borderRadius: 10, marginBottom: 16 }}>
          <CheckCircle size={14} style={{ color: "#86efac" }} />
          <span style={{ fontSize: 13, color: "#86efac", fontWeight: 600 }}>Perfil atualizado com sucesso!</span>
        </div>
      )}

      {/* Card principal */}
      <div className="card" style={{ padding: "24px 26px", border: "1px solid var(--gold-border)", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>

          {/* Avatar */}
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{
              width: 88, height: 88, borderRadius: "50%",
              background: (dados.cor ?? "#C9A84C") + "22", border: "2px solid var(--gold-border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 30, fontWeight: 700, color: dados.cor ?? "var(--gold)", margin: "0 auto 10px",
            }}>
              {iniciais}
            </div>
            <div style={{ padding: "3px 10px", background: "var(--gold-light)", border: "1px solid var(--gold-border)", borderRadius: 999, display: "inline-block" }}>
              <span style={{ fontSize: 10, color: "var(--gold)", fontWeight: 600 }}>✨ {dados.programa ?? "Extraordinária"}</span>
            </div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "6px 0 0" }}>
              Desde {dataInicio(dados.criado_em)}
            </p>
          </div>

          {/* Dados */}
          <div style={{ flex: 1, minWidth: 220 }}>
            {editando ? (
              <div className="flex flex-col gap-3">
                <div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Nome completo</p>
                  <p style={{ fontSize: 14, fontWeight: 600, margin: 0, padding: "9px 0", color: "var(--text-soft)" }}>{dados.nome}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Instagram</p>
                  <input
                    value={temp.instagram}
                    onChange={(e) => setTemp({ ...temp, instagram: e.target.value })}
                    style={{ padding: "9px 12px", fontSize: 13, width: "100%" }}
                    placeholder="@seu.instagram"
                  />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>WhatsApp</p>
                  <input
                    value={temp.whatsapp}
                    onChange={(e) => setTemp({ ...temp, whatsapp: e.target.value })}
                    style={{ padding: "9px 12px", fontSize: 13, width: "100%" }}
                    placeholder="(11) 99999-0000"
                  />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Data de aniversário</p>
                  <input
                    value={temp.aniversario}
                    onChange={(e) => setTemp({ ...temp, aniversario: e.target.value })}
                    style={{ padding: "9px 12px", fontSize: 13, width: "100%" }}
                    placeholder="DD/MM/AAAA"
                  />
                </div>
                <div className="flex gap-2 justify-end" style={{ marginTop: 4 }}>
                  <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => setEditando(false)}>Cancelar</button>
                  <button className="btn-gold" style={{ fontSize: 12 }} onClick={salvar} disabled={salvando}>
                    {salvando ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between" style={{ marginBottom: 18 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{dados.nome}</h2>
                  <button
                    onClick={abrirEdicao}
                    style={{ fontSize: 11, color: "var(--text-muted)", background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}
                  >
                    Editar
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {dados.email && (
                    <div>
                      <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>E-mail</p>
                      <span style={{ fontSize: 14, color: "var(--text-soft)", fontWeight: 500 }}>{dados.email}</span>
                    </div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Instagram</p>
                      {dados.instagram ? (
                        <a
                          href={`https://instagram.com/${dados.instagram.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, color: "#f9a8d4", textDecoration: "none", fontWeight: 500 }}
                        >
                          <Instagram size={15} /> {dados.instagram}
                        </a>
                      ) : (
                        <button onClick={abrirEdicao} style={{ fontSize: 12, color: "var(--text-muted)", background: "none", border: "none", padding: 0, cursor: "pointer", fontStyle: "italic" }}>
                          Adicionar →
                        </button>
                      )}
                    </div>
                    <div>
                      <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>WhatsApp</p>
                      {dados.whatsapp ? (
                        <a
                          href={`https://wa.me/55${dados.whatsapp.replace(/\D/g,"")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, color: "#86efac", textDecoration: "none", fontWeight: 500 }}
                        >
                          <Phone size={15} /> {dados.whatsapp}
                        </a>
                      ) : (
                        <button onClick={abrirEdicao} style={{ fontSize: 12, color: "var(--text-muted)", background: "none", border: "none", padding: 0, cursor: "pointer", fontStyle: "italic" }}>
                          Adicionar →
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Aniversário</p>
                    {dados.aniversario ? (
                      <div className="flex items-center gap-2">
                        <Calendar size={14} style={{ color: "var(--gold)" }} />
                        <span style={{ fontSize: 14, color: "var(--text-soft)", fontWeight: 500 }}>{dados.aniversario}</span>
                      </div>
                    ) : (
                      <button onClick={abrirEdicao} style={{ fontSize: 12, color: "var(--text-muted)", background: "none", border: "none", padding: 0, cursor: "pointer", fontStyle: "italic" }}>
                        Adicionar →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
