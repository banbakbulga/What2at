import type { Restaurant } from '@/hooks/useNearbyRestaurants';

type ShareCardParams = {
  champion: Restaurant;
  modeId: string;
  bracketSize: number;
};

export function buildOgUrl({ champion, modeId, bracketSize }: ShareCardParams): string {
  const params = new URLSearchParams({
    name: champion.place_name,
    mode: modeId,
    category: champion.category_name,
    bracket: String(bracketSize),
    distance: champion.distance || '0',
    date: new Date().toLocaleDateString('ko-KR'),
  });
  return `/api/og?${params.toString()}`;
}

export async function shareResultCard({
  champion,
  modeId,
  bracketSize,
}: ShareCardParams): Promise<'shared' | 'copied' | 'downloaded' | 'failed'> {
  const ogUrl = buildOgUrl({ champion, modeId, bracketSize });

  try {
    // Fetch the image as a blob
    const res = await fetch(ogUrl);
    const blob = await res.blob();
    const file = new File([blob], 'what2eat-result.png', { type: 'image/png' });

    // Try Web Share API with image
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: `🏆 ${champion.place_name} — What2Eat`,
        text: `${champion.place_name} 우승! 🎉`,
        files: [file],
      });
      return 'shared';
    }

    // Fallback: try share without image
    if (navigator.share) {
      const text = `🏆 오늘의 월드컵 우승: ${champion.place_name}\n📍 ${champion.address_name}\n${champion.place_url || ''}`;
      await navigator.share({ title: '점심 월드컵 결과', text });
      return 'shared';
    }

    // Fallback: download image
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'what2eat-result.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return 'downloaded';
  } catch (err) {
    // Share cancelled or failed — try clipboard text
    try {
      const text = `🏆 오늘의 월드컵 우승: ${champion.place_name}\n📍 ${champion.address_name}\n${champion.place_url || ''}`;
      await navigator.clipboard.writeText(text);
      return 'copied';
    } catch {
      return 'failed';
    }
  }
}
