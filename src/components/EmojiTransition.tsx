'use client';

import { useEffect, useMemo } from 'react';

const EMOJIS = [
  '🍜', '🍕', '🍔', '🍣', '🌮', '🍱', '☕', '🥗',
  '🍰', '🧁', '🍝', '🥘', '🍛', '🥟', '🍖', '🌯',
  '🍿', '🥞',
];

const TOTAL_MS = 1550;
const FILLED_MS = 450;

type Props = {
  onFilled?: () => void;
  onComplete: () => void;
};

export default function EmojiTransition({ onFilled, onComplete }: Props) {
  const items = useMemo(() => {
    const cols = 3;
    const rows = 7;
    const result: { emoji: string; style: React.CSSProperties }[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const x = (c * 100) / cols;
        const y = (r * 100) / rows;
        const delay = (rows - 1 - r) * 0.04;

        result.push({
          emoji: EMOJIS[idx % EMOJIS.length],
          style: {
            left: `${x}%`,
            top: `${y}%`,
            width: `${100 / cols}%`,
            height: `${100 / rows}%`,
            fontSize: `${100 / cols}vw`,
            lineHeight: 0.85,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ['--d' as string]: `${delay.toFixed(3)}s`,
          },
        });
      }
    }
    return result;
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => onFilled?.(), FILLED_MS);
    const t2 = setTimeout(onComplete, TOTAL_MS);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onFilled, onComplete]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden="true"
    >
      {items.map((item, i) => (
        <span
          key={i}
          className="emoji-wave absolute select-none will-change-transform"
          style={item.style}
        >
          {item.emoji}
        </span>
      ))}
    </div>
  );
}
