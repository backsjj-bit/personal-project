# 작업 히스토리

이 문서는 Supabase 연동 및 관련 버그 수정 작업에서 새로 만들거나 수정한 파일과 그 이유를 정리한 것입니다.

## 1. 회원가입/로그인/로그아웃을 Supabase Auth로 전환

기존에는 `js/utils.js`가 localStorage에 이름/이메일/**평문 비밀번호**를 직접 저장하는 방식이었음. 이를 Supabase Auth로 교체.

**새로 만든 파일**
- `js/supabaseClient.js` — Supabase 프로젝트 URL + anon key로 클라이언트 초기화 (`window.supabaseClient`)
- `supabase/schema.sql` — Supabase에 만든 테이블 스키마
  - `categories`, `menus` — 메뉴 데이터 (아직 코드에서는 안 씀, 다음 phase용으로 미리 준비)
  - `profiles` — 회원 이름/가입쿠폰 사용여부 (Supabase 내장 `auth.users`에 연결)
  - `orders` — 주문 데이터 (아직 코드에서는 안 씀)
  - RLS 정책 + 테이블 권한(GRANT) 포함

**수정한 파일**
- `js/utils.js` — `registerUser`, `login`, `logout`, `getCurrentUser`, `hasSignupCoupon`, `redeemSignupCoupon`, `createOrder`를 전부 `async`로 바꾸고 Supabase Auth 호출로 교체. localStorage 기반 `getUsers`/`saveUsers`/`findUserByEmail`은 삭제.
- `auth/login.js`, `auth/signup.js` — 폼 제출 핸들러를 `async`로, `await login(...)` / `await registerUser(...)`
- `my/index.js` — `init()`을 `async`로, `await getCurrentUser()`
- `index.js` — 홈 화면 스탬프카드를 `async`로, `await CafeUtils.getCurrentUser()`
- `basket/list.js` — 쿠폰 가능 여부 확인/체크아웃 로직을 `async`로
- `index.html`, `auth/login.html`, `auth/signup.html`, `basket/list.html`, `my/index.html`, `orders/list.html`, `orders/detail.html` — Supabase JS(CDN) + `js/supabaseClient.js` `<script>` 태그 추가

**사전 준비 필요 (Supabase 대시보드)**
- SQL Editor에서 `supabase/schema.sql` 실행 완료
- Authentication → Sign In/Providers → Email의 "Confirm email" 끔, 이메일 회원가입 활성화 확인

## 2. 주문내역이 계정 구분 없이 전체 노출되던 버그 수정

`getOrders()`가 브라우저에 저장된 **모든 계정의 주문**을 필터링 없이 반환하던 기존 버그. 실제로 여러 계정으로 테스트하면서 발견됨.

**수정한 파일**
- `my/index.js` — 주문 목록을 `order.userEmail === user.email`로 필터링
- `orders/list.js`, `orders/detail.js` — 동일하게 현재 로그인 사용자 이메일로 필터링 (`getCurrentUser` 추가로 사용)
- `orders/list.html`, `orders/detail.html` — Supabase 스크립트 태그 추가 (위 항목과 동일 이유)

## 3. 마이페이지가 홈 화면 스크립트를 잘못 불러오던 버그 (경로 문제)

`cleanUrls` 실험 중, `/my`처럼 슬래시 없는 주소로 들어가면 상대경로(`../js/utils.js`, `./index.js`)가 엉뚱한 파일(루트의 `index.js`)을 가리키는 문제 발견.

**수정한 파일 (17개 HTML 전체)**
- `index.html`, `auth/login.html`, `auth/signup.html`, `basket/list.html`, `menus/list.html`, `menus/detail.html`, `my/index.html`, `orders/list.html`, `orders/detail.html`, `admin/login.html`, `admin/index.html`, `admin/menus/{list,detail,create,edit}.html`, `admin/orders/{list,detail}.html`
- 모든 `<script src>`, `<link href>`, `<img src>`, `<a href>` 내부 링크를 상대경로(`../js/utils.js` 등) → 루트 절대경로(`/js/utils.js`)로 일괄 전환. URL 형태와 무관하게 항상 올바른 파일을 찾도록 함.

## 4. 랜딩페이지 하단 버튼 겹침 수정

관리자 링크(footer)와 우측 하단 "맨 위로" 버튼이 겹쳐 보이던 문제.

**수정한 파일**
- `index.css` — `.site-footer`의 정렬을 `flex-end` → `flex-start`로 변경 (관리자 링크를 좌측 하단으로 이동)

## 5. 가입 축하 쿠폰이 르뱅쿠키 없이도 체크 가능하던 버그

`.coupon-option { display: flex }` 규칙이 JS가 설정하는 `hidden` 속성보다 우선 적용돼서, 르뱅쿠키가 장바구니에 없어도 가입 쿠폰 체크박스가 계속 보이고 클릭 가능했던 문제.

**수정한 파일**
- `basket/list.css` — `.coupon-section[hidden], .coupon-option[hidden] { display: none; }` 규칙 추가

## 6. serve.json / clean URL 관련 실험 (최종적으로 원복)

"주소에 `.html` 없이 접속되게 해달라"는 요청으로 `cleanUrls: true` 및 커스텀 `rewrites` 여러 개를 시도했으나:
- `cleanUrls: true`의 301 리다이렉트가 쿼리스트링(`?id=...`)을 삭제해버려 메뉴/주문 상세페이지가 깨짐
- 커스텀 `rewrites`를 여러 개 조합하면 규칙끼리 간섭해서 루트 페이지까지 깨짐 (serve 패키지 자체의 한계로 추정)

**최종 결정**: `serve.json`을 최초의 안정적인 설정으로 원복.
```json
{
  "cleanUrls": false,
  "rewrites": [{ "source": "/", "destination": "/index.html" }]
}
```
앱 내 모든 링크/버튼은 이미 `.html`이 정확히 붙어있어 클릭 기반 탐색에는 영향 없음. 단, 브라우저가 실험 중 발생한 301 리다이렉트를 캐시해뒀을 수 있으니, 시연 전 캐시 삭제(또는 시크릿 창) 권장.

## 다음 단계 후보

- 메뉴 데이터(`categories`, `menus`)를 localStorage에서 Supabase로 이전
- 주문 데이터(`orders`)를 localStorage에서 Supabase로 이전
- 관리자 로그인도 Supabase Auth 기반으로 전환 (현재는 `js/utils.js`에 아이디/비밀번호 하드코딩)
- 실제 결제(PG) 연동
- 확장자 없는 URL 지원이 정말 필요하면, `serve` 대신 nginx의 `try_files`로 라우팅 처리 (더 안정적)
