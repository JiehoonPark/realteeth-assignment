# realteeth-assignment

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
   - `.env.example`를 참고하여 `.env` 생성
2. 의존성 설치 및 실행
   - `npm install`
   - `npm run dev`

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

- App Router 기반으로 라우팅 구성 (`src/app/(routes)`)
- FSD 레이어 구조로 관심사 분리 및 Public API 노출
- 검색은 `korea_districts.json` 기반으로 정규화/정렬 로직 적용
- 날씨 데이터는 OpenWeather API 사용, 아이콘은 공식 코드 기반 URL 사용
- TanStack Query 캐시 전략 적용 (staleTime, gcTime, keepPreviousData)

## 구현 기능

- 현재 위치 날씨 조회: 브라우저 Geolocation으로 좌표를 받아 날씨 표시
- 위치 검색 및 상세 이동: 디바운스 자동완성 + Enter 즉시 매칭으로 상세 페이지 이동
- 즐겨찾기 관리: 추가/삭제, 별칭 수정, 전용 페이지에서 목록/날씨 카드 제공
- 검색 결과 없음 처리: 서버 라우트에서 `notFound()` 호출로 공용 Not Found UI 렌더
- 시간대별 기온: 가장 가까운 시간 슬롯 하이라이트, 모바일/데스크탑에 맞춘 레이아웃
- OpenWeather 아이콘 활용: 응답 코드 기반 공식 아이콘 URL 매핑

## 기술적 의사결정 및 이유

- 검색 Enter vs 자동완성 불일치
  - 디바운스 값과 즉시 입력값 차이 → Enter는 즉시 매칭으로 통일해 일관성 확보
- "동/구/시" 우선순위 정렬
  - 정규화한 키워드와 전체명/단일명 일치도 점수(정확 일치 > 시작 일치 > 포함)를 먼저 계산하고, 동점 시 행정 레벨 우선순위(시도 > 시군구 > 동), 최종 동점 시 전체명 길이가 짧은 항목을 앞세워 기대하는 행정단계를 우선 노출하였습니다.
- 3시간 단위 데이터에서 "현재 시간" 슬롯 표시
  - 3시간 간격 슬롯(예: 06, 09, 12…) 중에서 현재 시각과의 거리(분) 차이가 같은 슬롯이 둘 이상일 때, 뒤(미래) 시간대 슬롯을 선택
- 새로고침 시 즐겨찾기/설명 영역 깜빡임·레이아웃 시프트
  - placeholder, min-height, keepPreviousData로 시각적 안정성 확보
- 검색 결과 없음 처리
  - `/search` 라우트에서 결과 확인 후 `notFound()`로 위임해 에러 플로우 단순화
- 주기적 리패치와 인터벌
  - OpenWeather 업데이트 주기를 고려해 10분 간격으로 `refetchInterval`을 두었으며, `refetchOnWindowFocus`는 비활성화하여 머무르는 동안 불필요한 깜빡임을 줄였습니다.
- 캐싱 전략
  - `staleTime/gcTime/keepPreviousData`와 refetch interval을 맞춰 깜빡임 최소화 및 중복 호출 방지
- 렌더링/데이터 패칭 전략 (CSR/SSR/ISR)
  - 위치 정보(브라우저 Geolocation)와 사용자 즐겨찾기 상태는 요청별·사용자별로 달라 정적 생성/ISR 이점이 낮아 CSR로 처리하였습니다.
  - 공용 에러 흐름은 서버 라우트에서 `notFound()`로 처리해 SSR 경로를 유지하고, OpenWeather 호출은 API Route를 통해 서버에서 프록시하여 키 노출을 방지하였습니다.
- Public API 일원화
  - FSD 슬라이스마다 `index.ts`로 외부 의존 경로를 단일화해 구조 변경 시 영향 최소화

## 데이터 소스

- 국내 행정구역: `korea_districts.json`
- 날씨/아이콘: OpenWeather API
