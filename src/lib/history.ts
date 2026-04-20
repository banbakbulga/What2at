import type { Restaurant } from '@/hooks/useNearbyRestaurants';

export type HistoryEntry = {
  restaurant: Restaurant;
  timestamp: number;
  mode: string;
};

const STORAGE_KEY = 'what2eat-history';
const MAX_ENTRIES = 5;

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function addToHistory(entry: HistoryEntry): void {
  try {
    const history = getHistory();
    // 중복 제거 (같은 식당)
    const filtered = history.filter((h) => h.restaurant.id !== entry.restaurant.id);
    const updated = [entry, ...filtered].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}
