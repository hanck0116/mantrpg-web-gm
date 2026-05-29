# ManTRPG Web GM 배포 안내

## 현재 배포 구조

- 정적 웹앱이다.
- 서버가 필요 없다.
- 유료 API가 필요 없다.
- 외부 DB가 필요 없다.
- 모든 게임 처리는 브라우저에서 실행된다.
- 저장은 localStorage를 사용한다.

## Cloudflare Pages 배포 방법

1. Cloudflare 로그인
2. Workers & Pages 메뉴 이동
3. Pages 선택
4. GitHub 저장소 연결
5. hanck0116/mantrpg-web-gm 선택
6. Framework preset은 None 또는 Static site 선택
7. Build command는 비워둔다
8. Build output directory는 / 또는 비워둔다
9. Deploy 클릭
10. 배포 주소로 접속해 모바일에서 확인한다

## GitHub Pages 배포 방법

1. GitHub 저장소 Settings 이동
2. Pages 메뉴 선택
3. Source를 Deploy from a branch로 선택
4. Branch는 main 선택
5. Folder는 /root 선택
6. Save
7. 생성된 Pages 주소로 접속한다

## 배포 후 확인

- 모바일에서 접속되는지 확인
- 홈 화면 추가가 가능한지 확인
- 새 게임 시작 확인
- 저장/불러오기 확인
- 오프라인 재접속 확인
- 테스트 모드는 기본 OFF인지 확인

## 캐시 갱신 주의

- service-worker.js의 CACHE_NAME을 변경해야 새 파일이 반영된다.
- 수정 후에도 예전 화면이 보이면 브라우저 캐시 또는 PWA 앱 데이터를 삭제한다.

## 비용 관련 주의

- 현재 구조는 서버, 외부 DB, 유료 API를 사용하지 않는다.
- Cloudflare Pages 또는 GitHub Pages의 정적 배포만 사용한다.
- Workers, 유료 API, 외부 DB를 연결하지 않는다.
