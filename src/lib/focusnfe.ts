const BASE_URL_HOMOLOGACAO = "https://homologacao.focusnfe.com.br";
const BASE_URL_PRODUCAO = "https://api.focusnfe.com.br";

function getConfig() {
  const token = process.env.FOCUS_NFE_TOKEN;
  const env = process.env.FOCUS_NFE_ENV || "homologacao";
  if (!token) {
    throw new Error("FOCUS_NFE_TOKEN não configurado");
  }
  const baseUrl = env === "producao" ? BASE_URL_PRODUCAO : BASE_URL_HOMOLOGACAO;
  const auth = "Basic " + Buffer.from(`${token}:`).toString("base64");
  return { baseUrl, auth };
}

export interface FocusNFeItem {
  numero_item: number;
  codigo_produto: string;
  descricao: string;
  cfop: string;
  unidade_comercial: string;
  quantidade_comercial: number;
  valor_unitario_comercial: number;
  valor_bruto: number;
  unidade_tributavel: string;
  quantidade_tributavel: number;
  valor_unitario_tributavel: number;
  codigo_ncm: string;
  codigo_cest?: string;
  icms_origem: string;
  icms_situacao_tributaria: string; // CSOSN (Simples Nacional)
  pis_situacao_tributaria: string;
  cofins_situacao_tributaria: string;
}

export interface FocusNFePayload {
  natureza_operacao: string;
  data_emissao: string;
  data_entrada_saida?: string;
  tipo_documento: number; // 0=entrada, 1=saida
  finalidade_emissao: number; // 1=normal
  cnpj_emitente: string;
  nome_emitente: string;
  nome_fantasia_emitente?: string;
  logradouro_emitente: string;
  numero_emitente: string;
  bairro_emitente: string;
  municipio_emitente: string;
  uf_emitente: string;
  cep_emitente: string;
  inscricao_estadual_emitente: string;
  regime_tributario_emitente: number; // 1=Simples Nacional

  cnpj_destinatario?: string;
  cpf_destinatario?: string;
  nome_destinatario: string;
  logradouro_destinatario?: string;
  numero_destinatario?: string;
  bairro_destinatario?: string;
  municipio_destinatario?: string;
  uf_destinatario?: string;
  cep_destinatario?: string;
  indicador_inscricao_estadual_destinatario: string; // 1/2/9
  inscricao_estadual_destinatario?: string;
  email_destinatario?: string;

  modalidade_frete: number; // 9 = sem frete
  valor_frete?: number;
  valor_desconto?: number;
  presenca_comprador: number; // 9 = não se aplica (operação não presencial)

  items: FocusNFeItem[];
}

export interface FocusNFeResponse {
  ref?: string;
  status?: string;
  status_sefaz?: string;
  mensagem_sefaz?: string;
  numero?: string;
  serie?: string;
  chave_nfe?: string;
  caminho_xml_nota_fiscal?: string;
  caminho_danfe?: string;
  caminho_cancelamento?: string;
  data_emissao?: string;
  codigo?: string;
  mensagem?: string;
  erros?: Array<{ codigo: string; mensagem: string }>;
}

type FocusNFeRaw = FocusNFeResponse & { httpStatus: number; rawBody: string };

async function parseFocusResponse(res: Response): Promise<FocusNFeRaw> {
  const text = await res.text();
  let data: Record<string, unknown> = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }
  const rawBody = text.slice(0, 4000);
  return { httpStatus: res.status, rawBody, ...data };
}

export async function emitirNFe(
  ref: string,
  payload: FocusNFePayload
): Promise<FocusNFeRaw> {
  const { baseUrl, auth } = getConfig();
  const res = await fetch(`${baseUrl}/v2/nfe?ref=${encodeURIComponent(ref)}`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const parsed = await parseFocusResponse(res);
  if (!res.ok) {
    console.error("[FocusNFe] emitir falhou", {
      httpStatus: parsed.httpStatus,
      ref,
      body: parsed.rawBody,
    });
    return { ...parsed, status: parsed.status || "erro" };
  }
  console.log("[FocusNFe] emitir retorno", {
    httpStatus: parsed.httpStatus,
    ref,
    status: parsed.status,
    mensagem_sefaz: parsed.mensagem_sefaz,
  });
  return parsed;
}

export async function consultarNFe(ref: string): Promise<FocusNFeRaw> {
  const { baseUrl, auth } = getConfig();
  const res = await fetch(`${baseUrl}/v2/nfe/${encodeURIComponent(ref)}`, {
    headers: { Authorization: auth },
  });
  const parsed = await parseFocusResponse(res);
  console.log("[FocusNFe] consultar retorno", {
    httpStatus: parsed.httpStatus,
    ref,
    status: parsed.status,
    mensagem_sefaz: parsed.mensagem_sefaz,
  });
  return parsed;
}

export async function cancelarNFe(
  ref: string,
  justificativa: string
): Promise<FocusNFeRaw> {
  const { baseUrl, auth } = getConfig();
  const res = await fetch(`${baseUrl}/v2/nfe/${encodeURIComponent(ref)}`, {
    method: "DELETE",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({ justificativa }),
  });
  const parsed = await parseFocusResponse(res);
  console.log("[FocusNFe] cancelar retorno", {
    httpStatus: parsed.httpStatus,
    ref,
    status: parsed.status,
  });
  return parsed;
}

async function fetchFocusArquivo(caminho: string, auth: string, baseUrl: string) {
  const url = caminho.startsWith("http") ? caminho : `${baseUrl}${caminho}`;
  const res = await fetch(url, { headers: { Authorization: auth } });
  if (!res.ok) return null;
  return res;
}

export async function baixarDanfe(ref: string): Promise<ArrayBuffer | null> {
  const { baseUrl, auth } = getConfig();
  const meta = await fetch(`${baseUrl}/v2/nfe/${encodeURIComponent(ref)}`, {
    headers: { Authorization: auth },
  });
  if (!meta.ok) return null;
  const data = (await meta.json().catch(() => null)) as { caminho_danfe?: string } | null;
  if (!data?.caminho_danfe) return null;
  const pdf = await fetchFocusArquivo(data.caminho_danfe, auth, baseUrl);
  if (!pdf) return null;
  return await pdf.arrayBuffer();
}

export async function baixarXml(ref: string): Promise<string | null> {
  const { baseUrl, auth } = getConfig();
  const meta = await fetch(`${baseUrl}/v2/nfe/${encodeURIComponent(ref)}`, {
    headers: { Authorization: auth },
  });
  if (!meta.ok) return null;
  const data = (await meta.json().catch(() => null)) as { caminho_xml_nota_fiscal?: string } | null;
  if (!data?.caminho_xml_nota_fiscal) return null;
  const xml = await fetchFocusArquivo(data.caminho_xml_nota_fiscal, auth, baseUrl);
  if (!xml) return null;
  return await xml.text();
}
