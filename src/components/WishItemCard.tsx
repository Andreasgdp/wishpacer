import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  ExternalLink,
  CheckCircle,
  Pause,
  Play,
  Edit2,
  Trash2,
  Sparkles,
  Calendar,
  Layers,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { ComputedWishItem, CurrencyConfig } from '../types/plan';
import { formatCurrency } from '../utils/currency';
import { AnimatedCurrency } from './AnimatedCurrency';
import { Progress } from './ui/progress';
import { CATEGORIES } from '../utils/defaults';

interface WishItemCardProps {
  item: ComputedWishItem;
  currency: CurrencyConfig;
  index: number;
  totalActive: number;
  onEdit: (item: ComputedWishItem) => void;
  onDelete: (id: string) => void;
  onTogglePurchased: (id: string) => void;
  onTogglePaused: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}

export const WishItemCard: React.FC<WishItemCardProps> = ({
  item,
  currency,
  index,
  totalActive,
  onEdit,
  onDelete,
  onTogglePurchased,
  onTogglePaused,
  onMoveUp,
  onMoveDown,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  const categoryMeta = CATEGORIES[item.category] || CATEGORIES.Other;

  const handlePurchaseClick = () => {
    if (!item.isPurchased) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback
      }
    }
    onTogglePurchased(item.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 ${
        item.isPurchased
          ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10'
          : item.isPaused
            ? 'border-dashed border-slate-300 dark:border-slate-800 opacity-60'
            : item.isAffordable
              ? 'border-emerald-300 dark:border-emerald-800/80 shadow-xs hover:shadow-md'
              : 'border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
      }`}
    >
      <div className="p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        {/* Left Drag Handle & Priority Rank */}
        <div className="flex items-center justify-between sm:justify-start gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-none"
              aria-label="Drag to reorder priority"
              title="Drag to reorder priority"
            >
              <GripVertical className="w-4 h-4" />
            </button>

            {/* Up/Down Arrow buttons for touch or keyboard accessibility */}
            <div className="flex flex-row sm:flex-col gap-0.5">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => onMoveUp(item.id)}
                className="p-1 sm:p-0.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 transition-colors"
                title="Move up in priority"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={index === totalActive - 1}
                onClick={() => onMoveDown(item.id)}
                className="p-1 sm:p-0.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 transition-colors"
                title="Move down in priority"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                item.isAffordable && !item.isPurchased
                  ? 'bg-emerald-500 text-white shadow-xs shadow-emerald-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              #{item.priority}
            </div>
          </div>

          {/* Price header on mobile (shown on right side of top row on mobile) */}
          <div className="sm:hidden text-right">
            <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
              <AnimatedCurrency value={item.price} currency={currency} />
            </span>
          </div>
        </div>

        {/* Middle Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
            {/* Category badge */}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold border ${categoryMeta.bg} ${categoryMeta.text} ${categoryMeta.border}`}
            >
              {categoryMeta.name}
            </span>

            {/* Status Pill */}
            {item.isPurchased ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <CheckCircle className="w-3 h-3" /> Purchased
              </span>
            ) : item.isPaused ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                <Pause className="w-3 h-3" /> Paused (Simulation)
              </span>
            ) : item.isAffordable ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold bg-emerald-500 text-white shadow-xs">
                <Sparkles className="w-3 h-3" /> {item.humanTimeRemaining}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-medium bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60">
                <Calendar className="w-3 h-3 text-brand-500 flex-shrink-0" />
                {item.projectedDate && (
                  <>
                    <strong className="font-semibold">{item.formattedProjectedDate}</strong>
                    <span className="mx-1 opacity-60">•</span>
                  </>
                )}
                <span>{item.humanTimeRemaining}</span>
              </span>
            )}
          </div>

          {/* Title & Link */}
          <div className="flex items-center gap-2">
            <h3
              className={`text-sm sm:text-base font-semibold truncate ${
                item.isPurchased
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {item.title}
            </h3>
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors p-1"
                title="Open product link"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Notes if present */}
          {item.notes && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 sm:line-clamp-1">
              {item.notes}
            </p>
          )}

          {/* Per-item Savings Progress Bar */}
          {!item.isPurchased && !item.isPaused && (
            <div className="mt-2.5 sm:mt-3 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1 truncate text-[11px] sm:text-xs">
                  <Layers className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="truncate">
                    Allocated:{' '}
                    <strong className="text-slate-700 dark:text-slate-300">
                      <AnimatedCurrency value={item.availableSavings} currency={currency} />
                    </strong>{' '}
                    of {formatCurrency(item.price, currency)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11px] sm:text-xs flex-shrink-0 ml-1">
                  {item.deficit > 0 ? (
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      -{formatCurrency(item.deficit, currency)}
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">100%</span>
                  )}
                </div>
              </div>

              {/* Bar */}
              <Progress
                value={Math.min(100, Math.max(0, item.progressPercent))}
                indicatorClassName={
                  item.isAffordable ? 'bg-emerald-500' : 'bg-brand-600 dark:bg-brand-500'
                }
              />
            </div>
          )}
        </div>

        {/* Right Financial Price (Desktop) & Action Buttons */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2.5 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
          <div className="text-right hidden sm:block">
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white font-mono">
              <AnimatedCurrency value={item.price} currency={currency} />
            </span>
            <div className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
              Cumulative: <AnimatedCurrency value={item.cumulativeTarget} currency={currency} />
            </div>
          </div>

          {/* Cumulative on Mobile */}
          <div className="sm:hidden text-xs text-slate-400 font-mono">
            Cumulative: <AnimatedCurrency value={item.cumulativeTarget} currency={currency} />
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-1">
            {/* Mark as Purchased */}
            <button
              type="button"
              onClick={handlePurchaseClick}
              className={`p-2 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${
                item.isPurchased
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
              title={item.isPurchased ? 'Mark as planned' : 'Mark as purchased'}
            >
              <CheckCircle className="w-4 h-4" />
            </button>

            {/* Pause / Resume for what-if scenarios */}
            <button
              type="button"
              onClick={() => onTogglePaused(item.id)}
              className={`p-2 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${
                item.isPaused
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                  : 'text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
              }`}
              title={item.isPaused ? 'Include in active plan' : 'Temporarily pause item'}
            >
              {item.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>

            {/* Edit */}
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="p-2 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Edit wish"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Delete wish"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
