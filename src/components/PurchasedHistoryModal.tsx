import React from 'react';
import { X, CheckCircle2, History, Trash2, Undo2, Calendar } from 'lucide-react';
import type { CurrencyConfig, WishItem } from '../types/plan';
import { formatCurrency } from '../utils/currency';
import { formatDateString } from '../utils/calculator';
import { CATEGORIES } from '../utils/defaults';
import { ModalBackdrop } from './ModalBackdrop';

interface PurchasedHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchasedItems: WishItem[];
  currency: CurrencyConfig;
  onRestoreToPlan: (id: string) => void;
  onDelete: (id: string) => void;
}

export const PurchasedHistoryModal: React.FC<PurchasedHistoryModalProps> = ({
  isOpen,
  onClose,
  purchasedItems,
  currency,
  onRestoreToPlan,
  onDelete,
}) => {
  const totalSpent = purchasedItems.reduce(
    (sum, item) => sum + (item.purchasedPrice ?? item.price),
    0
  );

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Purchased Wishes Archive
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {purchasedItems.length} wish{purchasedItems.length === 1 ? '' : 'es'} fulfilled •
                Total spent:{' '}
                <strong className="text-slate-700 dark:text-slate-200 font-semibold">
                  {formatCurrency(totalSpent, currency)}
                </strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-3">
          {purchasedItems.length === 0 ? (
            <div className="text-center py-10">
              <History className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No purchased items yet.</p>
            </div>
          ) : (
            purchasedItems.map(item => {
              const cat = CATEGORIES[item.category] || CATEGORIES.Other;
              return (
                <div
                  key={item.id}
                  className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${cat.bg} ${cat.text} ${cat.border}`}
                      >
                        {cat.name}
                      </span>
                      {item.purchasedAt && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDateString(new Date(item.purchasedAt))}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {item.title}
                    </h4>
                    {item.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {item.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(item.purchasedPrice ?? item.price, currency)}
                    </span>

                    <button
                      type="button"
                      onClick={() => onRestoreToPlan(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                      title="Move back to active plan"
                    >
                      <Undo2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                      title="Delete permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
};
