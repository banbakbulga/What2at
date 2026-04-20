'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'what2eat-onboarding-done';

type Word = { text: string; highlight?: boolean };

const STEPS: Word[][] = [
  [
    { text: '매일' },
    { text: '돌아오는' },
    { text: '점심시간', highlight: true },
    { text: '...' },
  ],
  [
    { text: '오늘도' },
    { text: '메뉴 고르기' },
    { text: '\n' },
    { text: '힘드신가요', highlight: true },
    { text: '?' },
  ],
  [
    { text: '이제,' },
    { text: '고민하지', highlight: true },
    { text: '\n' },
    { text: '마세요.' },
  ],
];

const HOLD_MS = 1800;
const FADE_S = 0.45;
const STEP_INTERVAL = HOLD_MS + FADE_S * 1000 + 300;

type Props = { onDone: () => void };

export default function IntroScreen({ onDone }: Props) {
  const [step, setStep] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const advance = useCallback(() => {
    setStep((s) => {
      if (s < STEPS.length) {
        if (timerRef.current) clearTimeout(timerRef.current);
        return s + 1;
      }
      return s;
    });
  }, []);

  useEffect(() => {
    if (step >= STEPS.length) return;
    timerRef.current = setTimeout(advance, STEP_INTERVAL);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [step, advance]);

  const handleStart = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore
    }
    onDone();
  }, [onDone]);

  const isFinalStep = step >= STEPS.length;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center overflow-hidden bg-white dark:bg-toss-dark-bg"
      onClick={!isFinalStep ? advance : undefined}
    >
      {/* 건너뛰기 */}
      <AnimatePresence>
        {!isFinalStep && (
          <motion.button
            key="skip"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleStart();
            }}
            className="absolute right-5 top-5 z-10 rounded-lg px-3 py-2 text-[13px] text-toss-text-tertiary transition-colors hover:text-toss-text dark:text-toss-dark-text-tertiary dark:hover:text-toss-dark-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            건너뛰기
          </motion.button>
        )}
      </AnimatePresence>

      {/* 스텝 콘텐츠 */}
      <AnimatePresence mode="wait">
        {!isFinalStep ? (
          <motion.div
            key={`line-${step}`}
            className="flex flex-wrap items-center justify-center gap-x-[0.35em] px-8 text-center text-[22px] font-semibold leading-relaxed text-toss-text dark:text-toss-dark-text sm:text-[26px]"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.08, delayChildren: 0.05 },
              },
              exit: {
                opacity: 0,
                y: -10,
                transition: { duration: FADE_S * 0.7, ease: [0.4, 0, 1, 1] },
              },
            }}
          >
            {STEPS[step].map((word, i) =>
              word.text === '\n' ? (
                <span key={i} className="w-full" />
              ) : (
                <motion.span
                  key={i}
                  className={word.highlight ? 'text-toss-blue' : ''}
                  variants={{
                    hidden: { opacity: 0, y: 14, filter: 'blur(4px)' },
                    visible: {
                      opacity: 1,
                      y: 0,
                      filter: 'blur(0px)',
                      transition: {
                        duration: 0.45,
                        ease: [0.25, 0.1, 0.25, 1],
                      },
                    },
                  }}
                >
                  {word.text}
                </motion.span>
              ),
            )}
          </motion.div>
        ) : (
          <motion.div
            key="final"
            className="flex flex-col items-center px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="mb-6 flex h-[88px] w-[88px] items-center justify-center rounded-[28px] bg-toss-blue text-[44px] shadow-xl"
              initial={{ opacity: 0, scale: 0.6, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 180, damping: 16, delay: 0.1 }}
            >
              🍴
            </motion.div>

            <motion.div
              className="mb-10 flex flex-wrap items-center justify-center gap-x-[0.3em] text-center text-[20px] font-semibold leading-relaxed text-toss-text dark:text-toss-dark-text sm:text-[22px]"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.06, delayChildren: 0.35 } },
              }}
            >
              {['당신의', '완벽한', '점심을'].map((w, i) => (
                <motion.span
                  key={i}
                  className={i === 1 ? 'text-toss-blue' : ''}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
                  }}
                >
                  {w}
                </motion.span>
              ))}
              <span className="w-full" />
              <motion.span
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
                }}
              >
                찾아드립니다.
              </motion.span>
            </motion.div>

            <motion.button
              type="button"
              onClick={handleStart}
              className="rounded-2xl bg-toss-blue px-10 py-4 text-[17px] font-semibold text-white shadow-lg"
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
              whileTap={{ scale: 0.96 }}
            >
              시작하기
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 하단 진행 도트 */}
      <div className="absolute bottom-10 flex gap-2">
        {[...STEPS, 'final'].map((_, i) => (
          <motion.span
            key={i}
            className="block h-1.5 rounded-full"
            animate={{
              width: i === step ? 20 : 6,
              backgroundColor: i === step ? '#FF7E36' : i < step ? '#FF7E36' : '#E5E8EB',
              opacity: i <= step ? 1 : 0.5,
            }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        ))}
      </div>

      {/* 탭 힌트 */}
      <AnimatePresence>
        {step === 0 && (
          <motion.p
            className="absolute bottom-20 text-[12px] text-toss-text-tertiary dark:text-toss-dark-text-tertiary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.2, duration: 0.4 }}
          >
            화면을 탭하면 넘어갑니다
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function hasCompletedOnboarding(): boolean {
  if (typeof window === 'undefined') return true;
  if (process.env.NODE_ENV === 'development') return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}
