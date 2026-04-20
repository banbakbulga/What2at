'use client';

import { useEffect, useState } from 'react';
import { waitForKakao } from '@/lib/kakao';
import type { ModeConfig } from '@/config/modes';
import { matchesExcludedCategory } from '@/config/categoryFilters';

export type Coords = {
  lat: number;
  lng: number;
};

export type BracketSize = 8 | 16 | 32 | 64;
export const BRACKET_SIZES: readonly BracketSize[] = [8, 16, 32, 64] as const;

export type RadiusOption = 500 | 1000 | 1500 | 2000;
export const RADIUS_OPTIONS: readonly RadiusOption[] = [500, 1000, 1500, 2000] as const;
export const RADIUS_LABELS: Record<RadiusOption, string> = {
  500: '500m',
  1000: '1km',
  1500: '1.5km',
  2000: '2km',
};

export type Restaurant = {
  id: string;
  place_name: string;
  category_name: string;
  distance: string;
  address_name: string;
  place_url: string;
  x: string;
  y: string;
};

type State = {
  restaurants: Restaurant[];
  loading: boolean;
  error: string | null;
};

const INITIAL_STATE: State = {
  restaurants: [],
  loading: false,
  error: null,
};

function matchesMode(category: string, mode: ModeConfig): boolean {
  if (mode.excludeKeywords?.some((kw) => category.includes(kw))) {
    return false;
  }
  if (mode.includeKeywords && mode.includeKeywords.length > 0) {
    if (!mode.includeKeywords.some((kw) => category.includes(kw))) {
      return false;
    }
  }
  return true;
}

export function useNearbyRestaurants(
  center: Coords | null,
  size: BracketSize,
  mode: ModeConfig | null,
  customCandidates: Restaurant[],
  excludedCategoryIds: string[],
  radius: RadiusOption = 1000,
): State {
  const [state, setState] = useState<State>(INITIAL_STATE);

  useEffect(() => {
    if (!center || !mode) {
      setState(INITIAL_STATE);
      return;
    }

    if (customCandidates.length >= size) {
      const finalList = customCandidates.slice(0, size);
      setState({ restaurants: finalList, loading: false, error: null });
      return;
    }

    let cancelled = false;
    setState({ restaurants: [], loading: true, error: null });

    const needed = size - customCandidates.length;
    const customIds = new Set(customCandidates.map((c) => c.id));

    waitForKakao()
      .then(() => {
        if (cancelled) return;

        const places = new window.kakao.maps.services.Places();
        const collected: Restaurant[] = [];

        const callback = (data: any[], status: any, pagination: any) => {
          if (cancelled) return;
          const { Status } = window.kakao.maps.services;

          if (status === Status.ZERO_RESULT) {
            if (customCandidates.length > 0) {
              const finalList = customCandidates.slice(0, size);
              setState({
                restaurants: finalList,
                loading: false,
                error: null,
              });
            } else {
              setState({
                restaurants: [],
                loading: false,
                error: '주변에 검색 결과가 없습니다.',
              });
            }
            return;
          }

          if (status !== Status.OK) {
            setState({
              restaurants: [],
              loading: false,
              error: '장소 검색에 실패했습니다. 네트워크 연결을 확인해 주세요.',
            });
            return;
          }

          const mapped: Restaurant[] = data
            .filter(
              (p) =>
                matchesMode(p.category_name, mode) &&
                !matchesExcludedCategory(p.category_name, excludedCategoryIds) &&
                !customIds.has(p.id),
            )
            .map((p) => ({
              id: p.id,
              place_name: p.place_name,
              category_name: p.category_name,
              distance: p.distance,
              address_name: p.road_address_name || p.address_name,
              place_url: p.place_url,
              x: p.x,
              y: p.y,
            }));

          collected.push(...mapped);

          if (collected.length < needed && pagination.hasNextPage) {
            pagination.nextPage();
            return;
          }

          const finalList = [
            ...customCandidates,
            ...collected.slice(0, needed),
          ].slice(0, size);
          setState({
            restaurants: finalList,
            loading: false,
            error: null,
          });
        };

        places.categorySearch(mode.groupCode, callback, {
          location: new window.kakao.maps.LatLng(center.lat, center.lng),
          radius,
          sort: window.kakao.maps.services.SortBy.DISTANCE,
        });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setState({
          restaurants: [],
          loading: false,
          error: err.message,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [center, size, mode, customCandidates, excludedCategoryIds, radius]);

  return state;
}
