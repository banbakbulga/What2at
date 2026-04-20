'use client';

import { useState } from 'react';
import { DELIVERY_MENUS } from '@/config/deliveryMenus';
import { getCategoryEmoji } from '@/lib/display';
import type { BracketSize } from '@/hooks/useNearbyRestaurants';

const SIZES: BracketSize[] = [8, 16, 32];

type Props = {
  onStart: (menus: typeof DELIVERY_MENUS, size: BracketSize) => void;
  onBack: () => void;
};

export default function DeliveryPicker({ onStart, onBack }: Props) {
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [size, setSize] = useState<BracketSize>(16);

  const toggle = (id: string) => {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const included = DELIVERY_MENUS.filter((m) => !excluded.has(m.id));
  const canStart = included.length >= size;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-toss-dark-card">
        <div className="mb-1 flex items-start justify-between">
          <div>
            <p className="text-[17px] font-bold text-toss-text dark:text-toss-dark-text">
              🛵 배달 메뉴 고르기
            </p>
            <p className="mt-1 text-[14px] leading-relaxed text-toss-text-secondary dark:text-toss-dark-text-secondary">
              빼고 싶은 메뉴를 탭해서 제외하세요.
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="shrink-0 rounded-lg px-3 py-2 text-[13px] text-toss-text-tertiary transition-colors hover:text-toss-text dark:text-toss-dark-text-tertiary dark:hover:text-toss-dark-text"
          >
            모드 바꾸기
          </button>
        </div>

        {/* 메뉴 그리드 */}
        <div className="mt-4 flex flex-wrap gap-2">
          {DELIVERY_MENUS.map((menu) => {
            const off = excluded.has(menu.id);
            return (
              <button
                key={menu.id}
                type="button"
                onClick={() => toggle(menu.id)}
                aria-pressed={off}
                className={
                  'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-semibold transition-all active:scale-95 ' +
                  (off
                    ? 'bg-toss-bg text-toss-text-tertiary line-through decoration-1 dark:bg-toss-dark-elevated dark:text-toss-dark-text-tertiary'
                    : 'bg-toss-blue-light text-toss-text dark:bg-toss-dark-elevated dark:text-toss-dark-text')
                }
              >
                <span aria-hidden="true">{getCategoryEmoji(menu.category_name)}</span>
                {menu.place_name}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-[13px] text-toss-text-secondary dark:text-toss-dark-text-secondary">
            선택된 메뉴 <span className="font-bold text-toss-blue">{included.length}</span>개
            {!canStart && (
              <span className="text-toss-error"> (최소 {size}개 필요)</span>
            )}
          </p>
          {excluded.size > 0 && (
            <button
              type="button"
              onClick={() => setExcluded(new Set())}
              className="text-[13px] font-medium text-toss-blue"
            >
              전체 선택
            </button>
          )}
        </div>
      </div>

      {/* 강수 선택 */}
      <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-toss-dark-card">
        <p className="mb-3 text-[15px] font-bold text-toss-text dark:text-toss-dark-text">
          토너먼트 강수
        </p>
        <div
          role="radiogroup"
          aria-label="토너먼트 강수"
          className="inline-flex rounded-xl bg-toss-bg p-1 dark:bg-toss-dark-elevated"
        >
          {SIZES.map((option) => {
            const active = option === size;
            const disabled = included.length < option;
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={disabled}
                onClick={() => setSize(option)}
                className={
                  'rounded-lg px-5 py-2.5 text-[14px] font-semibold transition-all ' +
                  (active
                    ? 'bg-toss-blue text-white shadow-sm'
                    : disabled
                      ? 'text-toss-text-tertiary opacity-40'
                      : 'text-toss-text-secondary hover:text-toss-text dark:text-toss-dark-text-secondary dark:hover:text-toss-dark-text')
                }
              >
                {option}강
              </button>
            );
          })}
        </div>
      </div>

      {/* 시작 버튼 */}
      <button
        type="button"
        onClick={() => onStart(included, size)}
        disabled={!canStart}
        className="w-full rounded-2xl bg-toss-blue px-5 py-4 text-[16px] font-semibold text-white transition-transform active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {included.length}개 메뉴로 {size}강 시작
      </button>
    </div>
  );
}
