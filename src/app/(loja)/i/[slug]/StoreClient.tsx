"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  Award,
  Leaf,
  Loader2,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";

interface ProdutoLoja {
  id: string;
  nome: string;
  descricao: string | null;
  precoVenda: number;
  unidade: string;
  imagemUrl: string | null;
}

interface Props {
  influencer: { slug: string; nome: string; fotoUrl: string | null };
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
  const total = itens.reduce(
    (sum, i) => sum + i.produto.precoVenda * i.quantidade,
    0
  );
  const totalItens = itens.reduce((sum, i) => sum + i.quantidade, 0);

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
    <div className="pb-32 bg-[#fbf9f2]">
      <section
        className="relative text-white px-4 sm:px-6 pt-5 pb-12 sm:pt-6 sm:pb-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,46,26,0.72), rgba(15,46,26,0.88)), url(/hero-bioguard.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
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

        <div className="max-w-2xl mx-auto text-center mt-10 sm:mt-14">
          <p className="inline-flex items-center gap-1 bg-[#d4b23a]/15 text-[#e8c94a] text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
            <Sparkles size={12} /> Venda Exclusiva
          </p>
          <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold leading-tight">
            Proteção contra insetos{" "}
            <span className="text-[#e8c94a]">de verdade</span>, sem complicação.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-white/80 max-w-md mx-auto">
            Eficaz contra todos os invertebrados — com ação imediata e residual
            de até 3 dias.
          </p>
        </div>
      </section>

      <section className="bg-white border-y border-[#e8d9a8]/40 px-4 sm:px-6 py-4">
        <div className="max-w-2xl mx-auto grid grid-cols-3 gap-2 text-center">
          <div className="flex flex-col items-center gap-1">
            <Award size={20} className="text-[#b8960c]" />
            <span className="text-[11px] sm:text-xs font-semibold text-[#1a4d2e] leading-tight">
              Melhor
              <br />
              custo-benefício
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Leaf size={20} className="text-[#b8960c]" />
            <span className="text-[11px] sm:text-xs font-semibold text-[#1a4d2e] leading-tight">
              Tecnologia
              <br />
              orgânica
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck size={20} className="text-[#b8960c]" />
            <span className="text-[11px] sm:text-xs font-semibold text-[#1a4d2e] leading-tight">
              Uso
              <br />
              doméstico
            </span>
          </div>
        </div>
      </section>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-6">
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
                  className="bg-white rounded-2xl border border-[#e8d9a8]/60 overflow-hidden shadow-md"
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
                    <h3 className="text-xl font-extrabold text-[#1a4d2e] uppercase tracking-tight">
                      {produto.nome}
                    </h3>
                    {produto.descricao && (
                      <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                        {produto.descricao}
                      </p>
                    )}
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] text-gray-500 uppercase tracking-wider">
                          A partir de
                        </p>
                        <span className="text-3xl font-extrabold text-[#1a4d2e]">
                          {formatBRL(produto.precoVenda)}
                        </span>
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

        <div className="mt-8 mb-2 text-center">
          <p className="text-base sm:text-lg font-bold text-[#1a4d2e]">
            BioGuard:{" "}
            <span className="text-[#b8960c]">
              proteção prática, resultado real.
            </span>
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Pedido feito direto pelo WhatsApp da Organo Ágil.
          </p>
        </div>
      </main>

      {totalItens > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#d4b23a]/40 shadow-[0_-8px_24px_rgba(15,46,26,0.12)] px-4 py-3 sm:py-4">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <div className="flex-1">
              <p className="text-[11px] text-gray-500 uppercase tracking-wider">
                {totalItens} {totalItens === 1 ? "item" : "itens"} · Total
              </p>
              <p className="text-xl font-extrabold text-[#1a4d2e]">
                {formatBRL(total)}
              </p>
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
                <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-bold text-gray-900">
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
