'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getNotifySettings,
  saveNotifySettings,
  requestNotificationPermission,
  scheduleNotifications,
  clearScheduledNotifications,
  MEAL_CONFIG,
  type MealTime,
  type NotifySettings,
} from '@/lib/notifications';

export default function NotificationSettings() {
  const [settings, setSettings] = useState<NotifySettings | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setSettings(getNotifySettings());
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionDenied(Notification.permission === 'denied');
    }
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleToggleEnabled = useCallback(async () => {
    if (!settings) return;

    if (!settings.enabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setPermissionDenied(Notification.permission === 'denied');
        showToast('알림 권한이 거부되었어요');
        return;
      }
      const next = { ...settings, enabled: true };
      setSettings(next);
      saveNotifySettings(next);
      scheduleNotifications(next);
      showToast('알림이 켜졌어요! 🔔');
    } else {
      const next = { ...settings, enabled: false };
      setSettings(next);
      saveNotifySettings(next);
      clearScheduledNotifications();
      showToast('알림이 꺼졌어요');
    }
  }, [settings]);

  const handleToggleMeal = useCallback(
    (meal: MealTime) => {
      if (!settings) return;
      const next = {
        ...settings,
        meals: { ...settings.meals, [meal]: !settings.meals[meal] },
      };
      setSettings(next);
      saveNotifySettings(next);
      if (next.enabled) scheduleNotifications(next);
    },
    [settings],
  );

  if (!settings) return null;
  if (typeof window !== 'undefined' && !('Notification' in window)) return null;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-toss-dark-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[15px] font-bold text-toss-text dark:text-toss-dark-text">
            🔔 식사 시간 알림
          </p>
          <p className="mt-0.5 text-[13px] text-toss-text-secondary dark:text-toss-dark-text-secondary">
            시간 되면 알려드릴게요
          </p>
        </div>
        <button
          onClick={handleToggleEnabled}
          disabled={permissionDenied && !settings.enabled}
          className={`relative h-7 w-12 rounded-full transition-colors ${
            settings.enabled ? 'bg-toss-blue' : 'bg-toss-border dark:bg-toss-dark-border'
          } ${permissionDenied && !settings.enabled ? 'opacity-50' : ''}`}
          aria-label={settings.enabled ? '알림 끄기' : '알림 켜기'}
        >
          <motion.div
            className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm"
            animate={{ left: settings.enabled ? '22px' : '2px' }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>

      {permissionDenied && !settings.enabled && (
        <p className="mt-2 text-[12px] text-red-500">
          브라우저에서 알림이 차단되어 있어요. 설정에서 허용해 주세요.
        </p>
      )}

      <AnimatePresence>
        {settings.enabled && (
          <motion.div
            className="mt-4 flex gap-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {(Object.entries(MEAL_CONFIG) as [MealTime, typeof MEAL_CONFIG[MealTime]][]).map(
              ([meal, config]) => (
                <button
                  key={meal}
                  onClick={() => handleToggleMeal(meal)}
                  className={`flex flex-1 flex-col items-center gap-1 rounded-xl px-3 py-3 text-center transition-all ${
                    settings.meals[meal]
                      ? 'bg-toss-blue-light text-toss-blue dark:bg-toss-dark-elevated'
                      : 'bg-toss-bg text-toss-text-tertiary dark:bg-toss-dark-elevated dark:text-toss-dark-text-tertiary'
                  }`}
                >
                  <span className="text-lg">{config.emoji}</span>
                  <span className="text-[12px] font-semibold">{config.label}</span>
                  <span className="text-[11px] opacity-70">
                    {String(config.hour).padStart(2, '0')}:{String(config.minute).padStart(2, '0')}
                  </span>
                </button>
              ),
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-toss-text px-5 py-2.5 text-[14px] font-medium text-white shadow-lg dark:bg-toss-dark-text dark:text-toss-dark-bg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
