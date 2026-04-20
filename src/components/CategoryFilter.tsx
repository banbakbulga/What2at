'use client';

import { CATEGORY_FILTERS } from '@/config/categoryFilters';

type Props = {
  excludedIds: string[];
  onChange: (ids: string[]) => void;
};

export default function CategoryFilter({ excludedIds, onChange }: Props) {
  const toggle = (id: string) => {
    if (excludedIds.includes(id)) {
      onChange(excludedIds.filter((x) => x !== id));
    } else {
      onChange([...excludedIds, id]);
    }
  };

  const clear = () => onChange([]);

  return (
    <div>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[17px] font-bold text-toss-text dark:text-toss-dark-text">
            안 당기는 카테고리 빼기
          </p>
          <p className="mt-1 text-[14px] leading-relaxed text-toss-text-secondary dark:text-toss-dark-text-secondary">
            선택한 카테고리는 자동 채우기에서 제외돼요.
          </p>
        </div>
        {excludedIds.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="shrink-0 rounded-lg px-3 py-2 text-[13px] font-medium text-toss-blue"
          >
            전체 해제
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="카테고리 필터">
        {CATEGORY_FILTERS.map((cat) => {
          const excluded = excludedIds.includes(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggle(cat.id)}
              aria-pressed={excluded}
              aria-label={`${cat.label} ${excluded ? '제외됨' : '포함됨'}`}
              className={
                'inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-all active:scale-95 ' +
                (excluded
                  ? 'bg-toss-blue text-white line-through decoration-1'
                  : 'bg-toss-bg text-toss-text hover:bg-toss-blue-light hover:text-toss-blue dark:bg-toss-dark-elevated dark:text-toss-dark-text dark:hover:bg-toss-dark-border dark:hover:text-toss-blue')
              }
            >
              <span aria-hidden="true">{cat.emoji}</span>
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
