# realteeth-assignment

## 배포 주소

- https://realteeth-assignment-five.vercel.app/

## 프로젝트 개요

- 위치 기반 날씨 조회와 즐겨찾기 관리를 제공하는 과제용 웹 앱

## 기술 스택

- Next.js 16 (App Router)
- React 19, TypeScript 5
- TanStack Query 5
- Tailwind CSS 4
- Radix UI, Lucide React (아이콘)

## 실행 방법

1. 환경 변수 설정
   - `.env.example`를 참고하여 `.env`를 생성하였습니다.
2. 의존성 설치 및 실행
   - `npm install`
   - `npm run dev`
3. 현재 위치 날씨 조회는 브라우저에서 위치 권한을 허용해 주셔야 정상 동작합니다.

## 환경 변수

```env
OPENWEATHER_API_KEY={메일로 전달 드린 API_KEY}
OPENWEATHER_BASE_URL=https://api.openweathermap.org/data/2.5
```

## 폴더 구조 (FSD)

```text
src/
  app/
    (routes)/            # 라우트 세그먼트
      favorites/
      locations/[locationId]/
      search/
    api/                 # 라우트 핸들러
    layout.tsx           # 전역 레이아웃
    page.tsx             # 홈
    not-found.tsx        # 공용 Not Found
  widgets/               # 페이지를 구성하는 큰 UI 블록
    gnb/
    weather/
    favorites/
  features/              # 사용자 행동 단위 기능
    search/
    favorites/
  entities/              # 도메인 모델 및 API
    weather/
      api/
      model/
      lib/
    location/
      api/
      model/
      lib/
  shared/                # 공통 UI/유틸/설정
    ui/
    lib/
    api/
    providers/
```

## 구성 방법

- App Router 기반으로 라우팅을 구성하였습니다 (`src/app/(routes)`).
- FSD 레이어 구조로 관심사를 분리하고 `index.ts`를 통해 Public API를 노출하였습니다.
- 검색은 `korea_districts.json`을 정규화하여 일치도/레벨 우선순위 정렬 로직과 함께 적용하였습니다.
- 날씨 데이터는 OpenWeather API 응답의 `icon` 코드를 이용해 공식 아이콘 URL을 매핑하였습니다.
- TanStack Query의 `staleTime/gcTime/keepPreviousData`와 refetch interval을 조정하여 깜빡임을 줄였습니다.

## 구현 기능

- 현재 위치 날씨 조회: 브라우저 Geolocation으로 좌표를 받아 날씨를 표시하며, 좌표를 캐시에 저장해 새로고침 시 재사용합니다. 위치 권한 허용이 필요합니다.
- 위치 검색 및 상세 이동: 디바운스 자동완성과 Enter 즉시 매칭으로 상세 페이지로 이동하도록 구성하였습니다.
- 즐겨찾기 관리: 추가/삭제, 별칭 수정, 전용 페이지에서 목록/날씨 카드 제공
- 검색 결과 없음 처리: 서버 라우트에서 `notFound()` 호출로 공용 Not Found UI 렌더
- 시간대별 기온: 가장 가까운 시간 슬롯을 계산해 하이라이트하며, 모바일/데스크탑에 맞춘 레이아웃을 제공합니다.
- OpenWeather 아이콘 활용: 응답 코드 기반 공식 아이콘 URL을 사용하여 일관된 시각 요소를 제공합니다.

## 기술적 의사결정 및 이유

- 검색 Enter vs 자동완성 불일치
  - 디바운스 값과 즉시 입력값 차이가 있었으나, Enter는 즉시 매칭으로 통일하여 일관성을 확보하였습니다.
- "동/구/시" 우선순위 정렬
  - 정규화한 키워드와 전체명/단일명 일치도 점수(정확 일치 > 시작 일치 > 포함)를 계산하고, 동점 시 행정 레벨 우선순위(시도 > 시군구 > 동), 최종 동점 시 전체명 길이를 기준으로 기대하는 행정단계를 앞세웠습니다.
- 3시간 단위 데이터에서 "현재 시간" 슬롯 표시
  - 3시간 간격 슬롯(예: 06, 09, 12…) 중 현재 시각과의 거리(분) 차이가 같은 경우 미래 시간대를 우선하여 표시하였습니다.
- 새로고침 시 깜빡임·레이아웃 시프트
  - 즐겨찾기 버튼 placeholder, 설명 영역 min-height, `keepPreviousData`를 적용하여 시각적 안정성을 확보하였습니다.
- 검색 결과 없음 처리
  - `/search` 라우트에서 결과를 확인한 뒤 `notFound()`로 위임하여 에러 플로우를 단순화하였습니다.
- 주기적 리패치와 인터벌
  - OpenWeather 현재 날씨가 약 10분 주기로 갱신되는 점을 고려해 `refetchInterval`을 10분으로 두고, `refetchOnWindowFocus`는 비활성화하여 화면 머무름 시 불필요한 깜빡임을 줄였습니다.
- 캐싱 전략
  - `staleTime/gcTime/keepPreviousData`와 refetch interval을 맞춰 깜빡임을 최소화하고 중복 호출을 방지하였습니다.
- 렌더링/데이터 패칭 전략 (CSR/SSR/ISR)
  - 위치 정보와 즐겨찾기는 사용자별로 달라 정적 생성/ISR 이점이 낮아 CSR로 처리하였고, 공용 에러는 서버 라우트에서 `notFound()`로 처리하며 OpenWeather 호출은 API Route에서 프록시하여 키 노출을 방지하였습니다.
- Public API 일원화
  - 각 슬라이스의 `index.ts`로 외부 의존 경로를 단일화하여 구조 변경 시 영향을 최소화하였습니다.

## 데이터 소스

- 국내 행정구역: `korea_districts.json`
- 날씨/아이콘: OpenWeather API
