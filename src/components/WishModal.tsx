import React, { useState, useEffect } from 'react';
import { Sparkles, Link, Coins, FileText } from 'lucide-react';
import type { ComputedWishItem, CurrencyConfig, Plan, WishItem } from '../types/plan';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { CATEGORIES } from '../utils/defaults';
import { ResponsiveOverlay } from './ResponsiveOverlay';
import { parsePriceInput } from '../utils/formatters';

interface WishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    itemData: Omit<WishItem, 'id' | 'createdAt' | 'updatedAt' | 'isPurchased' | 'isPaused'>,
    existingId?: string,
    targetPlanId?: string
  ) => void;
  editingItem?: ComputedWishItem | null;
  currency: CurrencyConfig;
  currentCount: number;
  plans?: Plan[];
  activePlanId?: string;
  isQuickAdd?: boolean;
}

export const WishModal: React.FC<WishModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  currency,
  currentCount,
  plans,
  activePlanId,
  isQuickAdd,
}) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Tech');
  const [priority, setPriority] = useState<number>(1);
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    activePlanId || (plans && plans[0]?.id) || ''
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedPlanId(activePlanId || (plans && plans[0]?.id) || '');
    }
  }, [isOpen, activePlanId, plans]);

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

    const numPrice = parsePriceInput(price);
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
      editingItem?.id,
      selectedPlanId
    );
    onClose();
  };

  return (
    <ResponsiveOverlay
      isOpen={isOpen}
      onClose={onClose}
      title={editingItem ? 'Edit Wish Item' : 'Add New Wish Item'}
    >
      <div className="flex flex-col space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {editingItem
              ? 'Update target details and priority'
              : 'Add a target item to your priority queue'}
          </span>
        </div>

        {/* Modal Form Body */}

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="space-y-4 min-w-0 max-w-full">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Target Plan Selector */}
          {!editingItem && !isQuickAdd && plans && plans.length > 0 && (
            <div>
              <Label className="block mb-1.5">Target Plan</Label>
              <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select target plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Title */}
          <div>
            <Label className="block mb-1.5">Item Title *</Label>
            <Input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Robotstøvsuger, Camera, Studio Display"
            />
          </div>

          {/* Price & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 min-w-0">
            <div className="min-w-0">
              <Label className="block mb-1.5">Cost / Price ({currency.symbol}) *</Label>
              <div className="relative min-w-0 w-full">
                <Coins className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                <Input
                  type="text"
                  inputMode="decimal"
                  required
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="min-w-0">
              <Label className="block mb-1.5">Priority Ranking (1 = Highest)</Label>
              <Input
                type="number"
                min="1"
                value={priority}
                onChange={e => setPriority(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <Label className="block mb-1.5">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(CATEGORIES).map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product URL */}
          <div>
            <Label className="block mb-1.5">Product Link (Optional)</Label>
            <div className="relative">
              <Link className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://..."
                className="pl-9"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label className="block mb-1.5">Notes & Thoughts (Optional)</Label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <Textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Why do you want this item? Any model specs?"
                className="pl-9"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="default">
              {editingItem ? 'Save Changes' : 'Add to Plan'}
            </Button>
          </div>
        </form>
      </div>
    </ResponsiveOverlay>
  );
};
