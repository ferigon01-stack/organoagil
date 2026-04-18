export function formatCurrencyInput(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function parseCurrencyInput(text: string): number {
  const digits = text.replace(/\D/g, "");
  if (!digits) return 0;
  return parseInt(digits, 10) / 100;
}
