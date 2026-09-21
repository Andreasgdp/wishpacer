import React, { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Search, Plus, Filter, Sparkles, ListOrdered } from 'lucide-react';
import * as m from 'motion/react-m';
import { AnimatePresence } from 'motion/react';
import type { ComputedWishItem, CurrencyConfig } from '../types/plan';
import { WishItemCard } from './WishItemCard';
import { Input } from './ui/input';
import { CATEGORIES } from '../utils/defaults';

interface WishListProps {
  items: ComputedWishItem[];
  currency: CurrencyConfig;
  onReorder: (activeId: string, overId: string) => void;
  onEdit: (item: ComputedWishItem) => void;
  onDelete: (id: string) => void;
  onTogglePurchased: (id: string) => void;
  onTogglePaused: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onOpenAddModal: () => void;
}

export const WishList: React.FC<WishListProps> = ({
  items,
  currency,
  onReorder,
  onEdit,
  onDelete,
  onTogglePurchased,
  onTogglePaused,
  onMoveUp,
  onMoveDown,
  onOpenAddModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterAffordableOnly, setFilterAffordableOnly] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Active items for sorting
  const activeItems = useMemo(() => {
    return items.filter(i => !i.isPurchased);
  }, [items]);

  const filteredItems = useMemo(() => {
    return activeItems.filter(item => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

      const matchesAffordable = !filterAffordableOnly || item.isAffordable;

      return matchesSearch && matchesCategory && matchesAffordable;
    });
  }, [activeItems, searchQuery, selectedCategory, filterAffordableOnly]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(active.id.toString(), over.id.toString());
    }
  };

  const categoriesList = ['all', ...Object.keys(CATEGORIES)];

  return (
    <div className="space-y-4">
      {/* Top Controls Bar: Search & Filter Pills */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search wishes by name, notes, or category..."
            className="pl-9 pr-12"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filters & Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Affordable filter toggle */}
          <button
            type="button"
            onClick={() => setFilterAffordableOnly(!filterAffordableOnly)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filterAffordableOnly
                ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Affordable Now</span>
          </button>

          {/* Add item quick button */}
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-xs transition-colors ml-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto touch-pan-x pb-1 scrollbar-none text-xs">
        <span className="text-slate-400 flex items-center gap-1 pl-1 pr-2 font-medium">
          <Filter className="w-3 h-3" /> Categories:
        </span>
        {categoriesList.map(cat => {
          const isSelected = selectedCategory === cat;
          const label = cat === 'all' ? 'All Wishes' : cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full font-medium whitespace-nowrap transition-colors border ${
                isSelected
                  ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Reorderable Items List */}
      {filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-dashed border-slate-300 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-4">
            <ListOrdered className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            {searchQuery || selectedCategory !== 'all' || filterAffordableOnly
              ? 'No matching items found'
              : 'Your wishlist is empty'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1.5 mb-5">
            {searchQuery || selectedCategory !== 'all' || filterAffordableOnly
              ? 'Try resetting your search query or category filters.'
              : 'Add items you wish to purchase along with their price to start planning and predicting purchase dates!'}
          </p>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Your First Wish</span>
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={filteredItems.map(i => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredItems.map((item, idx) => (
                  <m.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    <WishItemCard
                      item={item}
                      currency={currency}
                      index={idx}
                      totalActive={filteredItems.length}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onTogglePurchased={onTogglePurchased}
                      onTogglePaused={onTogglePaused}
                      onMoveUp={onMoveUp}
                      onMoveDown={onMoveDown}
                    />
                  </m.div>
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};
