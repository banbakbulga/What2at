'use client';

import { useCallback, useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Restaurant } from '@/hooks/useNearbyRestaurants';
import {
  getCategoryEmoji,
  getCategoryPath,
  getWalkingTime,
} from '@/lib/display';
import { addToHistory } from '@/lib/history';
import { shareResultCard } from '@/lib/shareCard';

type Props = {
  restaurants: Restaurant[];
  onReset: () => void;
  championLabel?: string;
  modeId?: string;
  isDelivery?: boolean;
};

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getRoundLabel(size: number): string {
  if (size >= 32) return '32강';
  if (size >= 16) return '16강';
  if (size >= 8) return '8강';
  if (size >= 4) return '4강';
  if (size >= 2) return '결승';
  return '';
}

function haptic(ms = 10) {
  try {
    navigator?.vibrate?.(ms);
  } catch {
    // ignore
  }
}

const ROUND_TRANSITION_MS = 1200;

export default function Tournament({
  restaurants,
  onReset,
  championLabel = '오늘의 우승 메뉴',
  modeId = 'lunch',
  isDelivery = false,
}: Props) {
  const initialBracket = useMemo(() => shuffle(restaurants), [restaurants]);
  const [bracket, setBracket] = useState<Restaurant[]>(initialBracket);
  const [winners, setWinners] = useState<Restaurant[]>([]);
  const [matchIndex, setMatchIndex] = useState(0);
  const [champion, setChampion] = useState<Restaurant | null>(null);
  const [roundTransition, setRoundTransition] = useState<string | null>(null);
  const [matchKey, setMatchKey] = useState(0);

  const left = bracket[matchIndex * 2];
  const right = bracket[matchIndex * 2 + 1];
  const totalMatches = bracket.length / 2;
  const roundLabel = getRoundLabel(bracket.length);

  const totalRounds = Math.log2(restaurants.length);
  const currentRoundNumber = totalRounds - Math.log2(bracket.length) + 1;
  const overallProgress =
    ((currentRoundNumber - 1) / totalRounds +
      matchIndex / totalMatches / totalRounds) *
    100;

  const advanceRound = useCallback((nextBracket: Restaurant[]) => {
    const nextRoundLabel = getRoundLabel(nextBracket.length);
    const message =
      nextBracket.length === 2
        ? '🔥 결승전 시작!'
        : `${nextRoundLabel} 대진 생성 중...`;

    setRoundTransition(message);
    haptic(30);

    setTimeout(() => {
      setBracket(nextBracket);
      setWinners([]);
      setMatchIndex(0);
      setMatchKey((k) => k + 1);
      setRoundTransition(null);
    }, ROUND_TRANSITION_MS);
  }, []);

  const handlePick = useCallback(
    (winner: Restaurant) => {
      haptic();

      const nextWinners = [...winners, winner];
      const nextMatchIndex = matchIndex + 1;

      if (nextMatchIndex < totalMatches) {
        setWinners(nextWinners);
        setMatchIndex(nextMatchIndex);
        setMatchKey((k) => k + 1);
        return;
      }

      if (nextWinners.length === 1) {
        haptic(50);
        setChampion(nextWinners[0]);
        addToHistory({ restaurant: nextWinners[0], timestamp: Date.now(), mode: modeId });
        return;
      }

      advanceRound(nextWinners);
    },
    [winners, matchIndex, totalMatches, advanceRound, modeId],
  );

  if (champion) {
    return (
      <ChampionScreen champion={champion} onReset={onReset} label={championLabel} isDelivery={isDelivery} modeId={modeId} bracketSize={restaurants.length} />
    );
  }

  return (
    <div role="region" aria-label={`${roundLabel} ${matchIndex + 1}/${totalMatches}`}>
      <div
        className="mb-6 overflow-hidden rounded-full bg-toss-border dark:bg-toss-dark-border"
        role="progressbar"
        aria-valuenow={Math.round(overallProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="토너먼트 진행률"
      >
        <motion.div
          className="h-1 rounded-full bg-toss-blue"
          animate={{ width: `${overallProgress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-[20px] font-bold text-toss-text dark:text-toss-dark-text">
            {roundLabel}
          </span>
          <span className="text-[15px] font-medium text-toss-text-secondary dark:text-toss-dark-text-secondary">
            {matchIndex + 1}/{totalMatches}
          </span>
        </div>
        <button
          onClick={onReset}
          className="rounded-lg px-3 py-2 text-[13px] text-toss-text-tertiary transition-colors hover:bg-white hover:text-toss-text dark:text-toss-dark-text-tertiary dark:hover:bg-toss-dark-card dark:hover:text-toss-dark-text"
        >
          처음부터
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={matchKey}
          className="relative flex flex-col gap-3"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <RestaurantCard restaurant={left} onClick={() => handlePick(left)} />
          <div className="flex items-center justify-center" aria-hidden="true">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-toss-blue shadow-md">
              <span className="text-xs font-extrabold text-white">VS</span>
            </div>
          </div>
          <RestaurantCard restaurant={right} onClick={() => handlePick(right)} />
        </motion.div>
      </AnimatePresence>

      <p className="mt-6 text-center text-[13px] text-toss-text-tertiary dark:text-toss-dark-text-tertiary">
        더 끌리는 쪽을 선택하세요
      </p>

      <AnimatePresence>
        {roundTransition && (
          <motion.div
            key="round-transition"
            className="fixed inset-0 z-40 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              className="relative z-10 flex flex-col items-center gap-3 px-6"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div
                className="flex h-16 w-16 items-center justify-center rounded-full bg-toss-blue shadow-lg"
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="text-2xl">⚔️</span>
              </motion.div>
              <h2 className="text-center text-[24px] font-bold text-white drop-shadow-lg">
                {roundTransition}
              </h2>
              <div className="mt-2 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="inline-block h-1.5 w-1.5 rounded-full bg-white/70"
                    animate={{ scale: [0.6, 1, 0.6], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RestaurantCard({ restaurant, onClick }: { restaurant: Restaurant; onClick: () => void }) {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const emoji = getCategoryEmoji(restaurant.category_name);
  const categoryPath = getCategoryPath(restaurant.category_name, restaurant.place_name);
  const walking = getWalkingTime(restaurant.distance);

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={`${restaurant.place_name} 선택 — ${categoryPath}, ${restaurant.distance}m`}
      className="group cursor-pointer rounded-2xl bg-white p-5 shadow-sm dark:bg-toss-dark-card"
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div className="flex items-center gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-toss-blue-light text-2xl transition-transform group-hover:scale-105 dark:bg-toss-dark-elevated"
          aria-hidden="true"
        >
          {emoji}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-xl font-bold leading-snug text-toss-text dark:text-toss-dark-text">
            {restaurant.place_name}
          </h3>
          <p className="mt-0.5 text-[13px] text-toss-text-secondary dark:text-toss-dark-text-secondary">
            {categoryPath}
          </p>
          <p className="text-[13px] text-toss-text-tertiary dark:text-toss-dark-text-tertiary">
            {restaurant.distance}m
            {walking && <span className="mx-1">·</span>}
            {walking}
          </p>
        </div>
        <svg
          className="h-5 w-5 shrink-0 text-toss-text-tertiary transition-colors group-hover:text-toss-blue dark:text-toss-dark-text-tertiary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </motion.div>
  );
}

export function ChampionScreen({
  champion,
  onReset,
  label,
  isDelivery = false,
  modeId = 'lunch',
  bracketSize = 16,
}: {
  champion: Restaurant;
  onReset: () => void;
  label: string;
  isDelivery?: boolean;
  modeId?: string;
  bracketSize?: number;
}) {
  const emoji = getCategoryEmoji(champion.category_name);
  const categoryPath = getCategoryPath(champion.category_name, champion.place_name);
  const walking = getWalkingTime(champion.distance);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  useEffect(() => {
    haptic(80);
  }, []);

  const handleShare = async () => {
    setShareStatus('공유 준비 중...');
    const result = await shareResultCard({ champion, modeId, bracketSize });
    switch (result) {
      case 'shared':
        setShareStatus(null);
        break;
      case 'copied':
        setShareStatus('클립보드에 복사됨!');
        break;
      case 'downloaded':
        setShareStatus('이미지 저장됨!');
        break;
      default:
        setShareStatus('공유에 실패했어요');
    }
    if (result !== 'shared') {
      setTimeout(() => setShareStatus(null), 2500);
    }
  };

  return (
    <div className="relative" role="alert" aria-live="polite">
      <Confetti />
      <motion.div
        className="relative rounded-2xl bg-white p-8 text-center shadow-sm dark:bg-toss-dark-card"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-toss-blue"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>

        <motion.p className="mb-2 text-[13px] font-medium text-toss-text-secondary dark:text-toss-dark-text-secondary" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {label}
        </motion.p>

        <motion.div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-toss-blue-light text-5xl dark:bg-toss-dark-elevated" aria-hidden="true" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
          {emoji}
        </motion.div>

        <motion.h2 className="mb-1 line-clamp-2 text-[26px] font-bold leading-tight text-toss-text dark:text-toss-dark-text" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          {champion.place_name}
        </motion.h2>

        <motion.div className="mb-4 flex flex-wrap items-center justify-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <span className="inline-block rounded-full bg-toss-blue-light px-3 py-1 text-[13px] font-semibold text-toss-blue dark:bg-toss-dark-elevated">
            {categoryPath}
          </span>
          {!isDelivery && (
            <span className="inline-block rounded-full bg-toss-bg px-3 py-1 text-[13px] font-medium text-toss-text-secondary dark:bg-toss-dark-elevated dark:text-toss-dark-text-secondary">
              {champion.distance}m
              {walking && <span className="mx-1">·</span>}
              {walking}
            </span>
          )}
        </motion.div>

        {!isDelivery && (
        <motion.p className="mb-6 text-[14px] text-toss-text-secondary dark:text-toss-dark-text-secondary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
          {champion.address_name}
        </motion.p>
        )}

        <motion.div className="flex flex-col gap-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          {isDelivery ? (
            <>
              <a
                href={`https://baemin.me/search?keyword=${encodeURIComponent(champion.place_name)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-2xl bg-[#2AC1BC] px-5 py-4 text-[16px] font-semibold text-white transition-transform active:scale-[0.97]"
              >
                🐻 배달의민족에서 주문
              </a>
              <a
                href={`https://www.coupangeats.com/search?keyword=${encodeURIComponent(champion.place_name)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-2xl bg-[#0073E6] px-5 py-4 text-[16px] font-semibold text-white transition-transform active:scale-[0.97]"
              >
                🚀 쿠팡이츠에서 주문
              </a>
            </>
          ) : (
            <a
              href={champion.place_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-toss-blue px-5 py-4 text-[16px] font-semibold text-white transition-transform active:scale-[0.97]"
            >
              카카오맵에서 보기
              <span aria-hidden="true">↗</span>
            </a>
          )}
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-toss-blue-light px-5 py-4 text-[16px] font-semibold text-toss-blue transition-transform active:scale-[0.97] dark:bg-toss-dark-elevated"
          >
            📤 결과 카드 공유하기
          </button>
          {shareStatus && (
            <p className="text-center text-[13px] text-toss-text-secondary dark:text-toss-dark-text-secondary">
              {shareStatus}
            </p>
          )}
          <button
            onClick={onReset}
            className="rounded-2xl bg-toss-bg px-5 py-4 text-[16px] font-semibold text-toss-text transition-transform active:scale-[0.97] dark:bg-toss-dark-elevated dark:text-toss-dark-text"
          >
            다시 하기
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

const CONFETTI_COLORS = ['#FF7E36', '#FFA366', '#FFD4B8', '#FF6B6B', '#FFD93D', '#6BCB77'];

function Confetti() {
  const pieces = useMemo(() => {
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 1.5,
      duration: 2.5 + Math.random() * 2,
      drift: (Math.random() - 0.5) * 200,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 6 + Math.random() * 6,
      aspect: 0.4 + Math.random() * 0.8,
    }));
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute block"
          style={{
            left: `${p.left}%`,
            top: '-20px',
            width: `${p.size}px`,
            height: `${p.size * (1 + p.aspect)}px`,
            backgroundColor: p.color,
            borderRadius: '2px',
            animation: `confetti-fall ${p.duration}s linear ${p.delay}s forwards`,
            ['--confetti-drift' as string]: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
