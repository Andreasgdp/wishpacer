import './test-setup';
import { describe, expect, it } from 'bun:test';
import fs from 'fs';
import path from 'path';
import { PLAN_COLORS } from './utils/defaults';

describe('Theme and Icons Overhaul Verification', () => {
  it('verifies PLAN_COLORS includes Emerald Ink and Champagne', () => {
    expect(PLAN_COLORS.violet).toBeDefined();
    expect(PLAN_COLORS.violet.label).toBe('Emerald Ink');
    expect(PLAN_COLORS.violet.bg).toContain('brand-900');
    expect(PLAN_COLORS.violet.text).toContain('champagne-200');

    expect(PLAN_COLORS.champagne).toBeDefined();
    expect(PLAN_COLORS.champagne.label).toBe('Champagne');
    expect(PLAN_COLORS.champagne.bg).toContain('champagne-300');
    expect(PLAN_COLORS.champagne.text).toContain('champagne-800');
  });

  it('verifies index.html has Apple Touch and Web App homescreen links and meta tags', () => {
    const htmlPath = path.resolve(process.cwd(), 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf-8');

    expect(html).toContain('<link rel="apple-touch-icon" href="/apple-touch-icon.png" />');
    expect(html).toContain(
      '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />'
    );
    expect(html).toContain(
      '<link rel="apple-touch-icon-precomposed" href="/apple-touch-icon-precomposed.png" />'
    );
    expect(html).toContain('<link rel="manifest" href="/manifest.json" />');
    expect(html).toContain('<meta name="apple-mobile-web-app-capable" content="yes" />');
    expect(html).toContain('<meta name="apple-mobile-web-app-title" content="WishPacer" />');
    expect(html).toContain(
      '<meta name="theme-color" content="#F8E7C9" media="(prefers-color-scheme: light)" />'
    );
    expect(html).toContain(
      '<meta name="theme-color" content="#2A2A2A" media="(prefers-color-scheme: dark)" />'
    );
  });

  it('verifies public/manifest.json is valid and uses Emerald Ink & Champagne', () => {
    const manifestPath = path.resolve(process.cwd(), 'public/manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

    expect(manifest.short_name).toBe('WishPacer');
    expect(manifest.theme_color).toBe('#064E3B');
    expect(manifest.background_color).toBe('#F8E7C9');
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThan(0);

    const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
  });

  it('verifies required icon assets exist and are non-empty in public directory', () => {
    const requiredFiles = [
      'public/apple-touch-icon.png',
      'public/apple-touch-icon-precomposed.png',
      'public/favicon.ico',
      'public/favicon.svg',
      'public/logo.svg',
      'public/logo-light.svg',
      'public/logo-dark.svg',
      'public/logo-middleground.svg',
      'public/icons/icon-192x192.png',
      'public/icons/icon-512x512.png',
    ];

    for (const relPath of requiredFiles) {
      const fullPath = path.resolve(process.cwd(), relPath);
      expect(fs.existsSync(fullPath)).toBe(true);
      const stats = fs.statSync(fullPath);
      expect(stats.size).toBeGreaterThan(0);
    }
  });

  it('verifies tailwind.config.js includes the primary Emerald Ink and Champagne colors', () => {
    const tailwindPath = path.resolve(process.cwd(), 'tailwind.config.js');
    const tailwindConfig = fs.readFileSync(tailwindPath, 'utf-8');

    expect(tailwindConfig).toContain('#064E3B'); // Emerald Ink
    expect(tailwindConfig).toContain('#F8E7C9'); // Champagne
    expect(tailwindConfig).toContain('champagne');
    expect(tailwindConfig).toContain('emerald-ink');
    expect(tailwindConfig).toContain('onyx');
    expect(tailwindConfig).toContain('ash');
    expect(tailwindConfig).toContain('alabaster');
    expect(tailwindConfig).toContain('terracotta');
    expect(tailwindConfig).toContain('gold-ochre');
    expect(tailwindConfig).toContain('mint');
  });
});
