import { NextRequest, NextResponse } from "next/server";

interface CnpjRaw {
  cnpj?: string;
  razao_social?: string;
  nome_fantasia?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  uf?: string;
  municipio?: string;
  codigo_municipio_ibge?: number;
  ddd_telefone_1?: string;
  ddd_telefone_2?: string;
  email?: string | null;
  cnae_fiscal?: number;
  cnae_fiscal_descricao?: string;
  descricao_situacao_cadastral?: string;
}

const UA = "organoagil/1.0 (+https://organoagil.vercel.app)";

async function fetchMinhaReceita(cnpj: string): Promise<CnpjRaw | null> {
  const res = await fetch(`https://minhareceita.org/${cnpj}`, {
    headers: { Accept: "application/json", "User-Agent": UA },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as CnpjRaw;
}

async function fetchBrasilAPI(cnpj: string): Promise<CnpjRaw | null> {
  const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
    headers: { Accept: "application/json", "User-Agent": UA },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as CnpjRaw;
}

function formatTelefone(raw: string | undefined) {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return digits;
}

function formatCep(raw: string | undefined) {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 8) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ cnpj: string }> }
) {
  const { cnpj } = await params;
  const digits = (cnpj || "").replace(/\D/g, "");

  if (digits.length !== 14) {
    return NextResponse.json(
      { error: "CNPJ precisa ter 14 dígitos" },
      { status: 400 }
    );
  }

  try {
    const data =
      (await fetchMinhaReceita(digits).catch(() => null)) ||
      (await fetchBrasilAPI(digits).catch(() => null));

    if (!data) {
      return NextResponse.json(
        { error: "CNPJ não encontrado ou fonte indisponível" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      razao_social: data.razao_social || "",
      nome_fantasia: data.nome_fantasia || "",
      endereco: data.logradouro || "",
      numero: data.numero || "",
      complemento: data.complemento || "",
      bairro: data.bairro || "",
      cep: formatCep(data.cep),
      cidade: data.municipio || "",
      estado: data.uf || "",
      codigo_ibge: data.codigo_municipio_ibge
        ? String(data.codigo_municipio_ibge)
        : "",
      telefone: formatTelefone(data.ddd_telefone_1),
      email: data.email || "",
      situacao: data.descricao_situacao_cadastral || "",
    });
  } catch (error) {
    console.error("Erro ao consultar CNPJ:", error);
    return NextResponse.json(
      { error: "Erro ao consultar CNPJ" },
      { status: 500 }
    );
  }
}
