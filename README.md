# ManRPG PWA AI

ManRPG PWA AI는 `ManRPG_v18_FINAL_병합패키지.zip`을 기준으로 구현할 모바일 우선 PWA 턴제 텍스트 TRPG입니다.

이번 단계는 완성 게임이 아니라 **프로젝트 뼈대 + 원본 규칙 정리 문서 + 기본 화면 실행**을 목표로 합니다.

## 현재 구현된 것

- Vite + TypeScript 기반 프로젝트 구조
- 모바일 우선 기본 화면
- 7x7 고정 CSS Grid 전술 맵
- 플레이어 1명과 적 1명 표시
- 기본 상태창
- 전투 로그 영역
- 선택형 AI 설정 패널 자리
- AI 라우터 타입/스텁
- Cloudflare Worker 타입/스텁
- 로컬 저장 유틸리티 자리
- `docs/rules-extracted.md` 규칙 추출 기록

## 실행 방법

```bash
npm install
npm run dev
```

개발 서버가 실행되면 출력되는 로컬 주소를 브라우저에서 연다. 기본 포트는 `5173`이다.

## 빌드 확인

```bash
npm run build
```

## 프로젝트 구조

```text
.
├── docs/
│   └── rules-extracted.md
├── public/
│   ├── icon.svg
│   ├── manifest.json
│   └── service-worker.js
├── src/
│   ├── ai/
│   ├── game/
│   ├── map/
│   ├── rules/
│   ├── state/
│   ├── storage/
│   ├── ui/
│   ├── main.ts
│   └── styles.css
├── worker/
│   ├── index.ts
│   └── types.ts
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 중요한 개발 원칙

- 원본 규칙을 추측하지 않는다.
- 모르는 규칙은 TODO로 남긴다.
- 맵은 항상 동일한 2D 격자 맵이다.
- 적은 항상 1명이다.
- 보스몹은 만들지 않는다.
- API 키는 코드에 넣지 않는다.
- API가 없어도 로컬 규칙만으로 게임이 진행되어야 한다.
- AI는 규칙 판정자가 아니라 선택형 서술자 또는 자연어 해석자 역할만 한다.

## 원본 패키지 확인 상태

현재 작업 트리에는 `deep-research-report.md`와 `ManRPG_v18_FINAL_병합패키지.zip`이 없어 실제 압축 해제와 내부 규칙 추출을 완료하지 못했다. 자세한 확인 기록과 TODO는 `docs/rules-extracted.md`를 참고한다.
