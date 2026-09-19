import type { CurrencyConfig } from "../types/plan.js";

export const CURRENCY_PRESETS: Record<string, CurrencyConfig> = {
  USD: { code: "USD", symbol: "$", position: "prefix", decimals: 0 },
  EUR: { code: "EUR", symbol: "€", position: "suffix", decimals: 0 },
  SEK: { code: "SEK", symbol: "kr", position: "suffix", decimals: 0 },
  GBP: { code: "GBP", symbol: "£", position: "prefix", decimals: 0 },
  JPY: { code: "JPY", symbol: "¥", position: "prefix", decimals: 0 },
  CAD: { code: "CAD", symbol: "CA$", position: "prefix", decimals: 0 },
  AUD: { code: "AUD", symbol: "A$", position: "prefix", decimals: 0 },
  CHF: { code: "CHF", symbol: "CHF", position: "prefix", decimals: 0 },
  NOK: { code: "NOK", symbol: "kr", position: "suffix", decimals: 0 },
  DKK: { code: "DKK", symbol: "kr", position: "suffix", decimals: 0 },
  PLN: { code: "PLN", symbol: "zł", position: "suffix", decimals: 0 },
};

export function formatCurrency(
  amount: number,
  currency: CurrencyConfig = CURRENCY_PRESETS.USD
): string {
  const rounded = Number.isInteger(amount) || currency.decimals === 0
    ? Math.round(amount)
    : Number(amount.toFixed(currency.decimals));

  const formattedNumber = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: currency.decimals > 0 && !Number.isInteger(amount) ? currency.decimals : 0,
    maximumFractionDigits: currency.decimals,
  }).format(rounded);

  if (currency.position === "prefix") {
    return `${currency.symbol}${formattedNumber}`;
  }
  return `${formattedNumber} ${currency.symbol}`;
}
