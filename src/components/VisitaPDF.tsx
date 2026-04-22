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

const green = "#1a4d2e";
const gold = "#b8960c";
const gray = "#6b7280";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Inter", color: "#1f2937" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: green,
    paddingBottom: 15,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoImage: { width: 50, height: 50, borderRadius: 25 },
  logoText: { fontSize: 22, fontWeight: "bold", color: green },
  logoSub: { fontSize: 8, color: gray, marginTop: 1 },
  docTitle: { fontSize: 16, fontWeight: "bold", color: green, textAlign: "right" },
  docDate: { fontSize: 9, color: gray, textAlign: "right", marginTop: 2 },
  section: { marginBottom: 15 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: green,
    marginBottom: 8,
    borderBottom: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 4,
  },
  row: { flexDirection: "row", gap: 4, marginBottom: 3 },
  label: { fontSize: 9, color: gray, width: 80 },
  value: { fontSize: 10, flex: 1 },
  observacoes: {
    fontSize: 10,
    lineHeight: 1.6,
    marginTop: 4,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  photo: {
    width: 240,
    height: 180,
    objectFit: "cover",
    borderRadius: 4,
    border: 1,
    borderColor: "#e5e7eb",
  },
  signatures: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
    paddingTop: 10,
  },
  signatureBlock: { width: "45%", alignItems: "center" },
  signatureLine: {
    borderBottom: 1,
    borderBottomColor: "#1f2937",
    width: "100%",
    marginBottom: 5,
  },
  signatureName: { fontSize: 9, fontWeight: "bold", color: "#1f2937" },
  signatureRole: { fontSize: 8, color: gray },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: gray,
    borderTop: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
  },
});

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

interface VisitaPDFProps {
  visita: {
    data: string;
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
    };
  };
  fotos: { id: string; dataUrl: string }[];
}

export default function VisitaPDF({ visita, fotos }: VisitaPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image src="https://organoagil.vercel.app/logo.jpeg" style={styles.logoImage} />
            <View>
              <Text style={styles.logoText}>Organo Ágil</Text>
              <Text style={styles.logoSub}>CNPJ: 63.512.791/0001-59</Text>
              <Text style={styles.logoSub}>IE: 177.691.737.112</Text>
            </View>
          </View>
          <View>
            <Text style={styles.docTitle}>Relatório de Visita</Text>
            <Text style={styles.docDate}>{formatDate(visita.data)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nome:</Text>
            <Text style={styles.value}>{visita.cliente.nome}</Text>
          </View>
          {(visita.cliente.cpf || visita.cliente.cnpj) && (
            <View style={styles.row}>
              <Text style={styles.label}>{visita.cliente.cnpj ? "CNPJ:" : "CPF:"}</Text>
              <Text style={styles.value}>{visita.cliente.cnpj || visita.cliente.cpf}</Text>
            </View>
          )}
          {visita.cliente.telefone && (
            <View style={styles.row}>
              <Text style={styles.label}>Telefone:</Text>
              <Text style={styles.value}>{visita.cliente.telefone}</Text>
            </View>
          )}
          {visita.cliente.email && (
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{visita.cliente.email}</Text>
            </View>
          )}
          {visita.cliente.endereco && (
            <View style={styles.row}>
              <Text style={styles.label}>Endereço:</Text>
              <Text style={styles.value}>
                {visita.cliente.endereco}
                {visita.cliente.bairro ? `, ${visita.cliente.bairro}` : ""}
                {visita.cliente.cidade ? ` - ${visita.cliente.cidade}` : ""}
                {visita.cliente.estado ? `/${visita.cliente.estado}` : ""}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data da Visita</Text>
          <Text style={styles.value}>{formatDate(visita.data)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observações</Text>
          <Text style={styles.observacoes}>
            {visita.observacoes || "Sem observações registradas."}
          </Text>
        </View>

        {fotos.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Fotos</Text>
            <View style={styles.photoGrid}>
              {fotos.map((foto) => (
                <Image key={foto.id} src={foto.dataUrl} style={styles.photo} />
              ))}
            </View>
          </View>
        )}

        <View style={styles.signatures}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>Maicon Augusto</Text>
            <Text style={styles.signatureRole}>Organo Ágil</Text>
          </View>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>{visita.cliente.nome}</Text>
            <Text style={styles.signatureRole}>Cliente</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Organo Ágil - CNPJ: 63.512.791/0001-59</Text>
          <Text>Gerado em {new Date().toLocaleDateString("pt-BR")}</Text>
        </View>
      </Page>
    </Document>
  );
}
