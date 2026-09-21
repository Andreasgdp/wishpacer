import React, { useState, useEffect } from 'react';
import { X, Sparkles, Link, Coins, Tag, FileText } from 'lucide-react';
import type { ComputedWishItem, CurrencyConfig, WishItem } from '../types/plan';
import { CATEGORIES } from '../utils/defaults';
import { ModalBackdrop } from './ModalBackdrop';

interface WishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    itemData: Omit<WishItem, 'id' | 'createdAt' | 'updatedAt' | 'isPurchased' | 'isPaused'>,
    existingId?: string
  ) => void;
  editingItem?: ComputedWishItem | null;
  currency: CurrencyConfig;
  currentCount: number;
}

export const WishModal: React.FC<WishModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  currency,
  currentCount,
}) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Tech');
  const [priority, setPriority] = useState<number>(1);
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title);
      setPrice(editingItem.price.toString());
      setCategory(editingItem.category || 'Tech');
      setPriority(editingItem.priority);
      setUrl(editingItem.url || '');
      setNotes(editingItem.notes || '');
    } else {
      setTitle('');
      setPrice('');
      setCategory('Tech');
      setPriority(currentCount + 1);
      setUrl('');
      setNotes('');
    }
    setError('');
  }, [editingItem, isOpen, currentCount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for the wish.');
      return;
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Please provide a valid price greater than zero.');
      return;
    }

    onSave(
      {
        title: title.trim(),
        price: numPrice,
        category,
        priority: Math.max(1, Number(priority) || 1),
        url: url.trim() || undefined,
        notes: notes.trim() || undefined,
      },
      editingItem?.id
    );
    onClose();
  };

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between min-w-0 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
              {editingItem ? 'Edit Wish Item' : 'Add New Wish Item'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 space-y-4 overflow-y-auto overflow-x-hidden min-w-0 max-w-full"
        >
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Item Title *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Robotstøvsuger, Camera, Studio Display"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Price & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 min-w-0">
            <div className="min-w-0">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Cost / Price ({currency.symbol}) *
              </label>
              <div className="relative min-w-0 w-full">
                <Coins className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full min-w-0 pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div className="min-w-0">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Priority Ranking (1 = Highest)
              </label>
              <input
                type="number"
                min="1"
                value={priority}
                onChange={e => setPriority(Number(e.target.value))}
                className="w-full min-w-0 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors appearance-none"
              >
                {Object.keys(CATEGORIES).map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Product Link (Optional)
            </label>
            <div className="relative">
              <Link className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Notes & Thoughts (Optional)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Why do you want this item? Any model specs?"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20 active:scale-95 transition-all"
            >
              {editingItem ? 'Save Changes' : 'Add to Plan'}
            </button>
          </div>
        </form>
      </div>
    </ModalBackdrop>
  );
};
