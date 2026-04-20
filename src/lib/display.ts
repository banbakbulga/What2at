const EMOJI_RULES: Array<{ keywords: string[]; emoji: string }> = [
  { keywords: ['치킨'], emoji: '🍗' },
  { keywords: ['피자'], emoji: '🍕' },
  { keywords: ['햄버거', '버거'], emoji: '🍔' },
  { keywords: ['초밥', '스시', '사시미'], emoji: '🍣' },
  { keywords: ['라멘', '라면', '우동', '소바'], emoji: '🍜' },
  { keywords: ['돈가스', '돈까스'], emoji: '🍱' },
  { keywords: ['일식'], emoji: '🍣' },
  { keywords: ['중식', '중국'], emoji: '🥟' },
  { keywords: ['쌀국수', '베트남', '태국', '아시아'], emoji: '🍜' },
  { keywords: ['샐러드'], emoji: '🥗' },
  { keywords: ['도시락'], emoji: '🍱' },
  { keywords: ['분식', '떡볶이', '김밥'], emoji: '🍢' },
  { keywords: ['파스타', '스테이크', '이탈리', '양식'], emoji: '🍝' },
  { keywords: ['해물', '생선', '회', '횟집', '조개'], emoji: '🐟' },
  { keywords: ['갈비', '삼겹살', '곱창', '육류', '고기', '구이'], emoji: '🥩' },
  { keywords: ['찌개', '전골', '탕', '국밥'], emoji: '🍲' },
  { keywords: ['뷔페'], emoji: '🍽️' },
  { keywords: ['베이커리', '빵', '제과'], emoji: '🥐' },
  { keywords: ['디저트', '아이스크림', '케이크', '도넛', '와플'], emoji: '🍰' },
  { keywords: ['커피', '카페'], emoji: '☕' },
  { keywords: ['포장마차', '맥주', '호프', '주점', '이자카야', '와인', '바'], emoji: '🍺' },
  { keywords: ['한식'], emoji: '🍚' },
];

export function getCategoryEmoji(categoryName: string): string {
  for (const rule of EMOJI_RULES) {
    if (rule.keywords.some((kw) => categoryName.includes(kw))) {
      return rule.emoji;
    }
  }
  return '🍽️';
}

export function haversineMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function getWalkingTime(distance: string | number): string {
  const meters = typeof distance === 'string' ? Number(distance) : distance;
  if (!Number.isFinite(meters) || meters <= 0) return '';
  if (meters <= 200) return '가까움';
  const minutes = Math.max(1, Math.ceil(meters / 75));
  return `도보 ${minutes}분`;
}

export function getCategoryPath(
  categoryName: string,
  placeName: string,
): string {
  const parts = categoryName
    .split(' > ')
    .map((s) => s.trim())
    .filter(Boolean);

  if (parts.length === 0) return '';

  const withoutRoot = parts[0] === '음식점' ? parts.slice(1) : parts;
  if (withoutRoot.length === 0) return parts[parts.length - 1];

  const normalizedPlace = placeName.replace(/\s+/g, '');
  const last = withoutRoot[withoutRoot.length - 1];
  const normalizedLast = last.replace(/\s+/g, '');

  const lastLooksLikeBrand =
    normalizedPlace.includes(normalizedLast) ||
    normalizedLast.includes(normalizedPlace);

  const meaningful = lastLooksLikeBrand
    ? withoutRoot.slice(0, -1)
    : withoutRoot;

  if (meaningful.length === 0) return last;
  if (meaningful.length === 1) return meaningful[0];

  return `${meaningful[meaningful.length - 2]} · ${
    meaningful[meaningful.length - 1]
  }`;
}
