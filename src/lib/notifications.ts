const STORAGE_KEY = 'what2eat-notify-settings';

export type MealTime = 'lunch' | 'dinner' | 'nightsnack';

export type NotifySettings = {
  enabled: boolean;
  meals: Record<MealTime, boolean>;
};

export const MEAL_CONFIG: Record<MealTime, { label: string; emoji: string; hour: number; minute: number; description: string }> = {
  lunch: { label: '점심', emoji: '🍱', hour: 11, minute: 30, description: '점심 뭐 먹을지 정할 시간!' },
  dinner: { label: '저녁', emoji: '🍽️', hour: 17, minute: 30, description: '저녁 뭐 먹을지 정할 시간!' },
  nightsnack: { label: '야식', emoji: '🌙', hour: 21, minute: 30, description: '야식 뭐 먹을지 정할 시간!' },
};

export function getNotifySettings(): NotifySettings {
  if (typeof window === 'undefined') return { enabled: false, meals: { lunch: true, dinner: true, nightsnack: false } };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { enabled: false, meals: { lunch: true, dinner: true, nightsnack: false } };
}

export function saveNotifySettings(settings: NotifySettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch { /* ignore */ }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function scheduleNotifications(settings: NotifySettings): void {
  // Clear existing timers
  clearScheduledNotifications();

  if (!settings.enabled || Notification.permission !== 'granted') return;

  const now = new Date();

  for (const [meal, config] of Object.entries(MEAL_CONFIG) as [MealTime, typeof MEAL_CONFIG[MealTime]][]) {
    if (!settings.meals[meal]) continue;

    const target = new Date();
    target.setHours(config.hour, config.minute, 0, 0);

    // If time already passed today, schedule for tomorrow
    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }

    const delay = target.getTime() - now.getTime();

    const timerId = window.setTimeout(() => {
      showMealNotification(meal);
      // Reschedule for next day
      scheduleNotifications(settings);
    }, delay);

    // Store timer ID for cleanup
    const timers = getTimerIds();
    timers.push(timerId);
    sessionStorage.setItem('what2eat-notify-timers', JSON.stringify(timers));
  }
}

function getTimerIds(): number[] {
  try {
    const raw = sessionStorage.getItem('what2eat-notify-timers');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearScheduledNotifications(): void {
  const timers = getTimerIds();
  timers.forEach((id) => window.clearTimeout(id));
  sessionStorage.removeItem('what2eat-notify-timers');
}

function showMealNotification(meal: MealTime): void {
  const config = MEAL_CONFIG[meal];
  try {
    const notification = new Notification(`${config.emoji} ${config.description}`, {
      body: 'What2Eat에서 월드컵으로 정해보세요!',
      icon: '/icon.svg',
      tag: `what2eat-${meal}`,
      requireInteraction: false,
    });
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch { /* ignore */ }
}
