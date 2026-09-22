import { describe, expect, it } from 'bun:test';
import { parsePriceInput } from './formatters';

describe('parsePriceInput', () => {
  it('parses standard numbers and numeric types', () => {
    expect(parsePriceInput(1200.5)).toBe(1200.5);
    expect(parsePriceInput(0)).toBe(0);
    expect(parsePriceInput('1200.5')).toBe(1200.5);
    expect(parsePriceInput('1200')).toBe(1200);
  });

  it('handles thousand separators with commas and spaces', () => {
    expect(parsePriceInput('1,200.5')).toBe(1200.5);
    expect(parsePriceInput('1,200')).toBe(1200);
    expect(parsePriceInput('1,234,567.89')).toBe(1234567.89);
    expect(parsePriceInput(' 1,200.50 ')).toBe(1200.5);
    expect(parsePriceInput('1 200,50')).toBe(1200.5);
    expect(parsePriceInput('1 200.50')).toBe(1200.5);
  });

  it('handles localized comma decimal separators', () => {
    expect(parsePriceInput('1200,5')).toBe(1200.5);
    expect(parsePriceInput('1200,50')).toBe(1200.5);
    expect(parsePriceInput('1.200,50')).toBe(1200.5);
    expect(parsePriceInput('1,5')).toBe(1.5);
    expect(parsePriceInput('0,99')).toBe(0.99);
  });

  it('returns NaN for invalid inputs, non-numeric strings, and empty/null/undefined', () => {
    expect(parsePriceInput('')).toBeNaN();
    expect(parsePriceInput('   ')).toBeNaN();
    expect(parsePriceInput('abc')).toBeNaN();
    expect(parsePriceInput('12a3')).toBeNaN();
    expect(parsePriceInput(null)).toBeNaN();
    expect(parsePriceInput(undefined)).toBeNaN();
    expect(parsePriceInput(NaN)).toBeNaN();
  });
});
