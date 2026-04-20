'use client';

import { useEffect, useState } from 'react';
import { waitForKakao } from '@/lib/kakao';
import type { Coords, Restaurant } from '@/hooks/useNearbyRestaurants';
import { getCategoryEmoji, getCategoryPath } from '@/lib/display';

type Props = {
  mapCenter: Coords;
  candidates: Restaurant[];
  maxCount: number;
  onAdd: (restaurant: Restaurant) => void;
  onRemove: (id: string) => void;
};

export default function CandidatePicker({
  mapCenter,
  candidates,
  maxCount,
  onAdd,
  onRemove,
}: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Restaurant[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setSearching(false);
      return;
    }

    let cancelled = false;
    setSearching(true);

    const timer = setTimeout(() => {
      waitForKakao()
        .then(() => {
          if (cancelled) return;

          const places = new window.kakao.maps.services.Places();
          places.keywordSearch(
            trimmed,
            (data: any[], status: any) => {
              if (cancelled) return;
              setSearching(false);
              const { Status } = window.kakao.maps.services;

              if (status !== Status.OK) {
                setResults([]);
                return;
              }

              const mapped: Restaurant[] = data.slice(0, 10).map((p) => ({
                id: p.id,
                place_name: p.place_name,
                category_name: p.category_name,
                distance: p.distance,
                address_name: p.road_address_name || p.address_name,
                place_url: p.place_url,
                x: p.x,
                y: p.y,
              }));
              setResults(mapped);
            },
            {
              location: new window.kakao.maps.LatLng(
                mapCenter.lat,
                mapCenter.lng,
              ),
              size: 10,
            },
          );
        })
        .catch(() => {
          if (cancelled) return;
          setSearching(false);
          setResults([]);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, mapCenter]);

  const candidateIds = new Set(candidates.map((c) => c.id));
  const full = candidates.length >= maxCount;
  const remaining = maxCount - candidates.length;

  return (
    <div>
      <div className="mb-4">
        <p className="text-[17px] font-bold text-toss-text dark:text-toss-dark-text">
          직접 고르고 싶은 곳이 있나요?
        </p>
        <p className="mt-1 text-[14px] leading-relaxed text-toss-text-secondary dark:text-toss-dark-text-secondary">
          검색해서 후보지에 넣으면 토너먼트에 그대로 들어갑니다.
        </p>
      </div>

      <div className="relative mb-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="식당 이름으로 검색"
          aria-label="식당 이름으로 검색"
          className="w-full rounded-xl bg-toss-bg px-4 py-3 text-[15px] text-toss-text placeholder:text-toss-text-tertiary focus:outline-none focus:ring-2 focus:ring-toss-blue/30 dark:bg-toss-dark-elevated dark:text-toss-dark-text dark:placeholder:text-toss-dark-text-tertiary"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-toss-text-tertiary/80 text-[10px] text-white transition-transform active:scale-90 dark:bg-toss-dark-text-tertiary"
            aria-label="검색어 지우기"
          >
            ✕
          </button>
        )}
      </div>

      {searching && (
        <p className="mb-4 text-[13px] text-toss-text-tertiary dark:text-toss-dark-text-tertiary">
          검색 중...
        </p>
      )}

      {!searching && query.trim() && results.length === 0 && (
        <p className="mb-4 text-[13px] text-toss-text-tertiary dark:text-toss-dark-text-tertiary">
          검색 결과가 없습니다.
        </p>
      )}

      {results.length > 0 && (
        <ul className="mb-6 divide-y divide-toss-bg overflow-hidden rounded-xl bg-white dark:divide-toss-dark-border dark:bg-toss-dark-card">
          {results.map((r) => {
            const added = candidateIds.has(r.id);
            const disabled = added || full;
            return (
              <li key={r.id} className="flex items-center gap-3 px-3 py-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-toss-bg text-lg dark:bg-toss-dark-elevated"
                  aria-hidden="true"
                >
                  {getCategoryEmoji(r.category_name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold text-toss-text dark:text-toss-dark-text">
                    {r.place_name}
                  </p>
                  <p className="truncate text-[13px] text-toss-text-secondary dark:text-toss-dark-text-secondary">
                    {getCategoryPath(r.category_name, r.place_name)} ·{' '}
                    {r.address_name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!disabled) onAdd(r);
                  }}
                  disabled={disabled}
                  aria-label={added ? `${r.place_name} 이미 추가됨` : `${r.place_name} 추가`}
                  className={
                    'shrink-0 rounded-lg px-3 py-2 text-[13px] font-semibold transition-transform active:scale-95 ' +
                    (disabled
                      ? 'bg-toss-bg text-toss-text-tertiary dark:bg-toss-dark-elevated dark:text-toss-dark-text-tertiary'
                      : 'bg-toss-blue text-white')
                  }
                >
                  {added ? '추가됨' : '추가'}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mb-2 flex items-center justify-between">
        <p className="text-[15px] font-bold text-toss-text dark:text-toss-dark-text">
          내 후보지{' '}
          <span className="font-medium text-toss-text-tertiary dark:text-toss-dark-text-tertiary">
            {candidates.length}/{maxCount}
          </span>
        </p>
      </div>

      {candidates.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-toss-border bg-toss-bg p-5 text-center dark:border-toss-dark-border dark:bg-toss-dark-elevated">
          <p className="text-[13px] text-toss-text-tertiary dark:text-toss-dark-text-tertiary">
            아직 직접 고른 후보지가 없어요. 위에서 검색해 추가하거나, 그냥
            시작하면 전부 자동으로 채워져요.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {candidates.map((r) => (
            <li
              key={r.id}
              className="flex items-center gap-3 rounded-xl bg-toss-bg p-3 dark:bg-toss-dark-elevated"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-toss-blue-light text-lg dark:bg-toss-dark-card"
                aria-hidden="true"
              >
                {getCategoryEmoji(r.category_name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-toss-text dark:text-toss-dark-text">
                  {r.place_name}
                </p>
                <p className="truncate text-[13px] text-toss-text-secondary dark:text-toss-dark-text-secondary">
                  {r.address_name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(r.id)}
                aria-label={`${r.place_name} 삭제`}
                className="shrink-0 rounded-lg px-3 py-2 text-[13px] text-toss-text-tertiary transition-colors hover:bg-toss-error-light hover:text-toss-error dark:text-toss-dark-text-tertiary dark:hover:bg-toss-error/10 dark:hover:text-toss-error"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}

      {candidates.length > 0 && !full && (
        <p className="mt-3 text-[13px] text-toss-text-secondary dark:text-toss-dark-text-secondary">
          나머지 {remaining}곳은 지도 위치 기준으로 자동 채워집니다.
        </p>
      )}
      {full && (
        <p className="mt-3 text-[13px] text-toss-text-secondary dark:text-toss-dark-text-secondary">
          후보지가 가득 찼어요. 삭제하거나 강수를 늘리면 더 추가할 수 있어요.
        </p>
      )}
    </div>
  );
}
