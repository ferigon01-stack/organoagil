"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Award,
  Bug,
  Check,
  Heart,
  Home,
  Leaf,
  Loader2,
  Minus,
  PawPrint,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Timer,
  X,
} from "lucide-react";

function SprayBottle({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 100 200"
      width="100"
      height="200"
      aria-hidden={true}
    >
      <defs>
        <linearGradient id="bottleBody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e8e8e8" />
          <stop offset="20%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#fafafa" />
          <stop offset="100%" stopColor="#d8d8d8" />
        </linearGradient>
        <linearGradient id="triggerGreen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0f2e1a" />
          <stop offset="50%" stopColor="#2d6b3f" />
          <stop offset="100%" stopColor="#0f2e1a" />
        </linearGradient>
        <linearGradient id="labelDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f2e1a" />
          <stop offset="100%" stopColor="#1a4d2e" />
        </linearGradient>
      </defs>

      {/* gatilho/cabeça branca */}
      <path
        d="M40 8 Q34 10 34 22 L34 34 L62 34 L62 22 Q62 10 56 8 Z"
        fill="url(#bottleBody)"
        stroke="#0f2e1a"
        strokeWidth="0.8"
      />
      {/* bocal/tampa */}
      <rect x="44" y="2" width="12" height="8" fill="url(#bottleBody)" stroke="#0f2e1a" strokeWidth="0.6" rx="1" />
      {/* gatilho lateral verde */}
      <path
        d="M34 18 L 18 24 Q 12 26 12 32 L 12 38 Q 12 42 16 44 L 26 42 L 34 38 Z"
        fill="url(#triggerGreen)"
        stroke="#0a1f12"
        strokeWidth="0.6"
      />
      {/* bocal preto na ponta do gatilho */}
      <rect x="10" y="30" width="4" height="6" fill="#1a1a1a" rx="0.5" />

      {/* anel verde do gargalo */}
      <rect x="30" y="34" width="40" height="10" fill="url(#triggerGreen)" stroke="#0a1f12" strokeWidth="0.6" />
      {/* nervuras do anel */}
      <line x1="34" y1="36" x2="34" y2="42" stroke="#0a1f12" strokeWidth="0.4" opacity="0.6" />
      <line x1="40" y1="36" x2="40" y2="42" stroke="#0a1f12" strokeWidth="0.4" opacity="0.6" />
      <line x1="46" y1="36" x2="46" y2="42" stroke="#0a1f12" strokeWidth="0.4" opacity="0.6" />
      <line x1="52" y1="36" x2="52" y2="42" stroke="#0a1f12" strokeWidth="0.4" opacity="0.6" />
      <line x1="58" y1="36" x2="58" y2="42" stroke="#0a1f12" strokeWidth="0.4" opacity="0.6" />
      <line x1="64" y1="36" x2="64" y2="42" stroke="#0a1f12" strokeWidth="0.4" opacity="0.6" />

      {/* corpo da garrafa (alongado, ombros suaves) */}
      <path
        d="M28 44 Q 22 50 22 60 L 22 178 Q 22 192 36 192 L 64 192 Q 78 192 78 178 L 78 60 Q 78 50 72 44 Z"
        fill="url(#bottleBody)"
        stroke="#0f2e1a"
        strokeWidth="1"
      />

      {/* rótulo verde com bordas douradas */}
      <rect x="24" y="72" width="52" height="76" fill="url(#labelDark)" stroke="#b8960c" strokeWidth="1.5" />
      <rect x="26" y="74" width="48" height="72" fill="none" stroke="#d4b23a" strokeWidth="0.4" opacity="0.7" />
      {/* faixas douradas */}
      <rect x="24" y="70" width="52" height="2" fill="#b8960c" />
      <rect x="24" y="148" width="52" height="2" fill="#b8960c" />

      {/* logo Organo Ágil mini (folha estilizada) */}
      <g transform="translate(50,84)">
        <circle r="5" fill="#fafafa" />
        <path d="M -2 -1 Q 0 -3 2 -1 Q 1 1 0 0 Q -1 1 -2 -1 Z" fill="#1a4d2e" />
        <path d="M 0 0 L 1 2" stroke="#b8960c" strokeWidth="0.6" />
      </g>
      <text x="50" y="98" textAnchor="middle" fill="#fafafa" fontSize="2.6" fontFamily="system-ui, sans-serif" fontWeight="700" letterSpacing="0.2">
        Organo Ágil
      </text>

      {/* faixa dourada com BIOGUARD */}
      <rect x="28" y="102" width="44" height="14" fill="#b8960c" />
      <text
        x="50"
        y="113"
        textAnchor="middle"
        fill="#0f2e1a"
        fontSize="9"
        fontWeight="900"
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.5"
      >
        BIOGUARD
      </text>

      {/* descrição */}
      <text x="50" y="122" textAnchor="middle" fill="#fafafa" fontSize="2.5" fontFamily="system-ui, sans-serif" letterSpacing="0.1">
        INSETICIDA HÍBRIDO
      </text>
      <text x="50" y="126" textAnchor="middle" fill="#fafafa" fontSize="2.5" fontFamily="system-ui, sans-serif" letterSpacing="0.1">
        DE AÇÃO AMPLA
      </text>

      {/* 3 selos dourados de insetos */}
      <g>
        <circle cx="36" cy="135" r="3.2" fill="#b8960c" />
        <circle cx="50" cy="135" r="3.2" fill="#b8960c" />
        <circle cx="64" cy="135" r="3.2" fill="#b8960c" />
        <text x="36" y="137" textAnchor="middle" fill="#0f2e1a" fontSize="3.5">🐜</text>
        <text x="50" y="137" textAnchor="middle" fill="#0f2e1a" fontSize="3.5">🦟</text>
        <text x="64" y="137" textAnchor="middle" fill="#0f2e1a" fontSize="3.5">🪳</text>
      </g>

      {/* tagline embaixo */}
      <text x="50" y="146" textAnchor="middle" fill="#d4b23a" fontSize="2.3" fontFamily="system-ui, sans-serif">
        Proteção inteligente
      </text>

      {/* selos pretos abaixo do rótulo */}
      <text x="50" y="158" textAnchor="middle" fill="#0f2e1a" fontSize="2.2" fontFamily="system-ui, sans-serif" fontWeight="700">
        500ml · citronela
      </text>

      {/* highlight lateral */}
      <rect x="26" y="48" width="3" height="138" fill="#ffffff" opacity="0.5" rx="1" />
      <rect x="71" y="48" width="2" height="138" fill="#000000" opacity="0.08" rx="1" />
    </svg>
  );
}

function Fly({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      className={className}
      style={style}
      width="36"
      height="32"
      viewBox="0 0 60 50"
      fill="none"
      aria-hidden={true}
    >
      {/* asa esquerda */}
      <path
        d="M28 18 C 14 8, 4 12, 2 22 C 4 28, 16 26, 28 22 Z"
        fill="rgba(220,220,220,0.25)"
        stroke="currentColor"
        strokeWidth="0.6"
      />
      <path
        d="M8 16 Q 18 18, 24 22 M 6 22 Q 16 22, 24 22 M 10 26 Q 18 25, 24 22"
        stroke="currentColor"
        strokeWidth="0.4"
        fill="none"
        opacity="0.7"
      />
      {/* asa direita */}
      <path
        d="M32 18 C 46 8, 56 12, 58 22 C 56 28, 44 26, 32 22 Z"
        fill="rgba(220,220,220,0.25)"
        stroke="currentColor"
        strokeWidth="0.6"
      />
      <path
        d="M52 16 Q 42 18, 36 22 M 54 22 Q 44 22, 36 22 M 50 26 Q 42 25, 36 22"
        stroke="currentColor"
        strokeWidth="0.4"
        fill="none"
        opacity="0.7"
      />
      {/* tórax */}
      <ellipse cx="30" cy="22" rx="6" ry="5" fill="currentColor" />
      {/* abdômen segmentado */}
      <ellipse cx="30" cy="33" rx="7" ry="9" fill="currentColor" />
      <path
        d="M24 29 Q 30 30, 36 29 M 24 33 Q 30 34, 36 33 M 25 37 Q 30 38, 35 37"
        stroke="rgba(220,220,220,0.4)"
        strokeWidth="0.6"
        fill="none"
      />
      {/* cabeça */}
      <ellipse cx="30" cy="13" rx="5" ry="4.5" fill="currentColor" />
      {/* olhos */}
      <ellipse cx="27" cy="12" rx="2" ry="2.5" fill="#5b1a1a" />
      <ellipse cx="33" cy="12" rx="2" ry="2.5" fill="#5b1a1a" />
      <circle cx="26.5" cy="11.5" r="0.5" fill="#fff" opacity="0.7" />
      <circle cx="32.5" cy="11.5" r="0.5" fill="#fff" opacity="0.7" />
      {/* antenas */}
      <path
        d="M28 9 Q 27 6, 26 4 M 32 9 Q 33 6, 34 4"
        stroke="currentColor"
        strokeWidth="0.7"
        fill="none"
        strokeLinecap="round"
      />
      {/* pernas */}
      <path
        d="M26 24 L 20 30 L 18 35 M 27 26 L 22 33 L 20 39 M 28 27 L 24 36 L 23 42"
        stroke="currentColor"
        strokeWidth="0.8"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M34 24 L 40 30 L 42 35 M 33 26 L 38 33 L 40 39 M 32 27 L 36 36 L 37 42"
        stroke="currentColor"
        strokeWidth="0.8"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface ProdutoLoja {
  id: string;
  nome: string;
  descricao: string | null;
  precoVenda: number;
  unidade: string;
  imagemUrl: string | null;
}

interface Props {
  influencer: {
    slug: string;
    nome: string;
    fotoUrl: string | null;
    descontoPct: number;
  };
  produtos: ProdutoLoja[];
}

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatTelefone(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatCep(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export default function StoreClient({ influencer, produtos }: Props) {
  const pageRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!pageRef.current) return;
    const targets = pageRef.current.querySelectorAll<HTMLElement>("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-revealed", "true");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 220);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [carrinho, setCarrinho] = useState<Record<string, number>>({});
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [cepNotFound, setCepNotFound] = useState(false);

  async function consultarCep(cepRaw: string) {
    const digits = cepRaw.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setBuscandoCep(true);
    setCepNotFound(false);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) {
        setCepNotFound(true);
        return;
      }
      setEndereco(data.logradouro || "");
      setBairro(data.bairro || "");
      setCidade(data.localidade || "");
      setEstado((data.uf || "").toUpperCase());
    } catch {
      setCepNotFound(true);
    } finally {
      setBuscandoCep(false);
    }
  }

  const itens = useMemo(
    () =>
      produtos
        .map((p) => ({ produto: p, quantidade: carrinho[p.id] || 0 }))
        .filter((i) => i.quantidade > 0),
    [carrinho, produtos]
  );
  const subtotal = itens.reduce(
    (sum, i) => sum + i.produto.precoVenda * i.quantidade,
    0
  );
  const descontoPct = Math.max(0, Math.min(100, influencer.descontoPct || 0));
  const desconto =
    descontoPct > 0
      ? Number(((subtotal * descontoPct) / 100).toFixed(2))
      : 0;
  const total = Math.max(0, subtotal - desconto);
  const totalItens = itens.reduce((sum, i) => sum + i.quantidade, 0);
  const temDesconto = descontoPct > 0;

  function incrementar(id: string) {
    setCarrinho((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }
  function decrementar(id: string) {
    setCarrinho((prev) => {
      const atual = prev[id] || 0;
      if (atual <= 1) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: atual - 1 };
    });
  }

  async function handleEnviarPedido(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const res = await fetch("/api/loja/pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: influencer.slug,
          cliente: {
            nome,
            telefone,
            cep,
            endereco,
            numero,
            complemento,
            bairro,
            cidade,
            estado,
          },
          observacoes,
          itens: itens.map((i) => ({
            produtoId: i.produto.id,
            quantidade: i.quantidade,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error || "Erro ao enviar pedido.");
        setEnviando(false);
        return;
      }
      if (data.whatsappUrl) {
        window.location.href = data.whatsappUrl;
      } else {
        setErro(
          "Pedido criado, mas o link do WhatsApp não está configurado. Entre em contato com o vendedor."
        );
        setEnviando(false);
      }
    } catch {
      setErro("Erro de conexão. Tente novamente.");
      setEnviando(false);
    }
  }

  return (
    <div
      ref={pageRef}
      className={`pb-32 bg-[#0a1f12] ${scrolled ? "scrolled" : ""}`}
    >
      <div className="fly-zone" aria-hidden={true}>
        <Fly className="fly fly-target target-r1" />
        <Fly className="fly fly-target target-r2" />
        <Fly className="fly fly-target target-r3" />
        <Fly className="fly fly-target-left target-l1" />
        <Fly className="fly fly-target-left target-l2" />
        <Fly className="fly fly-target-left target-l3" />
      </div>
      <div className="spray-zone spray-zone-right" aria-hidden={true}>
        <SprayBottle className="spray-bottle" />
        <span className="droplet droplet-1" />
        <span className="droplet droplet-2" />
        <span className="droplet droplet-3" />
        <span className="droplet droplet-4" />
        <span className="droplet droplet-5" />
        <span className="droplet droplet-6" />
      </div>
      <div className="spray-zone spray-zone-left" aria-hidden={true}>
        <SprayBottle className="spray-bottle" />
        <span className="droplet droplet-1" />
        <span className="droplet droplet-2" />
        <span className="droplet droplet-3" />
        <span className="droplet droplet-4" />
        <span className="droplet droplet-5" />
        <span className="droplet droplet-6" />
      </div>
      <section
        className="relative text-white px-4 sm:px-6 pt-5 pb-14 sm:pt-6 sm:pb-24"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(15,46,26,0.62) 0%, rgba(10,31,18,0.55) 40%, rgba(10,31,18,0.94) 100%), url(/hero-cavalo.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="flex items-center gap-2.5">
          {influencer.fotoUrl ? (
            <Image
              src={influencer.fotoUrl}
              alt={influencer.nome}
              width={44}
              height={44}
              className="rounded-full ring-2 ring-[#d4b23a]/70 object-cover"
              style={{ height: 44, width: 44, objectPosition: "30% 30%" }}
            />
          ) : (
            <Image
              src="/logo.jpeg"
              alt="Organo Ágil"
              width={36}
              height={36}
              className="rounded-full ring-1 ring-[#d4b23a]/50"
            />
          )}
          <div className="leading-tight">
            <p className="text-[10px] uppercase tracking-wider text-[#d4b23a]">
              Você está comprando com
            </p>
            <h1 className="text-sm font-bold">{influencer.nome}</h1>
          </div>
        </div>

        <div
          data-reveal
          className="max-w-xl mx-auto text-center mt-10 sm:mt-14 relative"
        >
          <div
            aria-hidden
            className="absolute inset-0 -inset-x-4 sm:-inset-x-8 -inset-y-4 sm:-inset-y-6 rounded-3xl"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(10,31,18,0.85) 0%, rgba(10,31,18,0.55) 60%, rgba(10,31,18,0) 100%)",
            }}
          />
          <div className="relative">
            <p className="inline-flex items-center gap-1 bg-[#d4b23a]/20 text-[#e8c94a] text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full ring-1 ring-[#d4b23a]/40">
              <Sparkles size={12} /> Venda Exclusiva
            </p>
            <h2 className="mt-4 text-2xl sm:text-4xl font-extrabold leading-tight drop-shadow-lg">
              Proteção contra insetos{" "}
              <span className="text-[#e8c94a]">de verdade</span>, sem
              complicação.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-white/85 max-w-md mx-auto">
              Eficaz contra todos os invertebrados — com ação imediata e
              residual de até 3 dias.
            </p>
          </div>
        </div>
      </section>

      <section
        data-reveal
        className="px-4 sm:px-6 py-8"
        style={{ backgroundColor: "#ede4cc" }}
      >
        <div className="max-w-2xl mx-auto grid grid-cols-3 gap-3 sm:gap-4 text-center">
          {[
            { Icon: Award, l1: "Melhor", l2: "custo-benefício" },
            { Icon: Leaf, l1: "Tecnologia", l2: "orgânica" },
            { Icon: ShieldCheck, l1: "Uso", l2: "doméstico" },
          ].map(({ Icon, l1, l2 }, idx) => (
            <div
              key={l1}
              data-reveal={idx === 0 ? "left" : idx === 2 ? "right" : "up"}
              style={{ ["--reveal-delay" as string]: `${idx * 120}ms` }}
              className="flex flex-col items-center gap-2"
            >
              <div
                className="rounded-full flex items-center justify-center"
                style={{
                  width: 60,
                  height: 60,
                  background:
                    "radial-gradient(circle at 30% 30%, #e8c94a, #8a6e0a)",
                  border: "2px solid #ede4cc",
                  boxShadow:
                    "0 0 0 2px #b8960c, 0 6px 14px rgba(138,110,10,0.25)",
                }}
              >
                <Icon size={24} className="text-white drop-shadow" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-[#1a4d2e] leading-tight uppercase tracking-wide">
                {l1}
                <br />
                {l2}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section
        className="px-4 sm:px-6 py-14 sm:py-20"
        style={{ backgroundColor: "#0a1f12" }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <div data-reveal>
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="h-px w-12 bg-[#d4b23a]/40" />
              <Sparkles size={14} className="text-[#d4b23a]" />
              <span className="h-px w-12 bg-[#d4b23a]/40" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Pra quem é o <span className="text-[#e8c94a]">BioGuard</span>
            </h3>
            <p className="text-white/60 text-sm mt-2 max-w-md mx-auto">
              Pensado pra proteger quem mais importa, sem agredir.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8">
            {[
              { Icon: PawPrint, label: "Pets" },
              { Icon: Home, label: "Sua casa" },
              { Icon: Heart, label: "Família" },
              { Icon: Leaf, label: "Plantação" },
            ].map(({ Icon, label }, idx) => (
              <div
                key={label}
                data-reveal={idx % 2 === 0 ? "left" : "right"}
                className="rounded-2xl border border-[#d4b23a]/30 px-3 py-5 sm:py-6"
                style={{
                  backgroundColor: "rgba(15,46,26,0.7)",
                  ["--reveal-delay" as string]: `${idx * 110}ms`,
                }}
              >
                <Icon
                  size={28}
                  className="mx-auto text-[#e8c94a]"
                  strokeWidth={1.5}
                />
                <p className="mt-3 text-sm font-bold text-white uppercase tracking-wide">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="px-4 sm:px-6 py-14 sm:py-20"
        style={{ backgroundColor: "#ede4cc" }}
      >
        <div className="max-w-2xl mx-auto">
          <div data-reveal className="text-center mb-8">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#b8960c]">
              Por que escolher
            </span>
            <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#0a1f12]">
              Tecnologia que cuida de quem você ama
            </h3>
          </div>

          <ul className="space-y-3">
            {[
              {
                Icon: Timer,
                title: "Ação imediata + residual de 3 dias",
                desc: "Mata na hora e continua protegendo enquanto você cuida da rotina.",
              },
              {
                Icon: Bug,
                title: "Eficaz contra todos os invertebrados",
                desc: "Mosquitos, baratas, formigas, aranhas, pulgas — tudo num só produto.",
              },
              {
                Icon: Leaf,
                title: "Tecnologia orgânica",
                desc: "Aroma de citronela, sem cheiro tóxico. Respeitoso com pets e crianças.",
              },
              {
                Icon: Award,
                title: "Melhor custo-benefício do mercado",
                desc: "Você protege a casa toda gastando menos do que com vários produtos diferentes.",
              },
            ].map(({ Icon, title, desc }, idx) => (
              <li
                key={title}
                data-reveal={idx % 2 === 0 ? "left" : "right"}
                className="flex gap-3 sm:gap-4 rounded-xl p-4 sm:p-5 bg-white border border-[#c9b988]/50 shadow-sm"
                style={{ ["--reveal-delay" as string]: `${idx * 110}ms` }}
              >
                <div
                  className="shrink-0 rounded-full flex items-center justify-center"
                  style={{
                    width: 44,
                    height: 44,
                    background:
                      "radial-gradient(circle at 30% 30%, #e8c94a, #8a6e0a)",
                  }}
                >
                  <Icon size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-[#0a1f12] text-sm sm:text-base flex items-center gap-2">
                    <Check size={14} className="text-[#b8960c]" />
                    {title}
                  </p>
                  <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <main
        data-reveal
        className="px-4 sm:px-6 pt-14 sm:pt-20 pb-10"
        style={{ backgroundColor: "#0a1f12" }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#d4b23a]">
              Garanta o seu
            </span>
            <h3 className="mt-1 text-2xl sm:text-3xl font-extrabold text-white">
              Proteção começa aqui
            </h3>
          </div>
        {produtos.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">
              Nenhum produto disponível no momento.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {produtos.map((produto) => {
              const quantidade = carrinho[produto.id] || 0;
              return (
                <article
                  key={produto.id}
                  className="bg-white rounded-2xl border-2 border-[#c9b988]/70 overflow-hidden shadow-lg"
                >
                  {produto.imagemUrl ? (
                    <div
                      className="relative w-full"
                      style={{
                        height: "min(72vh, 560px)",
                        background:
                          "linear-gradient(to bottom, #ffffff, #f5f0e1)",
                      }}
                    >
                      <Image
                        src={produto.imagemUrl}
                        alt={produto.nome}
                        fill
                        className="object-contain p-2 sm:p-3"
                        sizes="(max-width: 640px) 100vw, 600px"
                        priority
                      />
                    </div>
                  ) : null}
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xl font-extrabold text-[#1a4d2e] uppercase tracking-tight">
                        {produto.nome}
                      </h3>
                      {temDesconto && (
                        <span className="shrink-0 bg-[#b8960c] text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                          {descontoPct.toFixed(0)}% OFF
                        </span>
                      )}
                    </div>
                    {produto.descricao && (
                      <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                        {produto.descricao}
                      </p>
                    )}
                    {temDesconto && (
                      <p className="text-xs text-[#b8960c] font-semibold mt-2">
                        Desconto exclusivo via {influencer.nome}
                      </p>
                    )}
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] text-gray-500 uppercase tracking-wider">
                          {temDesconto ? "A partir de" : "A partir de"}
                        </p>
                        {temDesconto ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-base text-gray-400 line-through">
                              {formatBRL(produto.precoVenda)}
                            </span>
                            <span className="text-3xl font-extrabold text-[#1a4d2e]">
                              {formatBRL(
                                produto.precoVenda * (1 - descontoPct / 100)
                              )}
                            </span>
                          </div>
                        ) : (
                          <span className="text-3xl font-extrabold text-[#1a4d2e]">
                            {formatBRL(produto.precoVenda)}
                          </span>
                        )}
                      </div>
                      {quantidade === 0 ? (
                        <button
                          onClick={() => incrementar(produto.id)}
                          className="bg-[#1a4d2e] hover:bg-[#2d6b3f] text-white px-5 py-2.5 rounded-full font-medium transition-colors flex items-center gap-2"
                        >
                          <Plus size={18} />
                          Adicionar
                        </button>
                      ) : (
                        <div className="flex items-center gap-3 bg-[#1a4d2e] text-white rounded-full px-2 py-1">
                          <button
                            onClick={() => decrementar(produto.id)}
                            className="p-1.5 hover:bg-[#2d6b3f] rounded-full transition-colors"
                            aria-label="Diminuir"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="font-bold min-w-[24px] text-center">
                            {quantidade}
                          </span>
                          <button
                            onClick={() => incrementar(produto.id)}
                            className="p-1.5 hover:bg-[#2d6b3f] rounded-full transition-colors"
                            aria-label="Aumentar"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-12 mb-2 text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="h-px w-16 bg-[#d4b23a]/40" />
            <PawPrint size={16} className="text-[#d4b23a]" />
            <span className="h-px w-16 bg-[#d4b23a]/40" />
          </div>
          <p className="text-lg sm:text-xl font-extrabold text-white">
            BioGuard:{" "}
            <span className="text-[#e8c94a]">
              proteção prática, resultado real.
            </span>
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#d4b23a]/30 bg-[#0f2e1a]/60">
            <PawPrint size={14} className="text-[#e8c94a]" />
            <span className="text-xs text-white/80 font-medium">
              Em parceria com{" "}
              <a
                href="https://www.instagram.com/petpraserfeliz_"
                target="_blank"
                rel="noreferrer"
                className="text-[#e8c94a] hover:underline"
              >
                @petpraserfeliz_
              </a>
            </span>
          </div>
          <p className="mt-5 text-xs text-white/40">
            Pedido feito direto pelo WhatsApp da Organo Ágil.
          </p>
        </div>
        </div>
      </main>

      {totalItens > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#d4b23a]/40 shadow-[0_-8px_24px_rgba(15,46,26,0.12)] px-4 py-3 sm:py-4">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <div className="flex-1">
              <p className="text-[11px] text-gray-500 uppercase tracking-wider">
                {totalItens} {totalItens === 1 ? "item" : "itens"} · Total
              </p>
              <div className="flex items-baseline gap-2">
                {temDesconto && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatBRL(subtotal)}
                  </span>
                )}
                <p className="text-xl font-extrabold text-[#1a4d2e]">
                  {formatBRL(total)}
                </p>
              </div>
              {temDesconto && (
                <p className="text-[10px] text-[#b8960c] font-semibold uppercase tracking-wide">
                  -{formatBRL(desconto)} via {influencer.nome}
                </p>
              )}
            </div>
            <button
              onClick={() => setCheckoutOpen(true)}
              className="bg-[#1a4d2e] hover:bg-[#2d6b3f] text-white px-6 py-3 rounded-full font-bold transition-colors flex items-center gap-2 shadow-md"
            >
              <ShoppingBag size={18} />
              Finalizar
            </button>
          </div>
        </div>
      )}

      {checkoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Seus dados</h3>
              <button
                onClick={() => setCheckoutOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEnviarPedido} className="p-5 space-y-4">
              <p className="text-sm text-gray-600">
                Preencha pra finalizar pelo WhatsApp. O pagamento e o frete são
                combinados direto com o vendedor.
              </p>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Nome completo *
                </span>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-[#1a4d2e] focus:ring-1 focus:ring-[#1a4d2e] outline-none"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  WhatsApp *
                </span>
                <input
                  type="tel"
                  required
                  inputMode="numeric"
                  placeholder="(11) 91234-5678"
                  value={telefone}
                  onChange={(e) => setTelefone(formatTelefone(e.target.value))}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-[#1a4d2e] focus:ring-1 focus:ring-[#1a4d2e] outline-none"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  CEP *
                </span>
                <div className="relative">
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    placeholder="00000-000"
                    value={cep}
                    onChange={(e) => {
                      const formatted = formatCep(e.target.value);
                      setCep(formatted);
                      if (formatted.replace(/\D/g, "").length === 8) {
                        consultarCep(formatted);
                      }
                    }}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 focus:border-[#1a4d2e] focus:ring-1 focus:ring-[#1a4d2e] outline-none"
                  />
                  {buscandoCep && (
                    <Loader2
                      size={18}
                      className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  )}
                </div>
                {cepNotFound && (
                  <span className="text-xs text-amber-600 mt-1 block">
                    CEP não encontrado. Preencha o endereço manualmente.
                  </span>
                )}
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Endereço (rua) *
                </span>
                <input
                  type="text"
                  required
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-[#1a4d2e] focus:ring-1 focus:ring-[#1a4d2e] outline-none"
                />
              </label>

              <div className="grid grid-cols-3 gap-3">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    Número *
                  </span>
                  <input
                    type="text"
                    required
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-[#1a4d2e] focus:ring-1 focus:ring-[#1a4d2e] outline-none"
                  />
                </label>
                <label className="block col-span-2">
                  <span className="text-sm font-medium text-gray-700">
                    Complemento
                  </span>
                  <input
                    type="text"
                    placeholder="apto, bloco..."
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-[#1a4d2e] focus:ring-1 focus:ring-[#1a4d2e] outline-none"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Bairro *
                </span>
                <input
                  type="text"
                  required
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-[#1a4d2e] focus:ring-1 focus:ring-[#1a4d2e] outline-none"
                />
              </label>

              <div className="grid grid-cols-3 gap-3">
                <label className="block col-span-2">
                  <span className="text-sm font-medium text-gray-700">
                    Cidade *
                  </span>
                  <input
                    type="text"
                    required
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-[#1a4d2e] focus:ring-1 focus:ring-[#1a4d2e] outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">UF *</span>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={estado}
                    onChange={(e) =>
                      setEstado(e.target.value.toUpperCase().slice(0, 2))
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 uppercase focus:border-[#1a4d2e] focus:ring-1 focus:ring-[#1a4d2e] outline-none"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Observação (opcional)
                </span>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={2}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-[#1a4d2e] focus:ring-1 focus:ring-[#1a4d2e] outline-none resize-none"
                />
              </label>

              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p className="font-medium text-gray-700 mb-2">Resumo</p>
                {itens.map((i) => (
                  <div
                    key={i.produto.id}
                    className="flex justify-between text-gray-600"
                  >
                    <span>
                      {i.quantidade}x {i.produto.nome}
                    </span>
                    <span>
                      {formatBRL(i.quantidade * i.produto.precoVenda)}
                    </span>
                  </div>
                ))}
                {temDesconto && (
                  <>
                    <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>{formatBRL(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[#b8960c] font-semibold">
                      <span>
                        Desconto via {influencer.nome} ({descontoPct.toFixed(0)}%)
                      </span>
                      <span>-{formatBRL(desconto)}</span>
                    </div>
                  </>
                )}
                <div
                  className={`${
                    temDesconto ? "" : "border-t border-gray-200 mt-2 pt-2"
                  } flex justify-between font-bold text-gray-900`}
                >
                  <span>Total</span>
                  <span>{formatBRL(total)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Frete a combinar via WhatsApp.
                </p>
              </div>

              {erro && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">
                  {erro}
                </p>
              )}

              <button
                type="submit"
                disabled={enviando}
                className="w-full bg-[#1a4d2e] hover:bg-[#2d6b3f] disabled:opacity-60 text-white py-3 rounded-full font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                {enviando ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Enviando...
                  </>
                ) : (
                  <>Enviar pedido pelo WhatsApp</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
