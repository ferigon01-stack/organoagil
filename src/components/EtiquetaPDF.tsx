"use client";

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "Inter",
  fonts: [
    { src: "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf", fontWeight: 400 },
    { src: "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf", fontWeight: 700 },
  ],
});

const dark = "#111827";
const LINE = `1.2pt solid ${dark}`;

// Etiqueta 150x100 mm (impressora térmica KNUP). 1mm = 2.83465pt.
const MM = 2.83465;
const LABEL_SIZE: [number, number] = [150 * MM, 100 * MM];

// Dados fixos do remetente (Organo Ágil) — mesmos usados na emissão da NFe.
const REMETENTE = {
  empresa: "ORGANOAGIL LTDA",
  cnpj: "63.512.791/0001-59",
  endereco: "Rua Benedito Rodrigues do Prado, 189 - Jardim do Prado",
  cidadeUf: "Araçatuba / SP",
  cep: "16025-390",
  telefone: "(18) 98115-7062",
};

const styles = StyleSheet.create({
  // tudo em negrito e preto — impressora térmica imprime fraco texto fino/cinza.
  page: { padding: 10, fontFamily: "Inter", color: dark, fontWeight: "bold" },
  outer: { flex: 1, border: LINE, borderRadius: 4 },

  // ---- Cabeçalho ----
  header: { flexDirection: "row", borderBottom: LINE },
  logoCell: {
    width: 96,
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
    borderRight: LINE,
  },
  logoImg: { width: 30, height: 30, borderRadius: 15, marginBottom: 2 },
  logoText: { fontSize: 10, fontWeight: "bold", color: dark },
  logoSub: { fontSize: 4, color: dark, marginTop: 1, textAlign: "center", fontWeight: "bold" },

  headerMid: { flex: 1 },
  topInfo: { flexDirection: "row", borderBottom: LINE },
  volumeCell: {
    width: 78,
    borderRight: LINE,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  volumeLabel: { fontSize: 6, fontWeight: "bold", letterSpacing: 1.5 },
  volumeValue: { fontSize: 19, fontWeight: "bold" },
  nfCell: { flex: 1, paddingHorizontal: 6, paddingVertical: 4, justifyContent: "center" },
  pedidoCell: { paddingHorizontal: 6, paddingVertical: 4 },

  qrCell: {
    width: 74,
    borderLeft: LINE,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  qrLabel: { fontSize: 4.5, fontWeight: "bold", marginBottom: 2, letterSpacing: 0.5 },
  qrImg: { width: 58, height: 58 },

  smallLabel: { fontSize: 5.5, fontWeight: "bold", color: dark, letterSpacing: 0.5 },
  smallValue: { fontSize: 9, fontWeight: "bold" },

  // ---- Remetente / Destinatário ----
  parties: { flexDirection: "row", borderBottom: LINE },
  party: { flex: 1, padding: 6 },
  partyLeft: { borderRight: LINE },
  partyTitle: { fontSize: 8.5, fontWeight: "bold", marginBottom: 4, letterSpacing: 0.5 },

  line: { flexDirection: "row", marginBottom: 2 },
  lineLabel: { fontSize: 6, fontWeight: "bold", color: dark, width: 50 },
  lineValue: { fontSize: 7, flex: 1, fontWeight: "bold" },
  blankLine: { flex: 1, borderBottom: `1pt solid ${dark}`, marginTop: 7, marginRight: 4 },

  // ---- Observações / Volume / Transporte ----
  bottom: { flexDirection: "row", flex: 1 },
  cell: { padding: 6 },
  cellTitle: { fontSize: 7.5, fontWeight: "bold", marginBottom: 4, letterSpacing: 0.5 },
  obsText: { fontSize: 6.5, color: dark, lineHeight: 1.3, fontWeight: "bold" },

  cuidado: { marginTop: 5, border: `1pt solid ${dark}`, borderRadius: 3, padding: 4 },
  cuidadoTitle: { fontSize: 6.5, fontWeight: "bold" },
  cuidadoText: { fontSize: 5, color: dark, marginTop: 1, lineHeight: 1.2, fontWeight: "bold" },
});

interface EtiquetaPedido {
  numero: number;
  pesoTotal: number;
  volumes: number;
  observacoes?: string;
  transportadora?: string | null;
  nfeNumero?: number | null;
  nfeChave?: string | null;
  nfeDataEmissao?: string | null;
  cliente: {
    nome: string;
    cpf?: string | null;
    cnpj?: string | null;
    telefone?: string | null;
    endereco?: string | null;
    numero?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    estado?: string | null;
    cep?: string | null;
  };
  itens: Array<{
    quantidade: number;
    produto: { nome: string; caixaDimensoes?: string | null };
  }>;
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

function Linha({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.line}>
      <Text style={styles.lineLabel}>{label}</Text>
      <Text style={styles.lineValue}>{value || "—"}</Text>
    </View>
  );
}

interface EtiquetaPDFProps {
  pedido: EtiquetaPedido;
  /** Data URL (PNG) do QR Code que aponta pra nota. */
  qrDataUrl?: string;
}

export default function EtiquetaPDF({ pedido, qrDataUrl }: EtiquetaPDFProps) {
  const totalVolumes = Math.max(1, pedido.volumes || 1);

  const destEndereco = [
    pedido.cliente.endereco,
    pedido.cliente.numero,
    pedido.cliente.bairro,
  ]
    .filter(Boolean)
    .join(", ");
  const destCidadeUf = [pedido.cliente.cidade, pedido.cliente.estado]
    .filter(Boolean)
    .join(" / ");
  const destDoc = pedido.cliente.cnpj || pedido.cliente.cpf || "";

  const conteudo = pedido.itens
    .map((item) => `${item.quantidade}x ${item.produto.nome}`)
    .join(", ");
  const dimensoes = pedido.itens
    .map((item) => item.produto.caixaDimensoes)
    .filter(Boolean)
    .join(" · ");

  // peso rateado por volume, pra somar igual ao cabeçalho da NFe.
  const pesoPorVolume = pedido.pesoTotal / totalVolumes;

  return (
    <Document>
      {Array.from({ length: totalVolumes }).map((_, i) => {
        const volumeNum = String(i + 1).padStart(2, "0");
        const volumeTotal = String(totalVolumes).padStart(2, "0");
        return (
          <Page key={i} size={LABEL_SIZE} style={styles.page}>
            <View style={styles.outer}>
              {/* ---- Cabeçalho ---- */}
              <View style={styles.header}>
                <View style={styles.logoCell}>
                  <Image src="https://organoagil.vercel.app/logo-bw.png" style={styles.logoImg} />
                  <Text style={styles.logoText}>Organo Ágil</Text>
                  <Text style={styles.logoSub}>Soluções que nutrem resultados.</Text>
                </View>

                <View style={styles.headerMid}>
                  <View style={styles.topInfo}>
                    <View style={styles.volumeCell}>
                      <Text style={styles.volumeLabel}>VOLUME</Text>
                      <Text style={styles.volumeValue}>
                        {volumeNum}/{volumeTotal}
                      </Text>
                    </View>
                    <View style={styles.nfCell}>
                      <Text style={styles.smallLabel}>Nº DA NF</Text>
                      <Text style={styles.smallValue}>{pedido.nfeNumero ?? "—"}</Text>
                      <Text style={[styles.smallLabel, { marginTop: 4 }]}>DATA DA EMISSÃO</Text>
                      <Text style={styles.smallValue}>{formatDate(pedido.nfeDataEmissao)}</Text>
                    </View>
                  </View>
                  <View style={styles.pedidoCell}>
                    <Text style={styles.smallLabel}>Nº DO PEDIDO / ORÇAMENTO</Text>
                    <Text style={styles.smallValue}>#{pedido.numero}</Text>
                  </View>
                </View>

                <View style={styles.qrCell}>
                  <Text style={styles.qrLabel}>CÓDIGO DA NF</Text>
                  {qrDataUrl ? (
                    <Image src={qrDataUrl} style={styles.qrImg} />
                  ) : (
                    <Text style={{ fontSize: 5 }}>—</Text>
                  )}
                </View>
              </View>

              {/* ---- Remetente / Destinatário ---- */}
              <View style={styles.parties}>
                <View style={[styles.party, styles.partyLeft]}>
                  <Text style={styles.partyTitle}>REMETENTE</Text>
                  <Linha label="Empresa:" value={REMETENTE.empresa} />
                  <Linha label="CNPJ:" value={REMETENTE.cnpj} />
                  <Linha label="Endereço:" value={REMETENTE.endereco} />
                  <Linha label="Cidade/UF:" value={REMETENTE.cidadeUf} />
                  <Linha label="CEP:" value={REMETENTE.cep} />
                  <Linha label="Telefone:" value={REMETENTE.telefone} />
                </View>
                <View style={styles.party}>
                  <Text style={styles.partyTitle}>DESTINATÁRIO</Text>
                  <Linha label="Nome:" value={pedido.cliente.nome} />
                  <Linha label={pedido.cliente.cnpj ? "CNPJ:" : "CPF:"} value={destDoc} />
                  <Linha label="Endereço:" value={destEndereco} />
                  <Linha label="Cidade/UF:" value={destCidadeUf} />
                  <Linha label="CEP:" value={pedido.cliente.cep || ""} />
                  <Linha label="Telefone:" value={pedido.cliente.telefone || ""} />
                </View>
              </View>

              {/* ---- Observações / Volume / Transporte ---- */}
              <View style={styles.bottom}>
                <View style={[styles.cell, styles.partyLeft, { width: "31%" }]}>
                  <Text style={styles.cellTitle}>OBSERVAÇÕES</Text>
                  <Text style={styles.obsText}>{pedido.observacoes || ""}</Text>
                </View>
                <View style={[styles.cell, styles.partyLeft, { flex: 1 }]}>
                  <Text style={styles.cellTitle}>INFORMAÇÕES DO VOLUME</Text>
                  <Linha label="Conteúdo:" value={conteudo} />
                  <Linha label="Peso bruto:" value={`${pesoPorVolume.toFixed(1)} Kg`} />
                  <Linha label="Dimensões:" value={dimensoes || ""} />
                </View>
                <View style={[styles.cell, { width: "31%" }]}>
                  <Text style={styles.cellTitle}>TRANSPORTE</Text>
                  <Linha label="Transp.:" value={pedido.transportadora || ""} />
                  <View style={styles.line}>
                    <Text style={styles.lineLabel}>Rastreio:</Text>
                    <View style={styles.blankLine} />
                  </View>
                  <View style={styles.cuidado}>
                    <Text style={styles.cuidadoTitle}>MANUSEAR COM CUIDADO</Text>
                    <Text style={styles.cuidadoText}>
                      Produto natural e de qualidade. Agradecemos o cuidado!
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </Page>
        );
      })}
    </Document>
  );
}
