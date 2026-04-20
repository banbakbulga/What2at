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

export function NotificationButton() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<NotifySettings | null>(null);

  useEffect(() => {
    setSettings(getNotifySettings());
  }, []);

  if (typeof window !== 'undefined' && !('Notification' in window)) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="알림 설정"
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg shadow-sm transition-transform active:scale-90 dark:bg-toss-dark-card"
      >
        {settings?.enabled ? '🔔' : '🔕'}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            {/* Panel */}
            <motion.div
              className="absolute right-0 top-12 z-50 w-72 rounded-2xl bg-white p-5 shadow-lg dark:bg-toss-dark-card"
              initial={{ opacity: 0, scale: 0.9, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <NotificationPanel
                settings={settings}
                onSettingsChange={setSettings}
                onClose={() => setOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationPanel({
  settings,
  onSettingsChange,
  onClose,
}: {
  settings: NotifySettings | null;
  onSettingsChange: (s: NotifySettings) => void;
  onClose: () => void;
}) {
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
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
        showToast('알림 권한이 거부됨');
        return;
      }
      const next = { ...settings, enabled: true };
      onSettingsChange(next);
      saveNotifySettings(next);
      scheduleNotifications(next);
      showToast('알림 켜짐! 🔔');
    } else {
      const next = { ...settings, enabled: false };
      onSettingsChange(next);
      saveNotifySettings(next);
      clearScheduledNotifications();
      showToast('알림 꺼짐');
    }
  }, [settings, onSettingsChange]);

  const handleToggleMeal = useCallback(
    (meal: MealTime) => {
      if (!settings) return;
      const next = {
        ...settings,
        meals: { ...settings.meals, [meal]: !settings.meals[meal] },
      };
      onSettingsChange(next);
      saveNotifySettings(next);
      if (next.enabled) scheduleNotifications(next);
    },
    [settings, onSettingsChange],
  );

  if (!settings) return null;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[14px] font-bold text-toss-text dark:text-toss-dark-text">
          식사 시간 알림
        </p>
        <button
          onClick={handleToggleEnabled}
          disabled={permissionDenied && !settings.enabled}
          className={`relative h-6 w-10 rounded-full transition-colors ${
            settings.enabled ? 'bg-toss-blue' : 'bg-toss-border dark:bg-toss-dark-border'
          } ${permissionDenied && !settings.enabled ? 'opacity-50' : ''}`}
          aria-label={settings.enabled ? '알림 끄기' : '알림 켜기'}
        >
          <motion.div
            className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm"
            animate={{ left: settings.enabled ? '18px' : '2px' }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>

      {permissionDenied && !settings.enabled && (
        <p className="mb-2 text-[11px] text-red-500">
          브라우저에서 알림이 차단됨. 설정에서 허용 필요.
        </p>
      )}

      <AnimatePresence>
        {settings.enabled && (
          <motion.div
            className="flex gap-2"
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
                  className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-2.5 transition-all ${
                    settings.meals[meal]
                      ? 'bg-toss-blue-light text-toss-blue dark:bg-toss-dark-elevated'
                      : 'bg-toss-bg text-toss-text-tertiary dark:bg-toss-dark-elevated dark:text-toss-dark-text-tertiary'
                  }`}
                >
                  <span className="text-base">{config.emoji}</span>
                  <span className="text-[11px] font-semibold">{config.label}</span>
                  <span className="text-[10px] opacity-70">
                    {String(config.hour).padStart(2, '0')}:{String(config.minute).padStart(2, '0')}
                  </span>
                </button>
              ),
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {toast && (
        <p className="mt-2 text-center text-[12px] font-medium text-toss-blue">{toast}</p>
      )}
    </div>
  );
}

// Keep default export for backwards compat but it's no longer used in page
export default function NotificationSettings() {
  return null;
}
