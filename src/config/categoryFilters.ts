export type CategoryFilter = {
  id: string;
  label: string;
  emoji: string;
  keywords: string[];
};

export const CATEGORY_FILTERS: CategoryFilter[] = [
  { id: 'korean', label: '한식', emoji: '🍚', keywords: ['한식'] },
  {
    id: 'meat',
    label: '고기',
    emoji: '🥩',
    keywords: ['육류', '고기', '갈비', '삼겹살', '곱창', '구이'],
  },
  {
    id: 'seafood',
    label: '해산물',
    emoji: '🐟',
    keywords: ['해물', '생선', '회', '횟집', '조개'],
  },
  {
    id: 'stew',
    label: '찌개·탕',
    emoji: '🍲',
    keywords: ['찌개', '전골', '탕', '국밥'],
  },
  { id: 'chinese', label: '중식', emoji: '🥟', keywords: ['중식', '중국'] },
  {
    id: 'japanese',
    label: '일식',
    emoji: '🍣',
    keywords: ['일식', '초밥', '스시', '사시미', '돈가스', '돈까스'],
  },
  {
    id: 'noodles',
    label: '면류',
    emoji: '🍜',
    keywords: ['라멘', '라면', '우동', '소바', '쌀국수'],
  },
  {
    id: 'western',
    label: '양식',
    emoji: '🍝',
    keywords: ['양식', '파스타', '스테이크', '이탈리'],
  },
  { id: 'pizza', label: '피자', emoji: '🍕', keywords: ['피자'] },
  {
    id: 'burger',
    label: '버거',
    emoji: '🍔',
    keywords: ['햄버거', '버거'],
  },
  { id: 'chicken', label: '치킨', emoji: '🍗', keywords: ['치킨'] },
  {
    id: 'snack',
    label: '분식',
    emoji: '🍢',
    keywords: ['분식', '떡볶이', '김밥'],
  },
  { id: 'salad', label: '샐러드', emoji: '🥗', keywords: ['샐러드'] },
  {
    id: 'asian',
    label: '아시안',
    emoji: '🍛',
    keywords: ['베트남', '태국', '아시아', '인도'],
  },
  { id: 'bento', label: '도시락', emoji: '🍱', keywords: ['도시락'] },
  { id: 'buffet', label: '뷔페', emoji: '🍽️', keywords: ['뷔페'] },
];

export function matchesExcludedCategory(
  categoryName: string,
  excludedIds: string[],
): boolean {
  if (excludedIds.length === 0) return false;
  for (const id of excludedIds) {
    const filter = CATEGORY_FILTERS.find((f) => f.id === id);
    if (!filter) continue;
    if (filter.keywords.some((kw) => categoryName.includes(kw))) {
      return true;
    }
  }
  return false;
}
