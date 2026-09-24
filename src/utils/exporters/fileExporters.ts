import type { AppStoreData, CurrencyConfig, Plan } from '../../types/plan.js';
import { CURRENCY_PRESETS } from '../currency.js';
import { migrateToMultiPlan } from '../../storage/migrations.js';

/**
 * Downloads full store data portfolio as a formatted JSON file.
 */
export function exportStoreToJsonFile(data: AppStoreData): void {
  if (typeof document === 'undefined') return;

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `wishpacing-portfolio-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads wish items for an active plan as a CSV spreadsheet.
 */
export function exportActivePlanToCsvFile(
  plan: Plan,
  currency: CurrencyConfig = CURRENCY_PRESETS.USD
): void {
  if (typeof document === 'undefined') return;

  const headers = [
    'Priority',
    'Title',
    'Price',
    'Category',
    'Status',
    'Notes',
    'URL',
    'Created At',
  ];
  const rows = plan.items.map(item => [
    item.priority,
    `"${item.title.replace(/"/g, '""')}"`,
    item.price,
    `"${item.category}"`,
    item.isPurchased ? 'Purchased' : item.isPaused ? 'Paused' : 'Planned',
    `"${(item.notes || '').replace(/"/g, '""')}"`,
    `"${(item.url || '').replace(/"/g, '""')}"`,
    item.createdAt,
  ]);

  const csvContent = [
    `# Plan: ${plan.name} (${currency.code})`,
    headers.join(','),
    ...rows.map(r => r.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `plan-${plan.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Reads a JSON file uploaded by the user and parses/migrates it into AppStoreData.
 */
export async function importStoreFromJsonFile(file: File): Promise<AppStoreData> {
  const text = await file.text();
  const parsed: unknown = JSON.parse(text);
  return migrateToMultiPlan(parsed);
}
