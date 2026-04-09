"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

function Fly({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width="24" height="20" viewBox="0 0 24 20" fill="none">
      <ellipse cx="12" cy="12" rx="4" ry="5" fill="#374151" />
      <ellipse cx="7" cy="7" rx="4" ry="6" fill="#374151" opacity="0.3" transform="rotate(-30 7 7)" />
      <ellipse cx="17" cy="7" rx="4" ry="6" fill="#374151" opacity="0.3" transform="rotate(30 17 7)" />
      <circle cx="10" cy="9" r="1" fill="#6B7280" />
      <circle cx="14" cy="9" r="1" fill="#6B7280" />
      <line x1="8" y1="14" x2="5" y2="17" stroke="#374151" strokeWidth="0.5" />
      <line x1="10" y1="15" x2="8" y2="18" stroke="#374151" strokeWidth="0.5" />
      <line x1="14" y1="15" x2="16" y2="18" stroke="#374151" strokeWidth="0.5" />
      <line x1="16" y1="14" x2="19" y2="17" stroke="#374151" strokeWidth="0.5" />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email ou senha inválidos");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(to bottom right, #0f2e1a, #0a1f12)",
      }}
    >
      {/* Subtle green glow */}
      <div
        className="absolute inset-0 pointer-events-none glow-effect"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(34, 197, 94, 0.15) 0%, transparent 70%)",
        }}
      />

      {/* Dead fly - top right */}
      <Fly
        style={{
          position: "absolute",
          top: "10%",
          right: "8%",
          transform: "rotate(180deg)",
          opacity: 0.4,
        }}
      />

      {/* Dead fly - top left */}
      <Fly
        style={{
          position: "absolute",
          top: "15%",
          left: "12%",
          transform: "rotate(200deg)",
          opacity: 0.35,
        }}
      />

      {/* Walking fly - bottom left */}
      <Fly
        className="fly-walking"
        style={{
          position: "absolute",
          bottom: "8%",
          left: "10%",
        }}
      />

      {/* Dead fly - bottom right */}
      <Fly
        style={{
          position: "absolute",
          bottom: "12%",
          right: "6%",
          transform: "rotate(120deg)",
          opacity: 0.3,
        }}
      />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo and branding */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo.jpeg"
            alt="OrganoAgil"
            width={120}
            height={120}
            className="rounded-full"
          />
          <h1
            className="text-3xl font-bold mt-4"
            style={{ color: "#b8960c" }}
          >
            OrganoAgil
          </h1>
          <p className="text-gray-400 mt-1 text-sm tracking-wide">
            Sistema de Gestao
          </p>
        </div>

        {/* Glass card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
                style={{ focusRingColor: "#b8960c" } as React.CSSProperties}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 0 2px #b8960c";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                }}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 0 2px #b8960c";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                }}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-2.5 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              style={{ backgroundColor: "#b8960c" }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = "#9a7d0a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#b8960c";
              }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
