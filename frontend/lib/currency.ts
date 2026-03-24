// XCD is pegged at 2.7:1 USD
const RATES: Record<string, number> = {
  USD: 1,
  XCD: 2.7,
  EUR: 0.92,
  GBP: 0.79,
};

const SYMBOLS: Record<string, string> = {
  USD: "$",
  XCD: "EC$",
  EUR: "€",
  GBP: "£",
};

export function convertFromUSD(amountUSD: number, currency: string): number {
  const rate = RATES[currency] ?? 1;
  return amountUSD * rate;
}

export function formatCurrency(amountUSD: number, currency = "USD"): string {
  const converted = convertFromUSD(amountUSD, currency);
  const symbol = SYMBOLS[currency] ?? `${currency} `;
  return `${symbol}${converted.toFixed(2)}`;
}
