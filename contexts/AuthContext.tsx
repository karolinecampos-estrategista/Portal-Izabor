"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type UserTipo = "admin" | "mentorada";

export interface AuthUser {
  tipo: UserTipo;
  nome: string;
  email?: string;
  programa?: string;
  primeiroAcesso: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (tipo: UserTipo, senha: string, email?: string) => "ok" | "erro_senha" | "erro_usuario";
  logout: () => void;
  completarAcolhimento: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Senhas mock — substituir por backend futuramente
const ADMIN_SENHA = "izabor2025";
const MENTORADA_SENHA = "bw2025";

const MENTORADAS_MOCK: Record<string, { nome: string; programa: string }> = {
  "ana@email.com":      { nome: "Ana Paula",      programa: "Mentoria BW" },
  "camila@email.com":   { nome: "Camila Souza",   programa: "Mentoria Individual" },
  "fernanda@email.com": { nome: "Fernanda Lima",  programa: "Club BW" },
  "juliana@email.com":  { nome: "Juliana Matos",  programa: "Mentoria Individual" },
  "renata@email.com":   { nome: "Renata Costa",   programa: "Club BW" },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("iza_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setLoading(false);
  }, []);

  function login(tipo: UserTipo, senha: string, email?: string): "ok" | "erro_senha" | "erro_usuario" {
    if (tipo === "admin") {
      if (senha !== ADMIN_SENHA) return "erro_senha";
      const u: AuthUser = { tipo: "admin", nome: "Izabor", primeiroAcesso: false };
      setUser(u);
      localStorage.setItem("iza_user", JSON.stringify(u));
      return "ok";
    }

    if (tipo === "mentorada") {
      if (!email) return "erro_usuario";
      if (senha !== MENTORADA_SENHA) return "erro_senha";
      const emailKey = email.toLowerCase().trim();
      const dadosMock = MENTORADAS_MOCK[emailKey];
      const primeiroAcesso = !localStorage.getItem(`iza_acolhimento_${emailKey}`);
      const u: AuthUser = {
        tipo: "mentorada",
        nome: dadosMock?.nome || "Mentorada",
        email: emailKey,
        programa: dadosMock?.programa || "Mentoria BW",
        primeiroAcesso,
      };
      setUser(u);
      localStorage.setItem("iza_user", JSON.stringify(u));
      return "ok";
    }

    return "erro_usuario";
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("iza_user");
  }

  function completarAcolhimento() {
    if (!user?.email) return;
    localStorage.setItem(`iza_acolhimento_${user.email}`, "done");
    const updated = { ...user, primeiroAcesso: false };
    setUser(updated);
    localStorage.setItem("iza_user", JSON.stringify(updated));
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, completarAcolhimento }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve estar dentro do AuthProvider");
  return ctx;
}
