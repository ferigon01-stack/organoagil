import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fontPath = path.join(__dirname, "Inter.ttf");

const doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true });
const output = fs.createWriteStream(path.join(process.env.HOME, "Downloads", "Proposta_Alex_Rui_Imoveis.pdf"));
doc.pipe(output);

// Register Inter font
doc.registerFont("Inter", fontPath);
doc.registerFont("Inter-Bold", fontPath);

const green = "#1a4d2e";
const gold = "#b8960c";
const darkGray = "#1f2937";
const gray = "#6b7280";
const lightGray = "#f3f4f6";

function drawLine(y, color = "#e5e7eb") {
  doc.moveTo(50, y).lineTo(545, y).strokeColor(color).lineWidth(1).stroke();
}

function sectionTitle(text) {
  if (doc.y > 700) doc.addPage();
  const y = doc.y;
  doc.fontSize(13).font("Inter-Bold").fillColor(green).text(text);
  drawLine(doc.y + 2, green);
  doc.moveDown(0.4);
}

function bullet(text) {
  if (doc.y > 730) doc.addPage();
  const y = doc.y + 4;
  doc.circle(62, y, 2).fill(gold);
  doc.fillColor(darkGray).font("Inter").fontSize(9).text(text, 72, y - 4, { width: 470 });
  doc.moveDown(0.1);
}

// ===== HEADER =====
doc.rect(0, 0, 595, 100).fill(green);
doc.fontSize(26).font("Inter-Bold").fillColor("white").text("PROPOSTA COMERCIAL", 50, 30);
doc.fontSize(11).font("Inter").fillColor(gold).text("Sistema de Gestão de Imóveis Alocados", 50, 60);
doc.fontSize(9).fillColor("white").text("Data: " + new Date().toLocaleDateString("pt-BR"), 50, 78);

doc.y = 120;

// ===== DADOS DO CLIENTE =====
sectionTitle("Cliente");
doc.fontSize(11).font("Inter-Bold").fillColor(darkGray).text("Alex Rui");
doc.fontSize(9).font("Inter").fillColor(gray).text("Gestão de 45 imóveis alocados");
doc.moveDown(0.8);

// ===== CONTEXTO =====
sectionTitle("Contexto e Problema");
doc.fontSize(9).font("Inter").fillColor(darkGray);
doc.text("O cliente possui 45 imóveis alocados e enfrenta dificuldades com os sistemas atuais, que exigem a exclusão do imóvel quando um inquilino sai, causando perda de histórico.", { width: 495 });
doc.moveDown(0.3);
doc.text("A solução proposta separa Imóvel, Cliente e Contrato como entidades independentes, permitindo trocar inquilinos sem nunca perder o cadastro do imóvel ou seu histórico.", { width: 495 });
doc.moveDown(0.8);

// ===== ESCOPO =====
sectionTitle("Escopo do Projeto");

const modulos = [
  {
    nome: "1. Autenticação e Segurança",
    itens: ["Login seguro com credenciais", "Controle de acesso por usuário"]
  },
  {
    nome: "2. Cadastro de Imóveis",
    itens: [
      "Base permanente dos 45 imóveis (nunca excluídos)",
      "Campos: endereço, identificação, valor IPTU fixo, status (Ocupado/Disponível)",
      "Histórico completo de todos os inquilinos que já passaram"
    ]
  },
  {
    nome: "3. Cadastro de Clientes (Inquilinos)",
    itens: [
      "Nome, CPF/CNPJ, telefone, email, documentos",
      "Vínculo com imóvel(is) via contrato",
      "Upload de PDF do contrato"
    ]
  },
  {
    nome: "4. Gestão de Contratos",
    itens: [
      "Vincula imóvel a cliente com datas de início/fim",
      "Valor do aluguel, observações, status (Ativo/Encerrado)",
      "Botão para dar baixa no contrato (inquilino saiu)",
      "Upload de PDF do contrato vinculado",
      "Histórico: ao encerrar contrato, imóvel fica disponível para novo inquilino"
    ]
  },
  {
    nome: "5. Painel Mensal de Controle",
    itens: [
      "Visão mês a mês: cada imóvel mostra qual cliente está ocupando",
      "Status de pagamento por imóvel/mês (Pago/Pendente)",
      "Indicador de NF emitida (Sim/Não) com botão para marcar",
      "Filtros por mês, ano, status de pagamento"
    ]
  },
  {
    nome: "6. Dashboard Gerencial",
    itens: [
      "Total de imóveis ocupados vs disponíveis",
      "Faturamento mensal e acumulado",
      "Inadimplência (pagamentos pendentes)",
      "Total de IPTU a pagar",
      "Gráficos de evolução mensal"
    ]
  },
  {
    nome: "7. Infraestrutura",
    itens: [
      "Aplicação web responsiva (desktop + mobile)",
      "Banco de dados PostgreSQL na nuvem",
      "Hospedagem na Vercel (acesso via link)",
      "Modo claro e escuro"
    ]
  }
];

modulos.forEach(mod => {
  if (doc.y > 680) doc.addPage();
  doc.fontSize(10).font("Inter-Bold").fillColor(green).text(mod.nome);
  doc.moveDown(0.2);
  mod.itens.forEach(item => bullet(item));
  doc.moveDown(0.4);
});

// ===== INVESTIMENTO =====
doc.addPage();

sectionTitle("Investimento");
doc.moveDown(0.2);

const tableTop = doc.y;
const items = [
  { desc: "Desenvolvimento do Sistema Completo", valor: "R$ 3.000,00" },
  { desc: "Configuração e Deploy (Vercel + Banco de Dados)", valor: "Incluso" },
  { desc: "Identidade Visual e Personalização", valor: "Incluso" },
  { desc: "Treinamento de Uso", valor: "Incluso" },
];

// Header da tabela
doc.rect(50, tableTop, 495, 22).fill(green);
doc.fontSize(9).font("Inter-Bold").fillColor("white");
doc.text("Descrição", 60, tableTop + 6, { width: 350 });
doc.text("Valor", 420, tableTop + 6, { width: 120, align: "right" });
let ty = tableTop + 22;

items.forEach((item, i) => {
  if (i % 2 === 0) doc.rect(50, ty, 495, 22).fill(lightGray);
  else doc.rect(50, ty, 495, 22).fill("white");
  doc.fontSize(9).font("Inter").fillColor(darkGray);
  doc.text(item.desc, 60, ty + 6, { width: 350 });
  doc.font("Inter-Bold").text(item.valor, 420, ty + 6, { width: 120, align: "right" });
  ty += 22;
});

ty += 3;
doc.rect(50, ty, 495, 28).fill(green);
doc.fontSize(12).font("Inter-Bold").fillColor("white");
doc.text("VALOR TOTAL", 60, ty + 8, { width: 350 });
doc.text("R$ 3.000,00", 420, ty + 8, { width: 120, align: "right" });
doc.x = 50;
doc.y = ty + 40;

// Condições
sectionTitle("Condições de Pagamento");
doc.fontSize(9).font("Inter").fillColor(darkGray);
doc.text("• 50% na aprovação da proposta (R$ 1.500,00)", 50, doc.y, { width: 495 });
doc.text("• 50% na entrega final do sistema (R$ 1.500,00)", 50, doc.y, { width: 495 });
doc.moveDown(0.3);
doc.text("Formas de pagamento: PIX ou transferência bancária", 50, doc.y, { width: 495 });
doc.moveDown(0.8);

// Prazo
sectionTitle("Prazo de Entrega");
doc.fontSize(9).font("Inter").fillColor(darkGray);
doc.text("Estimativa de entrega: 5 a 7 dias úteis após aprovação.", 50, doc.y, { width: 495 });
doc.text("Inclui período de testes e ajustes com o cliente.", 50, doc.y, { width: 495 });
doc.moveDown(0.8);

// Suporte
sectionTitle("Suporte Pós-Entrega");
doc.fontSize(9).font("Inter").fillColor(darkGray);
doc.text("30 dias de suporte gratuito para correções e ajustes.", 50, doc.y, { width: 495 });
doc.text("Após o período, suporte sob demanda com valores a combinar.", 50, doc.y, { width: 495 });
doc.moveDown(0.8);

// Validade
sectionTitle("Validade da Proposta");
doc.fontSize(9).font("Inter").fillColor(darkGray);
doc.text("Esta proposta é válida por 15 dias a partir da data de emissão.", 50, doc.y, { width: 495 });
doc.moveDown(3);

// Assinaturas
drawLine(doc.y, green);
doc.moveDown(1);
doc.fontSize(9).font("Inter").fillColor(gray);
const sigY = doc.y;
doc.text("_______________________________", 50, sigY, { width: 200 });
doc.text("_______________________________", 330, sigY, { width: 200 });
doc.text("Prestador de Serviço", 50, sigY + 15, { width: 200 });
doc.text("Alex Rui - Cliente", 330, sigY + 15, { width: 200 });

// Footer em todas as páginas
const pages = doc.bufferedPageRange();
for (let i = 0; i < pages.count; i++) {
  doc.switchToPage(i);
  doc.fontSize(7).font("Inter").fillColor(gray);
  doc.text(
    "Documento gerado automaticamente | " + new Date().toLocaleDateString("pt-BR"),
    50, 780, { align: "center", width: 495 }
  );
}

doc.end();

output.on("finish", () => {
  console.log("PDF gerado: ~/Downloads/Proposta_Alex_Rui_Imoveis.pdf");
});
