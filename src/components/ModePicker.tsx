'use client';

import { MODES, type Mode, type ModeConfig } from '@/config/modes';

type Props = {
  onSelect: (mode: Mode) => void;
};

export default function ModePicker({ onSelect }: Props) {
  return (
    <div>
      <div className="mb-5">
        <p className="text-[17px] font-bold text-toss-text dark:text-white">
          무엇을 정할까요?
        </p>
        <p className="mt-1 text-[14px] leading-relaxed text-toss-text-secondary dark:text-gray-400">
          카테고리를 골라주세요.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {MODES.map((mode) => (
          <ModeCard key={mode.id} mode={mode} onClick={() => onSelect(mode.id)} />
        ))}
      </div>
    </div>
  );
}

function ModeCard({ mode, onClick }: { mode: ModeConfig; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${mode.shortLabel} — ${mode.description}`}
      className="group flex min-h-[150px] flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-200 active:scale-[0.97] dark:border-white/5 dark:bg-[#1C1C1E] dark:shadow-md dark:shadow-black/20"
    >
      {/* 아이콘 원형 배경 */}
      <div
        className={`mb-3 flex h-14 w-14 items-center justify-center rounded-full text-[28px] transition-transform duration-200 group-hover:scale-105 ${mode.iconBg}`}
        aria-hidden="true"
      >
        {mode.emoji}
      </div>
      <p className="text-[16px] font-bold text-toss-text dark:text-white">
        {mode.shortLabel}
      </p>
      <p className="mt-0.5 text-[12px] text-toss-text-tertiary dark:text-gray-400">
        {mode.description}
      </p>
    </button>
  );
}
