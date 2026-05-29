# ManRPG v18 FINAL 규칙 추출 기록

## 원본 zip 확인 상태

원본 zip 미확인으로 규칙 추출 대기.

- 기대 경로: `source/ManRPG_v18_FINAL_병합패키지.zip`
- 확인 일자: 2026-05-29
- 현재 상태: 저장소에서 원본 zip을 찾지 못했으므로 압축 해제와 내부 파일 구조 확인을 수행하지 못했다.

## zip 업로드 후 확인할 항목

zip 파일이 추가되면 작업을 멈추지 않고 반드시 압축을 해제해 다음 파일을 찾는다.

- 통합본
- 시트지
- 플레이어 파일
- 규칙 파일

## 현재 임시 구현 규칙

원본 zip 미확인 상태라서 아래 공식은 임시 구현이다. zip 내부 통합본과 충돌하면 통합본을 우선한다.

- `calcDerivedStats(state)`
  - `maxHP = 체력 * 10`
  - `maxMP = 레벨 * 5 + 지능 * 10`
  - `mpRegen = 레벨 + 지혜 * 2`
  - `basicAtk = floor((힘 + 체력) / 10) + 2`
- `rollStatCheck(effectiveStat, bonus)`
  - `1d(effectiveStat) + bonus` 형태의 임시 스탯 판정이다.
- `rollAbsoluteCheck(effectiveStat, bonus)`
  - `1d20 + effectiveStat + bonus` 형태의 임시 절대 판정이다.
- `resolveBasicAttack(actor, target)`
  - 공격자 힘 기반 주사위와 임시 방어선을 비교한다.
  - 피해는 임시 `basicAtk` 값을 사용한다.

## 확정 개발 원칙

- 기본 플레이는 AI 없이 가능해야 한다.
- AI는 규칙 판정자가 아니라 선택형 서술자 또는 자연어 해석자다.
- 주사위, HP, MP, 코인, 보상, 마법서, 상태 변화는 로컬 JavaScript/TypeScript 코드가 처리한다.
- 적은 항상 1명이다.
- 맵은 항상 동일한 2D CSS Grid 맵이다.
- 실시간 전투 중심 구현은 하지 않는다.
