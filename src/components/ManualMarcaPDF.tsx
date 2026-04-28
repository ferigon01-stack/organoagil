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
    {
      src: "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-600-normal.ttf",
      fontWeight: 600,
    },
    {
      src: "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf",
      fontWeight: 700,
    },
    {
      src: "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-900-normal.ttf",
      fontWeight: 900,
    },
  ],
});

const green = "#1a4d2e";
const greenDark = "#0a1f12";
const gold = "#b8960c";
const goldLight = "#d4b23a";
const cream = "#f5f0e1";
const white = "#ffffff";
const grayMedium = "#6b7280";
const grayLight = "#e5e7eb";

const s = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    color: greenDark,
    backgroundColor: white,
  },

  // capa
  cover: {
    flex: 1,
    backgroundColor: greenDark,
    color: white,
    padding: 60,
    justifyContent: "space-between",
  },
  coverTop: { flexDirection: "row", alignItems: "center", gap: 14 },
  coverLogo: { width: 60, height: 60, borderRadius: 30 },
  coverBrand: { fontSize: 14, color: goldLight, fontWeight: 700, letterSpacing: 1.5 },
  coverDivider: {
    width: 80,
    height: 3,
    backgroundColor: gold,
    marginVertical: 20,
  },
  coverTitle: {
    fontSize: 56,
    fontWeight: 900,
    color: white,
    lineHeight: 1.05,
  },
  coverSubtitle: {
    fontSize: 14,
    color: cream,
    marginTop: 18,
    lineHeight: 1.5,
    maxWidth: 360,
  },
  coverFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
    color: cream,
    opacity: 0.8,
    letterSpacing: 1,
  },

  // header de páginas internas
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 50,
    paddingVertical: 24,
    borderBottom: 1,
    borderBottomColor: grayLight,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerLogo: { width: 24, height: 24, borderRadius: 12 },
  headerBrand: { fontSize: 9, color: green, fontWeight: 700, letterSpacing: 0.5 },
  headerSection: {
    fontSize: 8,
    color: grayMedium,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

  body: { flex: 1, padding: 50 },

  eyebrow: {
    fontSize: 9,
    color: gold,
    fontWeight: 700,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 900,
    color: green,
    marginBottom: 6,
  },
  pageLead: {
    fontSize: 11,
    color: grayMedium,
    marginBottom: 28,
    maxWidth: 420,
    lineHeight: 1.5,
  },

  goldBar: { width: 40, height: 3, backgroundColor: gold, marginBottom: 22 },

  // logo page
  logoShowcase: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 28,
  },
  logoBoxLight: {
    flex: 1,
    backgroundColor: cream,
    border: 1,
    borderColor: grayLight,
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 150,
  },
  logoBoxDark: {
    flex: 1,
    backgroundColor: greenDark,
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 150,
  },
  bigLogo: { width: 90, height: 90, borderRadius: 45 },
  logoCaption: {
    fontSize: 8,
    color: grayMedium,
    textAlign: "center",
    marginTop: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  rulesGrid: { flexDirection: "row", gap: 14, marginTop: 4 },
  ruleCard: {
    flex: 1,
    border: 1,
    borderColor: grayLight,
    padding: 14,
  },
  ruleTitle: { fontSize: 10, fontWeight: 700, color: green, marginBottom: 4 },
  ruleText: { fontSize: 9, color: grayMedium, lineHeight: 1.5 },

  // paleta
  swatchesRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  swatch: {
    flex: 1,
    height: 130,
    padding: 12,
    justifyContent: "flex-end",
  },
  swatchName: { fontSize: 11, fontWeight: 700, color: white },
  swatchHex: { fontSize: 9, color: white, opacity: 0.85, marginTop: 2 },
  swatchSub: { fontSize: 8, color: white, opacity: 0.7, marginTop: 1 },

  paletteUsage: {
    backgroundColor: cream,
    padding: 18,
    borderLeft: 3,
    borderLeftColor: gold,
    marginTop: 8,
  },
  paletteUsageTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: green,
    marginBottom: 6,
  },
  paletteUsageText: {
    fontSize: 9,
    color: greenDark,
    lineHeight: 1.6,
  },

  // tipografia
  fontFamilyTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: green,
    marginBottom: 4,
  },
  fontFamilySub: {
    fontSize: 9,
    color: grayMedium,
    marginBottom: 18,
  },
  weightRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 16,
    paddingVertical: 10,
    borderBottom: 1,
    borderBottomColor: grayLight,
  },
  weightLabel: {
    fontSize: 9,
    color: grayMedium,
    width: 90,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  weightSample: { fontSize: 22, color: greenDark, flex: 1 },

  hierarchy: { marginTop: 22 },
  hierarchyItem: { marginBottom: 12 },
  hierarchyMeta: {
    fontSize: 8,
    color: gold,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  hierarchyH1: { fontSize: 26, fontWeight: 900, color: green },
  hierarchyH2: { fontSize: 18, fontWeight: 700, color: greenDark },
  hierarchyBody: { fontSize: 11, color: greenDark, lineHeight: 1.5 },
  hierarchySmall: { fontSize: 9, color: grayMedium },

  // aplicação
  applicationRow: { flexDirection: "row", gap: 18, marginBottom: 22 },
  productCard: {
    flex: 1,
    backgroundColor: cream,
    padding: 22,
    alignItems: "center",
  },
  productImage: { width: 140, height: 200, objectFit: "contain" },
  productLabel: {
    fontSize: 10,
    color: green,
    fontWeight: 700,
    marginTop: 10,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  applicationText: {
    flex: 1,
    paddingVertical: 10,
  },
  appHeading: {
    fontSize: 14,
    fontWeight: 700,
    color: green,
    marginBottom: 8,
  },
  appBullet: {
    fontSize: 10,
    color: greenDark,
    marginBottom: 6,
    lineHeight: 1.5,
  },

  slogan: {
    backgroundColor: greenDark,
    padding: 24,
    color: white,
  },
  sloganTitle: {
    fontSize: 18,
    color: white,
    fontWeight: 900,
    marginBottom: 4,
  },
  sloganGold: { color: goldLight, fontWeight: 700 },
  sloganSub: { fontSize: 9, color: cream, opacity: 0.85, marginTop: 6 },

  // footer
  footer: {
    position: "absolute",
    bottom: 24,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: grayMedium,
    paddingTop: 10,
    borderTop: 1,
    borderTopColor: grayLight,
  },
});

interface ManualMarcaProps {
  logoSrc: string;
  bioguardSrc: string;
}

function HeaderInternal({
  logoSrc,
  section,
}: {
  logoSrc: string;
  section: string;
}) {
  return (
    <View style={s.header} fixed>
      <View style={s.headerLeft}>
        <Image src={logoSrc} style={s.headerLogo} />
        <Text style={s.headerBrand}>ORGANO ÁGIL · MANUAL DE MARCA</Text>
      </View>
      <Text style={s.headerSection}>{section}</Text>
    </View>
  );
}

function FooterInternal({ pageNumber }: { pageNumber: number }) {
  return (
    <View style={s.footer} fixed>
      <Text>Organo Ágil — Manual de Marca v1.0</Text>
      <Text>{pageNumber.toString().padStart(2, "0")}</Text>
    </View>
  );
}

export function ManualMarcaPDF({ logoSrc, bioguardSrc }: ManualMarcaProps) {
  return (
    <Document title="Organo Ágil — Manual de Marca">
      {/* CAPA */}
      <Page size="A4" style={s.page}>
        <View style={s.cover}>
          <View style={s.coverTop}>
            <Image src={logoSrc} style={s.coverLogo} />
            <Text style={s.coverBrand}>ORGANO ÁGIL</Text>
          </View>

          <View>
            <View style={s.coverDivider} />
            <Text style={s.coverTitle}>Manual{"\n"}de Marca</Text>
            <Text style={s.coverSubtitle}>
              Diretrizes essenciais de identidade visual: logo, paleta de
              cores, tipografia e tom de voz.
            </Text>
          </View>

          <View style={s.coverFooter}>
            <Text>v1.0</Text>
            <Text>USO INTERNO E DE PARCEIROS</Text>
          </View>
        </View>
      </Page>

      {/* LOGO */}
      <Page size="A4" style={s.page}>
        <HeaderInternal logoSrc={logoSrc} section="01 · Logo" />
        <View style={s.body}>
          <Text style={s.eyebrow}>Identidade visual</Text>
          <Text style={s.pageTitle}>Logo</Text>
          <Text style={s.pageLead}>
            O símbolo da Organo Ágil deve ser sempre apresentado com clareza e
            hierarquia. Use a versão circular sobre fundos contrastantes.
          </Text>
          <View style={s.goldBar} />

          <View style={s.logoShowcase}>
            <View style={s.logoBoxLight}>
              <Image src={logoSrc} style={s.bigLogo} />
              <Text style={s.logoCaption}>Sobre fundo claro</Text>
            </View>
            <View style={s.logoBoxDark}>
              <Image src={logoSrc} style={s.bigLogo} />
              <Text style={[s.logoCaption, { color: cream }]}>
                Sobre fundo escuro
              </Text>
            </View>
          </View>

          <View style={s.rulesGrid}>
            <View style={s.ruleCard}>
              <Text style={s.ruleTitle}>Área de proteção</Text>
              <Text style={s.ruleText}>
                Mantenha um espaço livre equivalente a 1/4 do diâmetro do logo
                ao redor dele, sem outros elementos visuais.
              </Text>
            </View>
            <View style={s.ruleCard}>
              <Text style={s.ruleTitle}>Tamanho mínimo</Text>
              <Text style={s.ruleText}>
                Não utilize o logo abaixo de 24px de diâmetro em telas ou 12mm
                em impressos.
              </Text>
            </View>
            <View style={s.ruleCard}>
              <Text style={s.ruleTitle}>Não fazer</Text>
              <Text style={s.ruleText}>
                Não distorça, gire, troque cores ou aplique sobre fundos com
                ruído visual que prejudiquem a leitura.
              </Text>
            </View>
          </View>
        </View>
        <FooterInternal pageNumber={2} />
      </Page>

      {/* PALETA DE CORES */}
      <Page size="A4" style={s.page}>
        <HeaderInternal logoSrc={logoSrc} section="02 · Cores" />
        <View style={s.body}>
          <Text style={s.eyebrow}>Identidade visual</Text>
          <Text style={s.pageTitle}>Paleta de cores</Text>
          <Text style={s.pageLead}>
            O verde é a alma da marca — natureza e proteção. O dourado dá
            sofisticação e remete à qualidade premium. O creme garante
            respiro.
          </Text>
          <View style={s.goldBar} />

          <View style={s.swatchesRow}>
            <View style={[s.swatch, { backgroundColor: greenDark }]}>
              <Text style={s.swatchName}>Verde Profundo</Text>
              <Text style={s.swatchHex}>#0A1F12</Text>
              <Text style={s.swatchSub}>Fundos · Hero</Text>
            </View>
            <View style={[s.swatch, { backgroundColor: green }]}>
              <Text style={s.swatchName}>Verde Marca</Text>
              <Text style={s.swatchHex}>#1A4D2E</Text>
              <Text style={s.swatchSub}>Cor primária</Text>
            </View>
            <View style={[s.swatch, { backgroundColor: gold }]}>
              <Text style={s.swatchName}>Dourado</Text>
              <Text style={s.swatchHex}>#B8960C</Text>
              <Text style={s.swatchSub}>Acentos · Selos</Text>
            </View>
          </View>

          <View style={s.swatchesRow}>
            <View
              style={[
                s.swatch,
                { backgroundColor: goldLight, height: 90 },
              ]}
            >
              <Text style={[s.swatchName, { color: greenDark }]}>
                Dourado Claro
              </Text>
              <Text style={[s.swatchHex, { color: greenDark }]}>#D4B23A</Text>
            </View>
            <View
              style={[s.swatch, { backgroundColor: cream, height: 90 }]}
            >
              <Text style={[s.swatchName, { color: greenDark }]}>Creme</Text>
              <Text style={[s.swatchHex, { color: greenDark }]}>#F5F0E1</Text>
            </View>
            <View
              style={[
                s.swatch,
                {
                  backgroundColor: white,
                  height: 90,
                  border: 1,
                  borderColor: grayLight,
                },
              ]}
            >
              <Text style={[s.swatchName, { color: greenDark }]}>Branco</Text>
              <Text style={[s.swatchHex, { color: greenDark }]}>#FFFFFF</Text>
            </View>
          </View>

          <View style={s.paletteUsage}>
            <Text style={s.paletteUsageTitle}>Uso recomendado</Text>
            <Text style={s.paletteUsageText}>
              · Verde marca (#1A4D2E) e Verde Profundo (#0A1F12) ocupam até 60%
              da composição.{"\n"}
              · Dourado (#B8960C / #D4B23A) é cor de destaque — máx. 15% do
              espaço, em selos, faixas e CTAs.{"\n"}
              · Creme (#F5F0E1) e branco fazem o respiro entre seções.{"\n"}
              · Evite verdes neón ou dourados saturados — preserve o tom
              natural e premium.
            </Text>
          </View>
        </View>
        <FooterInternal pageNumber={3} />
      </Page>

      {/* TIPOGRAFIA */}
      <Page size="A4" style={s.page}>
        <HeaderInternal logoSrc={logoSrc} section="03 · Tipografia" />
        <View style={s.body}>
          <Text style={s.eyebrow}>Identidade visual</Text>
          <Text style={s.pageTitle}>Tipografia</Text>
          <Text style={s.pageLead}>
            A tipografia institucional da Organo Ágil é a Inter — uma sans-serif
            moderna, neutra e altamente legível em telas e impressos.
          </Text>
          <View style={s.goldBar} />

          <Text style={s.fontFamilyTitle}>Inter</Text>
          <Text style={s.fontFamilySub}>
            Família principal · Disponível gratuitamente em fontes.google.com/specimen/Inter
          </Text>

          <View style={s.weightRow}>
            <Text style={s.weightLabel}>Regular · 400</Text>
            <Text style={[s.weightSample, { fontWeight: 400 }]}>
              Aa Bb Cc 123
            </Text>
          </View>
          <View style={s.weightRow}>
            <Text style={s.weightLabel}>Semibold · 600</Text>
            <Text style={[s.weightSample, { fontWeight: 600 }]}>
              Aa Bb Cc 123
            </Text>
          </View>
          <View style={s.weightRow}>
            <Text style={s.weightLabel}>Bold · 700</Text>
            <Text style={[s.weightSample, { fontWeight: 700 }]}>
              Aa Bb Cc 123
            </Text>
          </View>
          <View style={s.weightRow}>
            <Text style={s.weightLabel}>Black · 900</Text>
            <Text style={[s.weightSample, { fontWeight: 900 }]}>
              Aa Bb Cc 123
            </Text>
          </View>

          <View style={s.hierarchy}>
            <View style={s.hierarchyItem}>
              <Text style={s.hierarchyMeta}>Título principal · 900</Text>
              <Text style={s.hierarchyH1}>Proteção de verdade</Text>
            </View>
            <View style={s.hierarchyItem}>
              <Text style={s.hierarchyMeta}>Subtítulo · 700</Text>
              <Text style={s.hierarchyH2}>Tecnologia que cuida</Text>
            </View>
            <View style={s.hierarchyItem}>
              <Text style={s.hierarchyMeta}>Texto corrido · 400</Text>
              <Text style={s.hierarchyBody}>
                Eficaz contra todos os invertebrados, com ação imediata e
                residual de até 3 dias.
              </Text>
            </View>
            <View style={s.hierarchyItem}>
              <Text style={s.hierarchyMeta}>Auxiliar · 400</Text>
              <Text style={s.hierarchySmall}>
                Detalhes técnicos, legendas, rodapés.
              </Text>
            </View>
          </View>
        </View>
        <FooterInternal pageNumber={4} />
      </Page>

      {/* APLICAÇÃO */}
      <Page size="A4" style={s.page}>
        <HeaderInternal logoSrc={logoSrc} section="04 · Aplicação" />
        <View style={s.body}>
          <Text style={s.eyebrow}>Tom & aplicação</Text>
          <Text style={s.pageTitle}>Como a marca aparece</Text>
          <Text style={s.pageLead}>
            A combinação verde + dourado, tipografia Inter e fotografia limpa
            constrói uma identidade premium e confiável — refletida no nosso
            primeiro produto.
          </Text>
          <View style={s.goldBar} />

          <View style={s.applicationRow}>
            <View style={s.productCard}>
              <Image src={bioguardSrc} style={s.productImage} />
              <Text style={s.productLabel}>BioGuard 500ml</Text>
            </View>
            <View style={s.applicationText}>
              <Text style={s.appHeading}>Atributos da marca</Text>
              <Text style={s.appBullet}>· Natureza & tecnologia</Text>
              <Text style={s.appBullet}>· Proteção sem agredir</Text>
              <Text style={s.appBullet}>· Cuidado com pets e família</Text>
              <Text style={s.appBullet}>· Premium, mas acessível</Text>
              <Text style={s.appBullet}>· Direta, prática, sem rodeios</Text>
            </View>
          </View>

          <View style={s.slogan}>
            <Text style={s.sloganTitle}>
              BioGuard:{" "}
              <Text style={s.sloganGold}>
                proteção prática, resultado real.
              </Text>
            </Text>
            <Text style={s.sloganSub}>
              Slogan oficial — usar sempre com o nome do produto antes da
              promessa em itálico/dourado.
            </Text>
          </View>
        </View>
        <FooterInternal pageNumber={5} />
      </Page>
    </Document>
  );
}
