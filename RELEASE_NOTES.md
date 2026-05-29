# Release Notes

## v0.1.1

### 추가된 기능

- 모바일 상태창 요약/상세 분리
- 현재 단계 안내 문구
- 테스트 모드
- 배포 전 점검 패널
- DEPLOY.md 배포 문서
- 저장 데이터 내보내기/가져오기
- PWA 캐시 버전 관리

### 현재 구조

- 서버 없음
- 유료 API 없음
- 외부 DB 없음
- AI 기능 없음
- 브라우저 로컬 실행
- localStorage 저장
- 7x7 고정 전술 맵
- 적은 항상 1명

### 배포 전 주의

- ENABLE_TEST_MODE는 false로 유지한다.
- service-worker.js의 CACHE_NAME을 변경해야 새 파일이 반영된다.
- 저장 데이터는 사용자 브라우저에 저장된다.
