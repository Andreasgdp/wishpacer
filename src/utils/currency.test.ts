import { describe, expect, it } from 'bun:test';
import { CURRENCY_PRESETS, formatCurrency } from './currency';
import type { CurrencyConfig } from '../types/plan';

describe('formatCurrency utility regression suite', () => {
  it('formats USD with prefix symbol and zero decimals by default', () => {
    const formatted = formatCurrency(1250);
    expect(formatted).toBe('$1,250');
  });

  it('formats EUR with suffix symbol', () => {
    const eur: CurrencyConfig = CURRENCY_PRESETS.EUR;
    const formatted = formatCurrency(1250, eur);
    expect(formatted).toBe('1,250 €');
  });

  it('formats SEK with suffix symbol', () => {
    const sek: CurrencyConfig = CURRENCY_PRESETS.SEK;
    const formatted = formatCurrency(1250, sek);
    expect(formatted).toBe('1,250 kr');
  });

  it('formats GBP with prefix symbol', () => {
    const gbp: CurrencyConfig = CURRENCY_PRESETS.GBP;
    const formatted = formatCurrency(1250, gbp);
    expect(formatted).toBe('£1,250');
  });

  it('formats custom currency code and symbol with suffix', () => {
    const custom: CurrencyConfig = {
      code: 'CUSTOM',
      symbol: 'BTC',
      position: 'suffix',
      decimals: 4,
    };
    const formatted = formatCurrency(1.23456, custom);
    expect(formatted).toBe('1.2346 BTC');
  });

  it('respects decimals configuration when non-zero', () => {
    const usdDecimals: CurrencyConfig = {
      code: 'USD',
      symbol: '$',
      position: 'prefix',
      decimals: 2,
    };
    expect(formatCurrency(1250.5, usdDecimals)).toBe('$1,250.50');
    expect(formatCurrency(1250.75, usdDecimals)).toBe('$1,250.75');
  });
});
