"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZ9hiA.woff2", fontWeight: 700 },
  ],
});

const green = "#1a4d2e";
const gold = "#b8960c";
const gray = "#6b7280";
const lightGray = "#f3f4f6";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Inter", color: "#1f2937" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, borderBottom: 2, borderBottomColor: green, paddingBottom: 15 },
  logo: { fontSize: 22, fontWeight: "bold", color: green },
  logoSub: { fontSize: 9, color: gray, marginTop: 2 },
  pedidoNum: { fontSize: 16, fontWeight: "bold", color: green, textAlign: "right" },
  pedidoDate: { fontSize: 9, color: gray, textAlign: "right", marginTop: 2 },
  fase: { fontSize: 10, color: gold, fontWeight: "bold", textAlign: "right", marginTop: 4 },
  section: { marginBottom: 15 },
  sectionTitle: { fontSize: 12, fontWeight: "bold", color: green, marginBottom: 8, borderBottom: 1, borderBottomColor: "#e5e7eb", paddingBottom: 4 },
  row: { flexDirection: "row", gap: 4 },
  label: { fontSize: 9, color: gray, width: 80 },
  value: { fontSize: 10, flex: 1 },
  table: { marginTop: 5 },
  tableHeader: { flexDirection: "row", backgroundColor: green, color: "white", padding: 6, fontSize: 9, fontWeight: "bold" },
  tableRow: { flexDirection: "row", padding: 6, fontSize: 9, borderBottom: 1, borderBottomColor: "#e5e7eb" },
  tableRowAlt: { flexDirection: "row", padding: 6, fontSize: 9, borderBottom: 1, borderBottomColor: "#e5e7eb", backgroundColor: lightGray },
  col1: { width: "35%" },
  col2: { width: "10%", textAlign: "center" },
  col3: { width: "15%", textAlign: "right" },
  col4: { width: "20%", textAlign: "right" },
  col5: { width: "20%", textAlign: "right" },
  totals: { marginTop: 10, alignItems: "flex-end" },
  totalRow: { flexDirection: "row", width: 250, justifyContent: "space-between", paddingVertical: 3 },
  totalLabel: { fontSize: 10, color: gray },
  totalValue: { fontSize: 10, fontWeight: "bold" },
  grandTotal: { flexDirection: "row", width: 250, justifyContent: "space-between", paddingVertical: 6, borderTop: 2, borderTopColor: green, marginTop: 4 },
  grandTotalLabel: { fontSize: 12, fontWeight: "bold", color: green },
  grandTotalValue: { fontSize: 12, fontWeight: "bold", color: green },
  cotacao: { backgroundColor: lightGray, padding: 12, borderRadius: 4, fontSize: 9, lineHeight: 1.5, marginTop: 5 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: gray, borderTop: 1, borderTopColor: "#e5e7eb", paddingTop: 8 },
});

const FASE_LABELS: Record<string, string> = {
  PEDIDO: "Pedido",
  ORCAMENTO: "Orçamento",
  APROVADO: "Aprovado",
  PRODUCAO: "Produção",
  ENVIO: "Envio",
  RECEBIDO: "Recebido",
};

function formatCurrency(value: number) {
  return "R$ " + value.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR");
}

interface PedidoPDFProps {
  pedido: {
    numero: number;
    fase: string;
    valorProdutos: number;
    valorFrete: number;
    valorTotal: number;
    pesoTotal: number;
    volumes: number;
    observacoes?: string;
    createdAt: string;
    cliente: {
      nome: string;
      cpf?: string;
      cnpj?: string;
      email?: string;
      telefone?: string;
      endereco?: string;
      bairro?: string;
      cidade?: string;
      estado?: string;
      cep?: string;
    };
    itens: Array<{
      quantidade: number;
      pesoTotal: number;
      precoUnit: number;
      subtotal: number;
      produto: { nome: string; peso: number; unidade: string };
    }>;
  };
}

export default function PedidoPDF({ pedido }: PedidoPDFProps) {
  const itemDescriptions = pedido.itens
    .map((item) => `${item.quantidade}x ${item.produto.nome} (${item.pesoTotal.toFixed(1)} kg)`)
    .join(", ");

  const cotacaoText = [
    `${pedido.volumes} vol`,
    `${pedido.pesoTotal.toFixed(1)} kg`,
    `Sendo ${itemDescriptions}`,
    `Valor total ${formatCurrency(pedido.valorTotal)}`,
    pedido.cliente.endereco || "",
    pedido.cliente.bairro ? `Bairro: ${pedido.cliente.bairro}` : "",
    pedido.cliente.cidade ? `Cidade: ${pedido.cliente.cidade}` : "",
    pedido.cliente.estado ? `Estado: ${pedido.cliente.estado}` : "",
    pedido.cliente.cep ? `CEP: ${pedido.cliente.cep}` : "",
    pedido.cliente.nome,
  ].filter(Boolean).join("\n");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>Organo Ágil</Text>
            <Text style={styles.logoSub}>Sistema de Gestão</Text>
          </View>
          <View>
            <Text style={styles.pedidoNum}>Pedido #{pedido.numero}</Text>
            <Text style={styles.pedidoDate}>{formatDate(pedido.createdAt)}</Text>
            <Text style={styles.fase}>{FASE_LABELS[pedido.fase] || pedido.fase}</Text>
          </View>
        </View>

        {/* Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nome:</Text>
            <Text style={styles.value}>{pedido.cliente.nome}</Text>
          </View>
          {(pedido.cliente.cpf || pedido.cliente.cnpj) && (
            <View style={styles.row}>
              <Text style={styles.label}>{pedido.cliente.cnpj ? "CNPJ:" : "CPF:"}</Text>
              <Text style={styles.value}>{pedido.cliente.cnpj || pedido.cliente.cpf}</Text>
            </View>
          )}
          {pedido.cliente.telefone && (
            <View style={styles.row}>
              <Text style={styles.label}>Telefone:</Text>
              <Text style={styles.value}>{pedido.cliente.telefone}</Text>
            </View>
          )}
          {pedido.cliente.email && (
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{pedido.cliente.email}</Text>
            </View>
          )}
          {pedido.cliente.endereco && (
            <View style={styles.row}>
              <Text style={styles.label}>Endereço:</Text>
              <Text style={styles.value}>
                {pedido.cliente.endereco}
                {pedido.cliente.bairro ? `, ${pedido.cliente.bairro}` : ""}
                {pedido.cliente.cidade ? ` - ${pedido.cliente.cidade}` : ""}
                {pedido.cliente.estado ? `/${pedido.cliente.estado}` : ""}
                {pedido.cliente.cep ? ` - CEP: ${pedido.cliente.cep}` : ""}
              </Text>
            </View>
          )}
        </View>

        {/* Itens */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itens do Pedido</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Produto</Text>
              <Text style={styles.col2}>Qtd</Text>
              <Text style={styles.col3}>Peso</Text>
              <Text style={styles.col4}>Preco Unit.</Text>
              <Text style={styles.col5}>Subtotal</Text>
            </View>
            {pedido.itens.map((item, i) => (
              <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={styles.col1}>{item.produto.nome}</Text>
                <Text style={styles.col2}>{item.quantidade}</Text>
                <Text style={styles.col3}>{item.pesoTotal.toFixed(1)} kg</Text>
                <Text style={styles.col4}>{formatCurrency(item.precoUnit)}</Text>
                <Text style={styles.col5}>{formatCurrency(item.subtotal)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Totais */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Valor dos Produtos</Text>
            <Text style={styles.totalValue}>{formatCurrency(pedido.valorProdutos)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Frete</Text>
            <Text style={styles.totalValue}>{formatCurrency(pedido.valorFrete)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Peso Total</Text>
            <Text style={styles.totalValue}>{pedido.pesoTotal.toFixed(1)} kg</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Volumes</Text>
            <Text style={styles.totalValue}>{pedido.volumes}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>VALOR TOTAL</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(pedido.valorTotal)}</Text>
          </View>
        </View>

        {/* Cotação de Frete */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cotação de Frete</Text>
          <View style={styles.cotacao}>
            <Text>{cotacaoText}</Text>
          </View>
        </View>

        {/* Observações */}
        {pedido.observacoes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <Text style={{ fontSize: 9 }}>{pedido.observacoes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Organo Ágil - Sistema de Gestão</Text>
          <Text>Gerado em {new Date().toLocaleDateString("pt-BR")}</Text>
        </View>
      </Page>
    </Document>
  );
}
