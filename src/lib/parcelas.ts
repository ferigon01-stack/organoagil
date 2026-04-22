export interface Parcela {
  numero: number;
  dias: number;
  dataVencimento: Date;
  valor: number;
}

export function parseCondicao(condicao?: string | null): number[] {
  if (!condicao) return [];
  const clean = condicao.trim().toLowerCase();
  if (!clean || clean === "avista" || clean === "a vista" || clean === "à vista") {
    return [0];
  }
  const parts = clean
    .split(/[\/;,]/)
    .map((p) => parseInt(p.trim(), 10))
    .filter((n) => !isNaN(n) && n >= 0);
  return parts;
}

export function calcularParcelas(
  valorTotal: number,
  condicao: string | null | undefined,
  dataBase: Date = new Date()
): Parcela[] {
  const dias = parseCondicao(condicao);
  if (dias.length === 0) return [];

  const valorParcela = Math.floor((valorTotal / dias.length) * 100) / 100;
  const resto = Math.round((valorTotal - valorParcela * dias.length) * 100) / 100;

  return dias.map((d, i) => {
    const dt = new Date(dataBase);
    dt.setDate(dt.getDate() + d);
    return {
      numero: i + 1,
      dias: d,
      dataVencimento: dt,
      valor: i === dias.length - 1 ? valorParcela + resto : valorParcela,
    };
  });
}

export function formatarCondicao(condicao?: string | null): string {
  if (!condicao) return "";
  const dias = parseCondicao(condicao);
  if (dias.length === 0) return "";
  if (dias.length === 1 && dias[0] === 0) return "À vista";
  return dias.map((d) => `${d} dias`).join(" / ");
}
