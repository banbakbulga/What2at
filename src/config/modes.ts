export type Mode = 'lunch' | 'drinks' | 'cafe' | 'delivery';

export type ModeConfig = {
  id: Mode;
  shortLabel: string;
  title: string;
  description: string;
  emoji: string;
  groupCode: 'FD6' | 'CE7' | 'NONE';
  includeKeywords?: string[];
  excludeKeywords?: string[];
  championLabel: string;
  locationHint: string;
  /** 아이콘 뒤 원형 배경색 */
  iconBg: string;
};

export const MODES: ModeConfig[] = [
  {
    id: 'lunch',
    shortLabel: '오점뭐',
    title: '오늘 점심 뭐먹지',
    description: '주변 식당 월드컵',
    emoji: '🍱',
    groupCode: 'FD6',
    excludeKeywords: ['술집', '간식', '실내포장마차', '포장마차'],
    championLabel: '오늘의 점심',
    locationHint: '설정 반경 안의 식당으로 토너먼트를 구성합니다.',
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
  },
  {
    id: 'cafe',
    shortLabel: '오카뭐',
    title: '오늘 카페 어디 가지',
    description: '주변 카페 월드컵',
    emoji: '☕',
    groupCode: 'CE7',
    championLabel: '오늘의 카페',
    locationHint: '설정 반경 안의 카페로 토너먼트를 구성합니다.',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
  },
  {
    id: 'drinks',
    shortLabel: '오술뭐',
    title: '오늘 술 뭐 마시지',
    description: '주변 술집 월드컵',
    emoji: '🍻',
    groupCode: 'FD6',
    includeKeywords: ['술집', '실내포장마차', '포장마차'],
    championLabel: '오늘의 한잔',
    locationHint: '설정 반경 안의 술집으로 토너먼트를 구성합니다.',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
  },
  {
    id: 'delivery',
    shortLabel: '오배뭐',
    title: '오늘 배달 뭐 시키지',
    description: '배달 메뉴 월드컵',
    emoji: '🛵',
    groupCode: 'NONE',
    championLabel: '오늘의 배달',
    locationHint: '',
    iconBg: 'bg-teal-100 dark:bg-teal-900/30',
  },
];

export function getModeConfig(mode: Mode): ModeConfig {
  const config = MODES.find((m) => m.id === mode);
  if (!config) {
    throw new Error(`Unknown mode: ${mode}`);
  }
  return config;
}
