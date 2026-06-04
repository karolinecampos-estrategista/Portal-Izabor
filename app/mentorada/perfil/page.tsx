"use client";

import { User, Instagram, Calendar, MapPin, Phone } from "lucide-react";
import { useState } from "react";

export default function Perfil() {
  const [nome, setNome] = useState("Ana Paula Ferreira");
  const [instagram, setInstagram] = useState("@anapaula.empreende");
  const [whatsapp, setWhatsapp] = useState("(11) 99999-0000");
  const [aniversario, setAniversario] = useState("12/08/1990");
  const [cidade, setCidade] = useState("São Paulo — SP");
  const [telefone, setTelefone] = useState("(11) 99999-0000");
  const [editando, setEditando] = useState(false);
  const [temp, setTemp] = useState({ nome, instagram, whatsapp, aniversario, cidade, telefone });

  function salvar() {
    setNome(temp.nome);
    setInstagram(temp.instagram);
    setWhatsapp(temp.whatsapp);
    setAniversario(temp.aniversario);
    setCidade(temp.cidade);
    setTelefone(temp.telefone);
    setEditando(false);
  }

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
          Mantenha suas informações atualizadas.
        </p>
      </div>

      {/* Card principal */}
      <div className="card" style={{ padding: "24px 26px", border: "1px solid var(--gold-border)", marginBottom: 20 }}>
        <div className="flex items-start gap-16" style={{ flexWrap: "wrap" }}>

          {/* Avatar */}
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{
              width: 88, height: 88, borderRadius: "50%",
              background: "rgba(201,168,76,0.15)", border: "2px solid var(--gold-border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 30, fontWeight: 700, color: "var(--gold)", margin: "0 auto 10px",
            }}>
              {nome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div style={{ padding: "3px 10px", background: "var(--gold-light)", border: "1px solid var(--gold-border)", borderRadius: 999, display: "inline-block" }}>
              <span style={{ fontSize: 10, color: "var(--gold)", fontWeight: 600 }}>✨ Aluna BW</span>
            </div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "6px 0 0" }}>Desde {/* dataInicio */}Mar 2026</p>
          </div>

          {/* Dados */}
          <div style={{ flex: 1, minWidth: 220 }}>
            {editando ? (
              <div className="flex flex-col gap-3">
                <div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Nome completo</p>
                  <input value={temp.nome} onChange={(e) => setTemp({ ...temp, nome: e.target.value })} style={{ padding: "9px 12px", fontSize: 13, width: "100%" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Instagram</p>
                    <input value={temp.instagram} onChange={(e) => setTemp({ ...temp, instagram: e.target.value })} style={{ padding: "9px 12px", fontSize: 13, width: "100%" }} placeholder="@seu.instagram" />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>WhatsApp</p>
                    <input value={temp.whatsapp} onChange={(e) => setTemp({ ...temp, whatsapp: e.target.value })} style={{ padding: "9px 12px", fontSize: 13, width: "100%" }} placeholder="(11) 99999-0000" />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Data de aniversário</p>
                    <input value={temp.aniversario} onChange={(e) => setTemp({ ...temp, aniversario: e.target.value })} style={{ padding: "9px 12px", fontSize: 13 }} placeholder="DD/MM/AAAA" />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Telefone</p>
                    <input value={temp.telefone} onChange={(e) => setTemp({ ...temp, telefone: e.target.value })} style={{ padding: "9px 12px", fontSize: 13 }} placeholder="(11) 99999-0000" />
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Cidade</p>
                  <input value={temp.cidade} onChange={(e) => setTemp({ ...temp, cidade: e.target.value })} style={{ padding: "9px 12px", fontSize: 13, width: "100%" }} />
                </div>
                <div className="flex gap-2 justify-end" style={{ marginTop: 4 }}>
                  <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => { setEditando(false); setTemp({ nome, instagram, whatsapp, aniversario, cidade, telefone }); }}>Cancelar</button>
                  <button className="btn-gold" style={{ fontSize: 12 }} onClick={salvar}>Salvar</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between" style={{ marginBottom: 18 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{nome}</h2>
                  <button onClick={() => { setTemp({ nome, instagram, whatsapp, aniversario, cidade, telefone }); setEditando(true); }} style={{ fontSize: 11, color: "var(--text-muted)", background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>
                    Editar
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Instagram</p>
                      <a
                        href={`https://instagram.com/${instagram.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, color: "#f9a8d4", textDecoration: "none", fontWeight: 500 }}
                      >
                        <Instagram size={15} /> {instagram}
                      </a>
                    </div>
                    <div>
                      <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>WhatsApp</p>
                      <a
                        href={`https://wa.me/55${whatsapp.replace(/\D/g,"")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, color: "#86efac", textDecoration: "none", fontWeight: 500 }}
                      >
                        <Phone size={15} /> {whatsapp}
                      </a>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Aniversário
                      </p>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} style={{ color: "var(--gold)" }} />
                        <span style={{ fontSize: 14, color: "var(--text-soft)", fontWeight: 500 }}>{aniversario}</span>
                      </div>
                    </div>

                    <div>
                      <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Telefone</p>
                      <span style={{ fontSize: 14, color: "var(--text-soft)", fontWeight: 500 }}>{telefone}</span>
                    </div>
                  </div>

                  <div>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Cidade</p>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} style={{ color: "var(--text-muted)" }} />
                      <span style={{ fontSize: 14, color: "var(--text-soft)" }}>{cidade}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
