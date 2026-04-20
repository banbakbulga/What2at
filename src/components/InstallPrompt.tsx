'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  const handleInstall = async () => {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-5 left-5 right-5 z-40 mx-auto max-w-lg animate-[fade-in-up_300ms_ease-out] rounded-2xl bg-white p-4 shadow-lg dark:bg-toss-dark-card">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-toss-blue-light text-lg dark:bg-toss-dark-elevated">
          🍽️
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-bold text-toss-text dark:text-toss-dark-text">
            홈 화면에 추가
          </p>
          <p className="text-[12px] text-toss-text-secondary dark:text-toss-dark-text-secondary">
            앱처럼 바로 실행할 수 있어요
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-lg px-3 py-2 text-[13px] text-toss-text-tertiary dark:text-toss-dark-text-tertiary"
          aria-label="닫기"
        >
          닫기
        </button>
        <button
          onClick={handleInstall}
          className="shrink-0 rounded-lg bg-toss-blue px-4 py-2 text-[13px] font-semibold text-white transition-transform active:scale-95"
        >
          설치
        </button>
      </div>
    </div>
  );
}
