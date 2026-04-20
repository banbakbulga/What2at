'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Restaurant } from '@/hooks/useNearbyRestaurants';
import { ChampionScreen } from '@/components/Tournament';
import { getCategoryEmoji, getCategoryPath } from '@/lib/display';
import { addToHistory } from '@/lib/history';

type Props = {
  restaurants: Restaurant[];
  onReset: () => void;
  championLabel?: string;
  modeId?: string;
};

type Phase = 'spinning' | 'stopping' | 'done';

const MIN_INTERVAL = 40;
const MAX_INTERVAL = 320;
const CYCLES_BEFORE_STOP = 3;
const WINNER_HOLD_MS = 600;
const MAX_SPIN_DURATION_MS = 7000;
const MIN_SPIN_DURATION_MS = 4000;

export default function Roulette({
  restaurants,
  onReset,
  championLabel = '오늘의 운명',
  modeId = 'roulette',
}: Props) {
  const [phase, setPhase] = useState<Phase>('spinning');
  const [displayIndex, setDisplayIndex] = useState(0);
  const [winner, setWinner] = useState<Restaurant | null>(null);
  const [canStop, setCanStop] = useState(false);
  const emojiRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    setPhase('spinning');
    setWinner(null);
    setDisplayIndex(0);
    setCanStop(false);

    if (restaurants.length === 0) return;

    const winnerIdx = Math.floor(Math.random() * restaurants.length);
    const chosenWinner = restaurants[winnerIdx];
    const totalTicks = restaurants.length * CYCLES_BEFORE_STOP + winnerIdx;

    const rawTimes: number[] = [];
    let rawCumulative = 0;
    for (let t = 1; t <= totalTicks; t++) {
      const progress = t / totalTicks;
      const eased = progress * progress * progress;
      const interval = MIN_INTERVAL + (MAX_INTERVAL - MIN_INTERVAL) * eased;
      rawCumulative += interval;
      rawTimes.push(rawCumulative);
    }

    const targetDuration = Math.min(
      MAX_SPIN_DURATION_MS,
      MIN_SPIN_DURATION_MS + restaurants.length * 100,
    );
    const scale = targetDuration / rawCumulative;

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    // 40% 지점 이후 탭 멈추기 가능
    timeouts.push(setTimeout(() => setCanStop(true), targetDuration * 0.4));

    rawTimes.forEach((time, i) => {
      const tickIndex = i + 1;
      timeouts.push(
        setTimeout(() => {
          setDisplayIndex(tickIndex % restaurants.length);
          emojiRef.current?.animate(
            [
              { transform: 'scale(0.82)', opacity: 0.3 },
              { transform: 'scale(1.04)', opacity: 1 },
              { transform: 'scale(1)', opacity: 1 },
            ],
            { duration: 160, easing: 'ease-out' },
          );
          nameRef.current?.animate(
            [
              { transform: 'scale(0.82)', opacity: 0.3 },
              { transform: 'scale(1.04)', opacity: 1 },
              { transform: 'scale(1)', opacity: 1 },
            ],
            { duration: 160, easing: 'ease-out' },
          );
        }, time * scale),
      );
    });

    timeouts.push(
      setTimeout(() => {
        finishWith(chosenWinner);
      }, targetDuration + WINNER_HOLD_MS),
    );

    timeoutsRef.current = timeouts;

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [restaurants]);

  const finishWith = useCallback((r: Restaurant) => {
    setWinner(r);
    setPhase('done');
    addToHistory({ restaurant: r, timestamp: Date.now(), mode: 'roulette' });
    try {
      navigator?.vibrate?.(50);
    } catch {
      // ignore
    }
  }, []);

  const handleTapStop = useCallback(() => {
    if (!canStop || phase !== 'spinning') return;
    setPhase('stopping');
    timeoutsRef.current.forEach(clearTimeout);
    const current = restaurants[displayIndex];
    setTimeout(() => finishWith(current), 400);
  }, [canStop, phase, restaurants, displayIndex, finishWith]);

  if (phase === 'done' && winner) {
    return (
      <ChampionScreen champion={winner} onReset={onReset} label={championLabel} modeId={modeId} bracketSize={restaurants.length} />
    );
  }

  const current = restaurants[displayIndex];
  if (!current) return null;

  const emoji = getCategoryEmoji(current.category_name);
  const categoryPath = getCategoryPath(current.category_name, current.place_name);

  return (
    <div
      className="cursor-pointer rounded-2xl bg-white p-10 text-center shadow-sm dark:bg-toss-dark-card"
      role="status"
      aria-live="polite"
      aria-label={`룰렛 진행 중 — 현재: ${current.place_name}`}
      onClick={handleTapStop}
    >
      <p className="mb-1 text-[15px] font-semibold text-toss-blue">
        {phase === 'stopping' ? '멈추는 중...' : '운명을 결정 중'}
      </p>
      <p className="mb-8 text-[13px] text-toss-text-tertiary dark:text-toss-dark-text-tertiary">
        {canStop && phase === 'spinning'
          ? '탭하면 여기서 멈춰요!'
          : '잠깐만요, 돌아가는 중이에요'}
      </p>

      <div className="mb-6 flex justify-center">
        <div
          ref={emojiRef}
          className="flex h-24 w-24 items-center justify-center rounded-2xl bg-toss-blue-light text-5xl dark:bg-toss-dark-elevated"
          style={{ animation: 'roulette-glow 1.2s ease-in-out infinite' }}
          aria-hidden="true"
        >
          {emoji}
        </div>
      </div>

      <div ref={nameRef}>
        <h2 className="mb-2 line-clamp-2 text-[22px] font-bold text-toss-text sm:text-[26px] dark:text-toss-dark-text">
          {current.place_name}
        </h2>
        <p className="text-[14px] text-toss-text-secondary dark:text-toss-dark-text-secondary">
          {categoryPath}
        </p>
      </div>

      <div className="mt-10 flex justify-center gap-1.5" aria-hidden="true">
        {Array.from({ length: 3 }).map((_, i) => (
          <span
            key={i}
            className="inline-block h-1.5 w-1.5 rounded-full bg-toss-blue"
            style={{ animation: `roulette-tick 600ms ease-in-out ${i * 150}ms infinite` }}
          />
        ))}
      </div>
    </div>
  );
}
