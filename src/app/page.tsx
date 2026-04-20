'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import LocationPicker, { type PlayMode } from '@/components/LocationPicker';
import ModePicker from '@/components/ModePicker';
import Roulette from '@/components/Roulette';
import Tournament from '@/components/Tournament';
import IntroScreen, { hasCompletedOnboarding } from '@/components/IntroScreen';
import EmojiTransition from '@/components/EmojiTransition';
import { getModeConfig, type Mode } from '@/config/modes';
import DeliveryPicker from '@/components/DeliveryPicker';
import {
  useNearbyRestaurants,
  RADIUS_OPTIONS,
  RADIUS_LABELS,
  type BracketSize,
  type Coords,
  type RadiusOption,
  type Restaurant,
} from '@/hooks/useNearbyRestaurants';
import { TournamentSkeleton } from '@/components/LoadingSkeleton';
import ThemeToggle from '@/components/ThemeToggle';
import { getHistory, type HistoryEntry } from '@/lib/history';
import { getCategoryEmoji } from '@/lib/display';
import NotificationSettings from '@/components/NotificationSettings';
import { getNotifySettings, scheduleNotifications } from '@/lib/notifications';

type AppPhase = 'intro' | 'transition' | 'main';

export default function Home() {
  const [phase, setPhase] = useState<AppPhase>('main');

  const [mode, setMode] = useState<Mode | null>(null);
  const [center, setCenter] = useState<Coords | null>(null);
  const [customCandidates, setCustomCandidates] = useState<Restaurant[]>([]);
  const [excludedCategoryIds, setExcludedCategoryIds] = useState<string[]>([]);
  const [size, setSize] = useState<BracketSize>(16);
  const [radius, setRadius] = useState<RadiusOption>(1000);
  const [playMode, setPlayMode] = useState<PlayMode>('tournament');
  const [resetKey, setResetKey] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (!hasCompletedOnboarding()) setPhase('intro');
    setHistory(getHistory());
    // Resume notification schedule if enabled
    const notifySettings = getNotifySettings();
    if (notifySettings.enabled) scheduleNotifications(notifySettings);
  }, []);

  const modeConfig = mode ? getModeConfig(mode) : null;
  const isDelivery = mode === 'delivery';

  // 배달 모드가 아닐 때만 API 호출
  const { restaurants, loading, error } = useNearbyRestaurants(
    isDelivery ? null : center,
    size,
    isDelivery ? null : modeConfig,
    customCandidates,
    excludedCategoryIds,
    radius,
  );

  // 배달 모드용 데이터
  const [deliveryMenus, setDeliveryMenus] = useState<Restaurant[]>([]);
  const [deliverySize, setDeliverySize] = useState<BracketSize>(16);
  const deliveryReady = isDelivery && deliveryMenus.length >= deliverySize;

  // 현재 활성 레스토랑 목록
  const activeRestaurants = isDelivery ? deliveryMenus : restaurants;
  const activeSize = isDelivery ? deliverySize : size;
  const activeReady = isDelivery
    ? deliveryReady
    : !loading && !error && activeRestaurants.length === size;

  const handleIntroDone = useCallback(() => {
    setPhase('transition');
  }, []);

  const handleTransitionFilled = useCallback(() => {}, []);

  const handleTransitionComplete = useCallback(() => {
    setPhase('main');
  }, []);

  const handleSelectMode = (selected: Mode) => {
    setMode(selected);
    if (selected === 'delivery') {
      setDeliveryMenus([]);
      setPlayMode('tournament');
    }
  };

  const handleDeliveryStart = (menus: Restaurant[], sz: BracketSize) => {
    setDeliveryMenus(menus);
    setDeliverySize(sz);
    setPlayMode('tournament');
  };

  const handleConfirmLocation = (
    coords: Coords,
    candidates: Restaurant[],
    excluded: string[],
    nextPlayMode: PlayMode,
  ) => {
    setCenter(coords);
    setCustomCandidates(candidates);
    setExcludedCategoryIds(excluded);
    setPlayMode(nextPlayMode);
  };

  const handleBackToMode = () => {
    setMode(null);
    setCenter(null);
    setCustomCandidates([]);
    setExcludedCategoryIds([]);
    setDeliveryMenus([]);
    setPlayMode('tournament');
    setResetKey(0);
  };

  const handleBackToLocation = () => {
    setCenter(null);
    setCustomCandidates([]);
    setExcludedCategoryIds([]);
    setPlayMode('tournament');
    setResetKey(0);
  };

  const handleRetry = () => {
    setResetKey((k) => k + 1);
    const prev = center;
    setCenter(null);
    setTimeout(() => setCenter(prev), 0);
  };

  const handleExpandRadius = () => {
    const idx = RADIUS_OPTIONS.indexOf(radius);
    if (idx < RADIUS_OPTIONS.length - 1) {
      setRadius(RADIUS_OPTIONS[idx + 1]);
      handleRetry();
    }
  };

  const handleResetTournament = () => {
    setResetKey((k) => k + 1);
    setHistory(getHistory());
  };

  const playKey = isDelivery
    ? `delivery,${deliverySize},${resetKey}`
    : mode && center
      ? `${mode},${center.lat},${center.lng},${size},${radius},${playMode},${resetKey}`
      : 'idle';

  const notEnough =
    !isDelivery && mode && center && !loading && !error && restaurants.length > 0 && restaurants.length < size;
  const noResults =
    !isDelivery && mode && center && !loading && !error && restaurants.length === 0;

  return (
    <>
      {phase === 'intro' && <IntroScreen onDone={handleIntroDone} />}

      {phase === 'transition' && (
        <EmojiTransition
          onFilled={handleTransitionFilled}
          onComplete={handleTransitionComplete}
        />
      )}

      {phase !== 'intro' && (
        <motion.main
          id="main-content"
          className="min-h-screen bg-toss-bg dark:bg-toss-dark-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: phase === 'transition' ? 0.9 : 0 }}
        >
          <div className="mx-auto max-w-lg px-5 pb-10 pt-6">
            <header className="mb-8 flex items-start justify-between">
              <div>
                <p className="mb-1 text-xs font-medium text-toss-text-tertiary dark:text-toss-dark-text-tertiary">
                  What2Eat
                </p>
                <h1 className="text-[22px] font-bold leading-tight text-toss-text dark:text-toss-dark-text">
                  {modeConfig?.title ?? '오늘 뭐먹지'}
                </h1>
                <p className="mt-1.5 text-[15px] leading-relaxed text-toss-text-secondary dark:text-toss-dark-text-secondary">
                  월드컵으로 오늘 한 곳을 선택해요
                </p>
              </div>
              <ThemeToggle />
            </header>

            {/* 최근 결과 */}
            {!mode && history.length > 0 && (
              <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm dark:bg-toss-dark-card">
                <p className="mb-3 text-[15px] font-bold text-toss-text dark:text-toss-dark-text">
                  최근 우승 🏆
                </p>
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                  {history.map((h) => (
                    <a
                      key={h.timestamp}
                      href={h.restaurant.place_url || '#'}
                      target={h.restaurant.place_url ? '_blank' : undefined}
                      rel="noreferrer"
                      className="flex shrink-0 items-center gap-2 rounded-xl bg-toss-bg px-3 py-2 transition-transform active:scale-95 dark:bg-toss-dark-elevated"
                    >
                      <span className="text-lg">{getCategoryEmoji(h.restaurant.category_name)}</span>
                      <span className="max-w-[100px] truncate text-[13px] font-semibold text-toss-text dark:text-toss-dark-text">
                        {h.restaurant.place_name}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* 알림 설정 */}
            {!mode && (
              <div className="mb-6">
                <NotificationSettings />
              </div>
            )}

            {/* 모드 선택 (2x2 그리드) */}
            {!mode && <ModePicker onSelect={handleSelectMode} />}

            {/* 배달 모드 설정 */}
            {isDelivery && !deliveryReady && (
              <DeliveryPicker onStart={handleDeliveryStart} onBack={handleBackToMode} />
            )}

            {/* 위치 선택 (배달 모드 제외) */}
            {mode && modeConfig && !isDelivery && !center && (
              <LocationPicker
                mode={modeConfig}
                size={size}
                onSizeChange={setSize}
                radius={radius}
                onRadiusChange={setRadius}
                onConfirm={handleConfirmLocation}
                onBack={handleBackToMode}
              />
            )}

            {/* 로딩 (배달 모드 제외) */}
            {mode && !isDelivery && center && loading && <TournamentSkeleton />}

            {/* 네트워크 에러 */}
            {mode && !isDelivery && center && !loading && error && (
              <div className="space-y-3">
                <div role="alert" className="rounded-2xl bg-white p-5 shadow-sm dark:bg-toss-dark-card">
                  <p className="text-[15px] leading-relaxed text-toss-text dark:text-toss-dark-text">
                    {error}
                  </p>
                  <p className="mt-2 text-[13px] text-toss-text-secondary dark:text-toss-dark-text-secondary">
                    네트워크 연결을 확인하거나 다른 위치를 시도해 보세요.
                  </p>
                </div>
                <button
                  onClick={handleRetry}
                  className="w-full rounded-2xl bg-toss-blue px-4 py-3.5 text-[15px] font-semibold text-white transition-transform active:scale-[0.97]"
                >
                  다시 시도
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={handleBackToLocation}
                    className="flex-1 rounded-2xl bg-white px-4 py-3.5 text-[15px] font-semibold text-toss-text shadow-sm transition-transform active:scale-[0.97] dark:bg-toss-dark-card dark:text-toss-dark-text"
                  >
                    위치 다시 선택
                  </button>
                  <button
                    onClick={handleBackToMode}
                    className="flex-1 rounded-2xl bg-white px-4 py-3.5 text-[15px] font-semibold text-toss-text shadow-sm transition-transform active:scale-[0.97] dark:bg-toss-dark-card dark:text-toss-dark-text"
                  >
                    모드 바꾸기
                  </button>
                </div>
              </div>
            )}

            {/* 결과 부족 */}
            {(notEnough || (noResults && !error)) && (
              <div className="space-y-3">
                <div role="alert" className="rounded-2xl bg-white p-5 shadow-sm dark:bg-toss-dark-card">
                  <p className="text-[15px] leading-relaxed text-toss-text dark:text-toss-dark-text">
                    현재 반경({RADIUS_LABELS[radius]})에서 조건에 맞는 장소가{' '}
                    <span className="font-bold text-toss-blue">{restaurants.length}곳</span>
                    {restaurants.length > 0 ? `밖에 없어요 (${size}곳 필요)` : '도 없어요'}
                  </p>
                </div>
                {radius < RADIUS_OPTIONS[RADIUS_OPTIONS.length - 1] && (
                  <button
                    onClick={handleExpandRadius}
                    className="w-full rounded-2xl bg-toss-blue px-4 py-3.5 text-[15px] font-semibold text-white transition-transform active:scale-[0.97]"
                  >
                    반경 {RADIUS_LABELS[RADIUS_OPTIONS[RADIUS_OPTIONS.indexOf(radius) + 1]]}로 넓혀서 다시 검색
                  </button>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={handleBackToLocation}
                    className="flex-1 rounded-2xl bg-white px-4 py-3.5 text-[15px] font-semibold text-toss-text shadow-sm transition-transform active:scale-[0.97] dark:bg-toss-dark-card dark:text-toss-dark-text"
                  >
                    위치 다시 선택
                  </button>
                  <button
                    onClick={handleBackToMode}
                    className="flex-1 rounded-2xl bg-white px-4 py-3.5 text-[15px] font-semibold text-toss-text shadow-sm transition-transform active:scale-[0.97] dark:bg-toss-dark-card dark:text-toss-dark-text"
                  >
                    모드 바꾸기
                  </button>
                </div>
              </div>
            )}

            {/* 토너먼트/룰렛 */}
            {mode && modeConfig && activeReady && activeRestaurants.length >= activeSize && (
              <div>
                <div className="mb-4 flex items-center justify-end gap-3">
                  {!isDelivery && (
                    <>
                      <button
                        onClick={handleBackToLocation}
                        className="rounded-lg px-2 py-1.5 text-[13px] text-toss-text-tertiary transition-colors hover:text-toss-text dark:text-toss-dark-text-tertiary dark:hover:text-toss-dark-text"
                      >
                        위치 다시 선택
                      </button>
                      <span className="text-toss-border dark:text-toss-dark-border">|</span>
                    </>
                  )}
                  <button
                    onClick={handleBackToMode}
                    className="rounded-lg px-2 py-1.5 text-[13px] text-toss-text-tertiary transition-colors hover:text-toss-text dark:text-toss-dark-text-tertiary dark:hover:text-toss-dark-text"
                  >
                    모드 바꾸기
                  </button>
                </div>
                {playMode === 'tournament' ? (
                  <Tournament
                    key={playKey}
                    restaurants={activeRestaurants.slice(0, activeSize)}
                    onReset={handleResetTournament}
                    championLabel={modeConfig.championLabel}
                    modeId={mode}
                    isDelivery={isDelivery}
                  />
                ) : (
                  <Roulette
                    key={playKey}
                    restaurants={activeRestaurants.slice(0, activeSize)}
                    onReset={handleResetTournament}
                    championLabel={modeConfig.championLabel}
                    modeId={mode}
                  />
                )}
              </div>
            )}
          </div>
        </motion.main>
      )}
    </>
  );
}
