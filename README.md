# what2eat

주변 식당으로 오늘 점심 메뉴를 정하는 월드컵 사이드 프로젝트.

## 스택

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Kakao Maps JavaScript SDK (`services` 라이브러리)

## 시작하기

1. 의존성 설치

   ```bash
   npm install
   ```

2. 환경변수 설정

   `.env.local.example`을 `.env.local`로 복사한 뒤, Kakao Developers에서 발급받은 **JavaScript 키**를 넣어 주세요.

   ```bash
   cp .env.local.example .env.local
   ```

   ```
   NEXT_PUBLIC_KAKAO_MAP_KEY=발급받은_JavaScript_키
   ```

   > Kakao Developers 콘솔 → 내 애플리케이션 → 플랫폼 → Web 사이트 도메인에 `http://localhost:3000`을 등록해 두어야 합니다.

3. 개발 서버 실행

   ```bash
   npm run dev
   ```

   브라우저에서 [http://localhost:3000](http://localhost:3000) 접속 → 위치 권한 허용 → 콘솔과 화면에서 주변 식당 16개 확인.

## 1단계 기능 요약

- `navigator.geolocation`으로 현재 위도/경도 취득
- Kakao `Places.categorySearch('FD6', ...)`로 음식점 카테고리 검색
- 한 페이지가 15개라 부족할 수 있으므로 `pagination.nextPage()`로 누적 후 `slice(0, 16)`
- 결과를 `console.table`로 출력하고 화면에 거리순 리스트로 렌더링
