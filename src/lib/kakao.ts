declare global {
  interface Window {
    kakao: any;
  }
}

export function waitForKakao(timeoutMs = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('window is not available'));
      return;
    }

    let elapsed = 0;
    const intervalMs = 100;

    const check = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => resolve());
        return;
      }

      if (elapsed >= timeoutMs) {
        reject(
          new Error(
            '카카오 맵 SDK 로드에 실패했습니다. NEXT_PUBLIC_KAKAO_MAP_KEY 환경변수와 제품 링크 관리의 웹 도메인 등록을 확인해 주세요.',
          ),
        );
        return;
      }

      elapsed += intervalMs;
      setTimeout(check, intervalMs);
    };

    check();
  });
}

export {};
