# ManRPG PWA AI

ManRPG PWA AI는 `ManRPG_v18_FINAL_병합패키지.zip`을 기준으로 구현할 모바일 우선 PWA 턴제 텍스트 TRPG입니다.

이번 단계의 목표는 완성 게임이 아니라 **실행 가능한 PWA 기본 골격 + 로컬 규칙 엔진 시작 + 고정 맵 화면**입니다.

## 원본 zip 상태

원본 zip 업로드 필요: `source/ManRPG_v18_FINAL_병합패키지.zip`

현재 저장소에서 원본 zip과 루트 `deep-research-report.md`를 찾지 못했으므로 `docs/rules-extracted.md`에는 "원본 zip 미확인으로 규칙 추출 대기" 상태를 기록했습니다. zip이 추가되면 압축을 해제해 통합본, 시트지, 플레이어 파일, 규칙 파일을 확인해야 합니다.

## 실행 방법

```bash
npm install
npm run dev
```

개발 서버가 실행되면 출력되는 로컬 주소를 브라우저에서 엽니다. 기본 포트는 `5173`입니다.

## 빌드 확인

```bash
npm run build
```

## 현재 구현된 것

- Vite + TypeScript 기반 프로젝트 구조
- 모바일 우선 기본 화면
- 7x7 고정 CSS Grid 전술 맵
- 플레이어 1명과 적 1명 표시
- 플레이어 상태창과 적 상태창
- 전투 로그 영역
- 이동, 기본 공격, 스킬, 마법, 아이템, 방어, 대기, 턴 마무리 버튼
- 접이식 AI 설정 패널 자리
- 미니맵 요약 영역
- 저장/불러오기 stub
- AI 라우터와 provider stub
- Cloudflare Worker 기본 stub

## 로컬 규칙 엔진 1차 구현

원본 zip 미확인 상태라서 아래 공식은 임시 구현입니다. zip 내부 통합본과 충돌하면 통합본을 우선합니다.

- `calcDerivedStats(state)`
  - `maxHP = 체력 * 10`
  - `maxMP = 레벨 * 5 + 지능 * 10`
  - `mpRegen = 레벨 + 지혜 * 2`
  - `basicAtk = floor((힘 + 체력) / 10) + 2`
- `rollStatCheck(effectiveStat, bonus)`
- `rollAbsoluteCheck(effectiveStat, bonus)`
- `resolveBasicAttack(actor, target)`

## 개발 원칙

- 중앙 서버, 유료 API, 외부 DB를 필수로 사용하지 않습니다.
- API 키 없이도 화면이 떠야 합니다.
- 규칙, 판정, 전투, 보상, 미니맵은 로컬 JavaScript/TypeScript에서 처리합니다.
- AI는 GM 묘사, 애매한 행동 해석, 희소한 스킬/마법 설명 생성에만 사용합니다.
- AI는 판정, 주사위, 보상, 적 행동을 결정하지 않습니다.
