'use client';

import { useEffect, useRef, useState } from 'react';
import { waitForKakao } from '@/lib/kakao';
import {
  BRACKET_SIZES,
  RADIUS_OPTIONS,
  RADIUS_LABELS,
  type BracketSize,
  type Coords,
  type RadiusOption,
  type Restaurant,
} from '@/hooks/useNearbyRestaurants';
import type { ModeConfig } from '@/config/modes';
import { haversineMeters } from '@/lib/display';
import CandidatePicker from '@/components/CandidatePicker';
import CategoryFilter from '@/components/CategoryFilter';

const FALLBACK_CENTER: Coords = { lat: 37.5665, lng: 126.978 };

export type PlayMode = 'tournament' | 'roulette';

type Props = {
  mode: ModeConfig;
  size: BracketSize;
  onSizeChange: (size: BracketSize) => void;
  radius: RadiusOption;
  onRadiusChange: (radius: RadiusOption) => void;
  onConfirm: (
    center: Coords,
    candidates: Restaurant[],
    excludedCategoryIds: string[],
    playMode: PlayMode,
  ) => void;
  onBack: () => void;
};

type Status = 'loading' | 'ready' | 'error';

export default function LocationPicker({
  mode,
  size,
  onSizeChange,
  radius,
  onRadiusChange,
  onConfirm,
  onBack,
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [coords, setCoords] = useState<Coords | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Restaurant[]>([]);
  const [excludedCategoryIds, setExcludedCategoryIds] = useState<string[]>([]);

  // 지역 검색
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState<
    { name: string; address: string; lat: number; lng: number }[]
  >([]);

  useEffect(() => {
    let cancelled = false;

    const initMap = (center: Coords) => {
      if (cancelled || !mapContainerRef.current) return;

      const { kakao } = window;
      const position = new kakao.maps.LatLng(center.lat, center.lng);

      const map = new kakao.maps.Map(mapContainerRef.current, {
        center: position,
        level: 4,
      });
      mapRef.current = map;

      const marker = new kakao.maps.Marker({
        position,
        map,
        draggable: true,
      });
      markerRef.current = marker;

      setCoords(center);
      setStatus('ready');

      kakao.maps.event.addListener(map, 'click', (mouseEvent: any) => {
        const latlng = mouseEvent.latLng;
        marker.setPosition(latlng);
        setCoords({ lat: latlng.getLat(), lng: latlng.getLng() });
      });

      kakao.maps.event.addListener(marker, 'dragend', () => {
        const pos = marker.getPosition();
        setCoords({ lat: pos.getLat(), lng: pos.getLng() });
      });
    };

    waitForKakao()
      .then(() => {
        if (cancelled) return;

        if (!navigator.geolocation) {
          initMap(FALLBACK_CENTER);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            initMap({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
          },
          () => {
            initMap(FALLBACK_CENTER);
            setErrorMessage(
              '현재 위치를 사용할 수 없어 기본 위치(서울)로 설정했어요. 지도를 클릭하거나 검색으로 위치를 변경해 주세요.',
            );
          },
        );
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setStatus('error');
        setErrorMessage(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // 지역 검색 (디바운스 300ms)
  useEffect(() => {
    const trimmed = locationQuery.trim();
    if (!trimmed || status !== 'ready') {
      setLocationResults([]);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      const places = new window.kakao.maps.services.Places();
      places.keywordSearch(trimmed, (data: any[], searchStatus: any) => {
        if (cancelled) return;
        if (searchStatus !== window.kakao.maps.services.Status.OK) {
          setLocationResults([]);
          return;
        }
        setLocationResults(
          data.slice(0, 5).map((p) => ({
            name: p.place_name,
            address: p.road_address_name || p.address_name,
            lat: Number(p.y),
            lng: Number(p.x),
          })),
        );
      });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [locationQuery, status]);

  const handleSelectLocation = (lat: number, lng: number) => {
    if (!mapRef.current || !markerRef.current) return;
    const { kakao } = window;
    const pos = new kakao.maps.LatLng(lat, lng);
    mapRef.current.setCenter(pos);
    markerRef.current.setPosition(pos);
    setCoords({ lat, lng });
    setLocationQuery('');
    setLocationResults([]);
    setErrorMessage(null);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation || !mapRef.current || !markerRef.current) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { kakao } = window;
        const next = new kakao.maps.LatLng(
          pos.coords.latitude,
          pos.coords.longitude,
        );
        mapRef.current.setCenter(next);
        markerRef.current.setPosition(next);
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setErrorMessage(null);
      },
      () => {
        setErrorMessage('현재 위치를 가져오지 못했습니다.');
      },
    );
  };

  const handleSizeChange = (next: BracketSize) => {
    onSizeChange(next);
    if (candidates.length > next) {
      setCandidates((prev) => prev.slice(0, next));
    }
  };

  const handleAddCandidate = (restaurant: Restaurant) => {
    setCandidates((prev) => {
      if (prev.some((c) => c.id === restaurant.id)) return prev;
      if (prev.length >= size) return prev;
      return [...prev, restaurant];
    });
  };

  const handleRemoveCandidate = (id: string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
  };

  const handleConfirm = (playMode: PlayMode) => {
    if (!coords) return;
    const finalized: Restaurant[] = candidates.map((c) => {
      const lat = Number(c.y);
      const lng = Number(c.x);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return c;
      const meters = haversineMeters(coords, { lat, lng });
      return { ...c, distance: String(Math.round(meters)) };
    });
    onConfirm(coords, finalized, excludedCategoryIds, playMode);
  };

  return (
    <div className="space-y-6">
      {/* 지도 섹션 */}
      <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-toss-dark-card">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[17px] font-bold text-toss-text dark:text-toss-dark-text">
              <span className="mr-1.5" aria-hidden="true">
                {mode.emoji}
              </span>
              {mode.shortLabel} · 어디서 찾을까요?
            </p>
            <p className="mt-1 text-[14px] leading-relaxed text-toss-text-secondary dark:text-toss-dark-text-secondary">
              지도를 클릭하거나 마커를 드래그해서 위치를 정하세요.{' '}
              {mode.locationHint}
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="shrink-0 rounded-lg px-3 py-2 text-[13px] text-toss-text-tertiary transition-colors hover:bg-toss-bg hover:text-toss-text dark:text-toss-dark-text-tertiary dark:hover:bg-toss-dark-elevated dark:hover:text-toss-dark-text"
          >
            모드 바꾸기
          </button>
        </div>

        {/* 지역 검색 */}
        <div className="relative mb-3">
          <input
            type="search"
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            placeholder="지역, 건물, 역 이름으로 검색"
            aria-label="지역 검색"
            disabled={status !== 'ready'}
            className="w-full rounded-xl bg-toss-bg px-4 py-3 text-[15px] text-toss-text placeholder:text-toss-text-tertiary focus:outline-none focus:ring-2 focus:ring-toss-blue/30 disabled:opacity-50 dark:bg-toss-dark-elevated dark:text-toss-dark-text dark:placeholder:text-toss-dark-text-tertiary"
          />
          {locationQuery && (
            <button
              type="button"
              onClick={() => {
                setLocationQuery('');
                setLocationResults([]);
              }}
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-toss-text-tertiary/80 text-[10px] text-white dark:bg-toss-dark-text-tertiary"
              aria-label="검색어 지우기"
            >
              ✕
            </button>
          )}
          {locationResults.length > 0 && (
            <ul className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl bg-white shadow-lg dark:bg-toss-dark-card">
              {locationResults.map((r, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => handleSelectLocation(r.lat, r.lng)}
                    className="flex w-full items-start gap-2 px-4 py-3 text-left transition-colors hover:bg-toss-bg dark:hover:bg-toss-dark-elevated"
                  >
                    <span className="mt-0.5 text-toss-blue" aria-hidden="true">
                      📍
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold text-toss-text dark:text-toss-dark-text">
                        {r.name}
                      </p>
                      <p className="truncate text-[13px] text-toss-text-secondary dark:text-toss-dark-text-secondary">
                        {r.address}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div
          ref={mapContainerRef}
          className="h-56 w-full overflow-hidden rounded-2xl bg-toss-bg sm:h-72 dark:bg-toss-dark-elevated"
          role="application"
          aria-label="지도 — 클릭하여 위치를 선택하세요"
        />

        {status === 'loading' && (
          <div className="mt-3 flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-toss-border border-t-toss-blue dark:border-toss-dark-border" />
            <p className="text-[14px] text-toss-text-secondary dark:text-toss-dark-text-secondary">
              지도 불러오는 중...
            </p>
          </div>
        )}

        {errorMessage && (
          <div
            role="status"
            className="mt-3 rounded-xl bg-toss-blue-light p-4 dark:bg-toss-dark-elevated"
          >
            <p className="text-[13px] leading-relaxed text-toss-text-secondary dark:text-toss-dark-text-secondary">
              {errorMessage}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={status !== 'ready'}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-[14px] font-medium text-toss-blue transition-colors hover:bg-toss-blue-light disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-toss-dark-elevated"
        >
          <span aria-hidden="true">📍</span> 내 위치로 이동
        </button>
      </div>

      {/* 후보지 검색 */}
      {coords && status === 'ready' && (
        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-toss-dark-card">
          <CandidatePicker
            mapCenter={coords}
            candidates={candidates}
            maxCount={size}
            onAdd={handleAddCandidate}
            onRemove={handleRemoveCandidate}
          />
        </div>
      )}

      {/* 카테고리 필터 */}
      {mode.id !== 'cafe' && (
        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-toss-dark-card">
          <CategoryFilter
            excludedIds={excludedCategoryIds}
            onChange={setExcludedCategoryIds}
          />
        </div>
      )}

      {/* 강수 + 반경 선택 */}
      <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-toss-dark-card">
        <div className="mb-4">
          <p className="mb-3 text-[15px] font-bold text-toss-text dark:text-toss-dark-text">
            토너먼트 강수
          </p>
          <div
            role="radiogroup"
            aria-label="토너먼트 강수"
            className="inline-flex rounded-xl bg-toss-bg p-1 dark:bg-toss-dark-elevated"
          >
            {BRACKET_SIZES.map((option) => {
              const active = option === size;
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => handleSizeChange(option)}
                  className={
                    'rounded-lg px-5 py-2.5 text-[14px] font-semibold transition-all ' +
                    (active
                      ? 'bg-toss-blue text-white shadow-sm'
                      : 'text-toss-text-secondary hover:text-toss-text dark:text-toss-dark-text-secondary dark:hover:text-toss-dark-text')
                  }
                >
                  {option}강
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-3 text-[15px] font-bold text-toss-text dark:text-toss-dark-text">
            검색 반경
          </p>
          <div
            role="radiogroup"
            aria-label="검색 반경"
            className="inline-flex rounded-xl bg-toss-bg p-1 dark:bg-toss-dark-elevated"
          >
            {RADIUS_OPTIONS.map((option) => {
              const active = option === radius;
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onRadiusChange(option)}
                  className={
                    'rounded-lg px-4 py-2.5 text-[14px] font-semibold transition-all ' +
                    (active
                      ? 'bg-toss-blue text-white shadow-sm'
                      : 'text-toss-text-secondary hover:text-toss-text dark:text-toss-dark-text-secondary dark:hover:text-toss-dark-text')
                  }
                >
                  {RADIUS_LABELS[option]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 시작 버튼 */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => handleConfirm('tournament')}
          disabled={!coords || status !== 'ready'}
          className="rounded-2xl bg-toss-blue px-5 py-4 text-[16px] font-semibold text-white transition-transform active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {candidates.length > 0
            ? `내 후보지 ${candidates.length}곳 + 자동 ${Math.max(0, size - candidates.length)}곳으로 ${size}강 시작`
            : `이 위치로 ${size}강 토너먼트`}
        </button>
        <button
          type="button"
          onClick={() => handleConfirm('roulette')}
          disabled={!coords || status !== 'ready'}
          className="rounded-2xl bg-white px-5 py-4 text-[16px] font-semibold text-toss-text shadow-sm transition-transform active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-toss-dark-card dark:text-toss-dark-text"
        >
          🎲 운명에 맡기기
        </button>
      </div>
    </div>
  );
}
