import { ImageResponse } from 'next/og';
import { type NextRequest } from 'next/server';

export const runtime = 'edge';

const MODE_STYLES: Record<string, { bg: string; accent: string; label: string }> = {
  lunch: { bg: '#FFF7ED', accent: '#FF7E36', label: '점심 월드컵' },
  drinks: { bg: '#EEF2FF', accent: '#6366F1', label: '술집 월드컵' },
  cafe: { bg: '#FFFBEB', accent: '#D97706', label: '카페 월드컵' },
  delivery: { bg: '#F0FDFA', accent: '#0D9488', label: '배달 월드컵' },
  roulette: { bg: '#FFF1F2', accent: '#E11D48', label: '룰렛 결과' },
};

const EMOJI_RULES: Array<{ keywords: string[]; emoji: string }> = [
  { keywords: ['치킨'], emoji: '🍗' },
  { keywords: ['피자'], emoji: '🍕' },
  { keywords: ['햄버거', '버거'], emoji: '🍔' },
  { keywords: ['초밥', '스시', '사시미'], emoji: '🍣' },
  { keywords: ['라멘', '라면', '우동', '소바'], emoji: '🍜' },
  { keywords: ['돈가스', '돈까스', '일식'], emoji: '🍱' },
  { keywords: ['중식', '중국'], emoji: '🥟' },
  { keywords: ['쌀국수', '베트남', '태국', '아시아'], emoji: '🍜' },
  { keywords: ['샐러드'], emoji: '🥗' },
  { keywords: ['분식', '떡볶이', '김밥'], emoji: '🍢' },
  { keywords: ['파스타', '스테이크', '이탈리', '양식'], emoji: '🍝' },
  { keywords: ['해물', '생선', '회', '횟집'], emoji: '🐟' },
  { keywords: ['갈비', '삼겹살', '곱창', '고기', '구이'], emoji: '🥩' },
  { keywords: ['찌개', '전골', '탕', '국밥'], emoji: '🍲' },
  { keywords: ['커피', '카페'], emoji: '☕' },
  { keywords: ['포장마차', '맥주', '호프', '주점', '바'], emoji: '🍺' },
  { keywords: ['한식'], emoji: '🍚' },
];

function getEmoji(category: string): string {
  for (const rule of EMOJI_RULES) {
    if (rule.keywords.some((kw) => category.includes(kw))) return rule.emoji;
  }
  return '🍽️';
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const name = searchParams.get('name') || '맛집';
  const mode = searchParams.get('mode') || 'lunch';
  const category = searchParams.get('category') || '';
  const bracket = searchParams.get('bracket') || '16';
  const distance = searchParams.get('distance') || '';
  const date = searchParams.get('date') || new Date().toLocaleDateString('ko-KR');

  const style = MODE_STYLES[mode] || MODE_STYLES.lunch;
  const emoji = getEmoji(category || name);

  const categoryDisplay = category
    .split(' > ')
    .filter((s) => s.trim() && s.trim() !== '음식점')
    .slice(-2)
    .join(' · ') || '맛집';

  const distanceText = distance && Number(distance) > 0
    ? `${distance}m · 도보 ${Math.max(1, Math.ceil(Number(distance) / 75))}분`
    : '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${style.bg} 0%, #FFFFFF 50%, ${style.bg} 100%)`,
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: style.accent,
            color: 'white',
            padding: '10px 28px',
            borderRadius: '50px',
            fontSize: '22px',
            fontWeight: 700,
            marginBottom: '32px',
          }}
        >
          🏆 {style.label} 우승
        </div>

        {/* Emoji */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '120px',
            height: '120px',
            borderRadius: '32px',
            background: `${style.accent}18`,
            fontSize: '64px',
            marginBottom: '24px',
          }}
        >
          {emoji}
        </div>

        {/* Name */}
        <div
          style={{
            fontSize: '48px',
            fontWeight: 800,
            color: '#191F28',
            textAlign: 'center',
            maxWidth: '500px',
            lineHeight: 1.2,
            marginBottom: '16px',
          }}
        >
          {name}
        </div>

        {/* Category badge */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              background: `${style.accent}20`,
              color: style.accent,
              padding: '8px 20px',
              borderRadius: '50px',
              fontSize: '20px',
              fontWeight: 600,
            }}
          >
            {categoryDisplay}
          </div>
          {distanceText && (
            <div
              style={{
                display: 'flex',
                background: '#F2F4F6',
                color: '#6B7684',
                padding: '8px 20px',
                borderRadius: '50px',
                fontSize: '20px',
                fontWeight: 500,
              }}
            >
              {distanceText}
            </div>
          )}
        </div>

        {/* Bracket info */}
        <div
          style={{
            fontSize: '18px',
            color: '#8B95A1',
            marginBottom: '8px',
          }}
        >
          {bracket}강 중 우승 🎉
        </div>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            width: '80px',
            height: '2px',
            background: '#E5E8EB',
            margin: '20px 0',
          }}
        />

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '18px',
            color: '#B0B8C1',
          }}
        >
          <span>{date}</span>
          <span>·</span>
          <span style={{ fontWeight: 700, color: style.accent }}>What2Eat</span>
        </div>
      </div>
    ),
    {
      width: 600,
      height: 600,
    },
  );
}
