import type { AppStoreData, GlobalSettings, Plan, PlanConfig, WishItem } from '../types/plan.js';
import { CURRENCY_PRESETS } from './currency.js';

export interface CategoryMeta {
  name: string;
  color: string;
  bg: string;
  text: string;
  border: string;
}

export const CATEGORIES: Record<string, CategoryMeta> = {
  Tech: {
    name: 'Tech',
    color: 'violet',
    bg: 'bg-violet-500/10 dark:bg-violet-400/15',
    text: 'text-violet-700 dark:text-violet-300',
    border: 'border-violet-200 dark:border-violet-800',
  },
  'Home & Living': {
    name: 'Home & Living',
    color: 'amber',
    bg: 'bg-amber-500/10 dark:bg-amber-400/15',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
  },
  Travel: {
    name: 'Travel',
    color: 'sky',
    bg: 'bg-sky-500/10 dark:bg-sky-400/15',
    text: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-200 dark:border-sky-800',
  },
  Hobbies: {
    name: 'Hobbies',
    color: 'emerald',
    bg: 'bg-emerald-500/10 dark:bg-emerald-400/15',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  Health: {
    name: 'Health',
    color: 'rose',
    bg: 'bg-rose-500/10 dark:bg-rose-400/15',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
  },
  Other: {
    name: 'Other',
    color: 'slate',
    bg: 'bg-slate-500/10 dark:bg-slate-400/15',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
  },
};

export const PLAN_COLORS: Record<
  string,
  { label: string; bg: string; text: string; ring: string; gradient: string }
> = {
  violet: {
    label: 'Violet',
    bg: 'bg-violet-500',
    text: 'text-violet-600 dark:text-violet-400',
    ring: 'ring-violet-500',
    gradient: 'from-violet-600 to-indigo-600',
  },
  amber: {
    label: 'Amber',
    bg: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
    ring: 'ring-amber-500',
    gradient: 'from-amber-500 to-orange-600',
  },
  emerald: {
    label: 'Emerald',
    bg: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-emerald-500',
    gradient: 'from-emerald-600 to-teal-600',
  },
  sky: {
    label: 'Sky',
    bg: 'bg-sky-500',
    text: 'text-sky-600 dark:text-sky-400',
    ring: 'ring-sky-500',
    gradient: 'from-sky-500 to-blue-600',
  },
  rose: {
    label: 'Rose',
    bg: 'bg-rose-500',
    text: 'text-rose-600 dark:text-rose-400',
    ring: 'ring-rose-500',
    gradient: 'from-rose-500 to-pink-600',
  },
};

export const PLAN_ICONS = [
  'sparkles',
  'home',
  'laptop',
  'wrench',
  'plane',
  'heart',
  'car',
  'briefcase',
] as const;

export const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  currency: CURRENCY_PRESETS.USD,
};

// 1. Personal Wants & Tech Plan
const PERSONAL_WANTS_CONFIG: PlanConfig = {
  name: 'Personal Wants & Tech',
  currentAmountSaved: 700,
  amountToSave: 300,
  frequency: 'monthly',
  savingsDayOfMonth: 25,
  firstSavingDate: new Date().toISOString().split('T')[0],
  emergencyBuffer: 200,
  annualInterestRate: 0,
};

const PERSONAL_WANTS_ITEMS: WishItem[] = [
  {
    id: 'wish-p1',
    title: 'Sony WH-1000XM5 Headphones',
    price: 350,
    category: 'Tech',
    priority: 1,
    url: 'https://www.sony.com',
    notes: 'For focused coding and peaceful travel.',
    isPurchased: false,
    isPaused: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'wish-p2',
    title: 'Ergonomic Mechanical Keyboard & Wrist Rest',
    price: 220,
    category: 'Tech',
    priority: 2,
    notes: 'Custom tactile switches for daily programming.',
    isPurchased: false,
    isPaused: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'wish-p3',
    title: 'Weekend Cabin Trip',
    price: 500,
    category: 'Travel',
    priority: 3,
    notes: 'Hiking getaway in nature.',
    isPurchased: false,
    isPaused: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// 2. House & Living Needs Plan
const HOUSE_NEEDS_CONFIG: PlanConfig = {
  name: 'House & Living Needs',
  currentAmountSaved: 1500,
  amountToSave: 450,
  frequency: 'monthly',
  savingsDayOfMonth: 25,
  firstSavingDate: new Date().toISOString().split('T')[0],
  emergencyBuffer: 500,
  annualInterestRate: 0,
};

const HOUSE_NEEDS_ITEMS: WishItem[] = [
  {
    id: 'wish-h1',
    title: 'Smart Thermostat & Energy Monitor',
    price: 250,
    category: 'Home & Living',
    priority: 1,
    notes: 'Automate heating and reduce winter energy bills.',
    isPurchased: false,
    isPaused: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'wish-h2',
    title: 'Kitchen Dishwasher Upgrade',
    price: 750,
    category: 'Home & Living',
    priority: 2,
    notes: 'Quiet, energy-efficient model for the kitchen.',
    isPurchased: false,
    isPaused: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'wish-h3',
    title: 'Solid Oak Living Room Bookshelf',
    price: 600,
    category: 'Home & Living',
    priority: 3,
    notes: 'Storage for books, plants, and records.',
    isPurchased: false,
    isPaused: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const DEFAULT_PLANS: Plan[] = [
  {
    id: 'plan-personal-wants',
    name: 'Personal Wants & Tech',
    description: 'Gadgets, personal gear, and leisure wishlist.',
    icon: 'laptop',
    color: 'violet',
    config: PERSONAL_WANTS_CONFIG,
    items: PERSONAL_WANTS_ITEMS,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'plan-house-needs',
    name: 'House & Living Needs',
    description: 'Home renovations, furniture, and household appliances.',
    icon: 'home',
    color: 'amber',
    config: HOUSE_NEEDS_CONFIG,
    items: HOUSE_NEEDS_ITEMS,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const DEFAULT_STORE_DATA: AppStoreData = {
  version: 3,
  activePlanId: 'plan-personal-wants',
  settings: DEFAULT_GLOBAL_SETTINGS,
  plans: DEFAULT_PLANS,
  lastSaved: '1970-01-01T00:00:00.000Z',
};

export function getDefaultStoreData(): AppStoreData {
  return JSON.parse(JSON.stringify(DEFAULT_STORE_DATA));
}
