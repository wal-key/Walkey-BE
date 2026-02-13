# Walkey-BE 프로젝트 개요

**산책 루트 추천 백엔드 서비스** — 테마별 산책 경로를 추천하고, 사용자의 산책 세션을 기록하는 REST API 서버.

---

## 기술 스택

| 분류 | 기술 | 버전 | 용도 |
|------|------|------|------|
| **Runtime** | Node.js | - | 서버 런타임 |
| **Language** | TypeScript | ^5.9.3 | 정적 타입 언어 |
| **Framework** | Express.js | ^4.18.2 | HTTP 서버 프레임워크 |
| **ORM** | Prisma Client | ^7.3.0 | DB 쿼리 (PostgreSQL 어댑터 `@prisma/adapter-pg` 사용) |
| **Database** | PostgreSQL | - | Supabase 호스팅 PostgreSQL |
| **BaaS** | Supabase | ^2.91.1 | 일부 모델(User upsert, SocialUser)에서 Supabase JS SDK 직접 사용 |
| **인증** | jsonwebtoken | ^9.0.3 | JWT 기반 인증 |
| **비밀번호** | bcrypt | ^6.0.0 | 비밀번호 해싱 |
| **HTTP Client** | axios | ^1.13.4 | OAuth 토큰 교환 및 T-Map API 호출 |
| **보안** | helmet | ^7.1.0 | HTTP 보안 헤더 |
| **CORS** | cors | ^2.8.5 | Cross-Origin 설정 |
| **Validation** | express-validator | ^7.0.1 | 요청 유효성 검사 |
| **외부 API** | T-Map API | - | 보행자 경로 조회 (SK Open API) |
| **외부 API** | Kakao Map API | - | 프론트엔드 지도 렌더링용 API Key 제공 |
| **Dev Tools** | nodemon, jest, prettier, husky, commitlint | - | 개발/테스트/포맷팅/커밋 린팅 |

---

## 디렉토리 구조

```
Walkey-BE/
├── prisma/
│   └── schema.prisma          # Prisma 스키마 (모델 정의)
├── prisma.config.ts           # Prisma 설정 (datasource URL, migration 경로)
├── database/
│   └── schema.sql             # SQL DDL 참조용 (실행용 아님)
├── public/                    # 정적 파일 (express.static으로 서빙)
├── scripts/                   # 스크립트
├── test/                      # 테스트
├── src/
│   ├── server.ts              # ★ 엔트리포인트: 서버 시작, DB 연결 테스트, graceful shutdown
│   ├── app.ts                 # ★ Express 앱 설정: 미들웨어 체인, 라우트 마운트
│   ├── config/
│   │   ├── index.ts           # 환경변수 설정 객체 (server, supabase, database, cors)
│   │   ├── database.ts        # pg Pool (레거시 직접 연결, server.ts에서 사용)
│   │   └── supabase.ts        # Supabase 클라이언트 (anon + admin)
│   ├── lib/
│   │   └── prisma.ts          # Prisma 클라이언트 인스턴스 (PrismaPg 어댑터)
│   ├── clients/
│   │   └── tmapClient.ts      # T-Map 보행자 경로 API 클라이언트
│   ├── routes/                # Express 라우터 정의
│   │   ├── index.ts           # 라우트 통합 (/api/*)
│   │   ├── authRoutes.ts      # 인증 관련 라우트
│   │   ├── userRoutes.ts      # 사용자 관련 라우트
│   │   ├── themeRoutes.ts     # 테마 라우트
│   │   ├── routeRoutes.ts     # 산책 루트 라우트
│   │   └── adminRoutes.ts     # 관리자 라우트
│   ├── controllers/           # 요청 핸들러 (비즈니스 로직 진입점)
│   │   ├── authController.ts      # 로그인 + OAuth URL 생성
│   │   ├── oAuthController.ts     # OAuth 콜백 처리 (Google/GitHub/Naver)
│   │   ├── authKakaoController.ts # 카카오 OAuth (별도 파일)
│   │   ├── authNaverController.ts # 네이버 OAuth (별도 파일)
│   │   ├── userController.ts      # 회원가입, 로그인, 세션 생성, 산책 내역 조회
│   │   ├── routeController.ts     # 추천 루트 조회
│   │   ├── themeController.ts     # 테마 목록 조회
│   │   ├── adminController.ts     # 관리자 CRUD (테마/루트/유저)
│   │   └── databaseController.ts  # DB 연결 테스트 + 레거시 조회 API
│   ├── services/              # 비즈니스 로직 계층
│   │   ├── OAuthService.ts    # OAuth 토큰 교환 및 프로필 조회 (GitHub/Google/Naver/Kakao)
│   │   └── routeService.ts    # 추천 루트 필터링, T-Map 상세 경로 생성
│   ├── models/                # 데이터 접근 계층
│   │   ├── userModel.ts       # User CRUD (Prisma + Supabase 혼용)
│   │   ├── socialUserModel.ts # 소셜 로그인 사용자 (Supabase 전용)
│   │   ├── userInfoModel.ts   # 사용자 상세정보 (Supabase 전용)
│   │   └── routeModel.ts      # 산책 루트 조회/수정 (Prisma)
│   ├── middleware/
│   │   ├── errorHandler.ts    # 404 핸들러 + 전역 에러 핸들러
│   │   └── validate.ts        # express-validator 결과 검사 미들웨어
│   └── utils/
│       ├── asyncHandler.ts    # async/await try-catch 래퍼
│       ├── response.ts        # 통일된 응답 포맷 (successResponse, errorResponse)
│       ├── jwtUtils.ts        # JWT 발행 유틸
│       └── bigInt.ts          # BigInt JSON 직렬화 polyfill
└── package.json
```

---

## 아키텍처

### 레이어드 아키텍처

```
Client Request
     │
     ▼
┌─────────────────────────────────────────┐
│  app.ts (Express 미들웨어 체인)          │
│  helmet → cors → json parser → logger   │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  routes/ (라우터 계층)                   │
│  URL 패턴 → 컨트롤러 메서드 매핑         │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  controllers/ (컨트롤러 계층)            │
│  요청 파라미터 검증, 응답 포맷팅          │
│  asyncHandler로 에러 자동 포워딩         │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  services/ (서비스 계층)                 │
│  복잡한 비즈니스 로직 처리               │
│  외부 API 호출 조합                      │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  models/ (데이터 접근 계층)              │
│  Prisma ORM 또는 Supabase JS SDK        │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  PostgreSQL (Supabase 호스팅)            │
└─────────────────────────────────────────┘
```

### DB 접근 패턴 (이중 구조)

이 프로젝트는 **두 가지 DB 접근 방식**을 병행하고 있다:

| 방식 | 사용 위치 | 설명 |
|------|----------|------|
| **Prisma Client** (`src/lib/prisma.ts`) | `userController`, `adminController`, `themeController`, `databaseController`, `routeModel`, `userModel`(일부) | `PrismaPg` 어댑터로 pg Pool 위에 Prisma 클라이언트 생성. 주 ORM으로 사용 |
| **Supabase JS SDK** (`src/config/supabase.ts`) | `userModel.upsert()`, `socialUserModel`, `userInfoModel` | OAuth 관련 사용자 생성/갱신에서 Supabase의 `.from().upsert()` 직접 사용 |

> **참고**: `src/config/database.ts`의 raw `pg.Pool`은 `server.ts`에서 시작 시 연결 테스트 용도로만 사용된다.

---

## 데이터 모델 (ERD)

```
┌──────────────┐     1:1      ┌──────────────┐
│    users     │─────────────▶│  user_infos  │
│──────────────│              │──────────────│
│ id (UUID PK) │              │ id (UUID PK) │  ← users.id 참조
│ username     │              │ email        │
│ avatar_url   │              │ password     │
│ created_at   │              │ created_at   │
└──────┬───────┘              └──────────────┘
       │
       │ 1:N
       ▼
┌──────────────┐              ┌──────────────┐
│   sessions   │              │    themes     │
│──────────────│              │──────────────│
│ id (BigInt)  │              │ id (Int PK)  │
│ user_id (FK) │              │ title        │
│ route_id(FK) │──────┐       │ description  │
│ start_time   │      │       │ color_code   │
│ end_time     │      │       │ icon_url     │
│ actual_dist  │      │       │ created_at   │
│ actual_dur   │      │       └──────┬───────┘
│ created_at   │      │              │
└──────────────┘      │              │ 1:N
                      │              ▼
                      │       ┌──────────────┐
                      └──────▶│    routes     │
                              │──────────────│
                              │ id (BigInt)  │
                              │ theme_id(FK) │
                              │ name         │
                              │ total_dist   │
                              │ estimated_t  │
                              │ thumbnail    │
                              │ paths[]      │  ← JSON string 배열
                              │ detail_paths │  ← JSON (T-Map 상세 경로)
                              │ created_at   │
                              └──────────────┘
```

**관계 요약:**
- `User` 1:1 `UserInfo` (cascade delete)
- `User` 1:N `Session`
- `Theme` 1:N `Route`
- `Route` 1:N `Session`

---

## API 엔드포인트

모든 API는 `/api` 프리픽스 하에 마운트된다.

### 인증 (`/api/auth`)

| Method | Path | Handler | 설명 |
|--------|------|---------|------|
| POST | `/auth/login` | `AuthController.login` | 이메일/비밀번호 로그인 → JWT 반환 |
| GET | `/auth/signin/:provider` | `AuthController.getSigninUrl` | OAuth 로그인 URL 생성 (google/github/naver/kakao) |
| GET | `/auth/callback/:provider` | `OAuthController.handlerOauthCallback` | OAuth 콜백 처리 → 사용자 생성/갱신 → JWT 쿠키 발급 |
| GET | `/auth/callback/naver` | `AuthNaverController.naverLogin` | 네이버 전용 콜백 |

### 사용자 (`/api/users`)

| Method | Path | Handler | 설명 |
|--------|------|---------|------|
| POST | `/users/signin` | `UserController.signin` | 이메일/비밀번호 로그인 (Prisma 직접 조회) |
| POST | `/users/sessions` | `UserController.createUserSession` | 산책 세션 시작 (user_id + route_id) |
| GET | `/users/sessions/:username` | `UserController.getUserSessions` | 사용자의 산책 내역 + 통계 조회 |

### 테마 (`/api/themes`)

| Method | Path | Handler | 설명 |
|--------|------|---------|------|
| GET | `/themes` | `ThemeController.getThemes` | 전체 테마 목록 조회 |

### 산책 루트 (`/api/routes`)

| Method | Path | Handler | 설명 |
|--------|------|---------|------|
| GET | `/routes?theme=N&time=N` | `RouteController.getRecommendedRoutes` | 테마ID + 소요시간 기반 추천 루트 (최대 5개) |

### 관리자 (`/api/admin`)

| Method | Path | Handler | 설명 |
|--------|------|---------|------|
| GET | `/admin/stats` | `AdminController.getDashboardStats` | 대시보드 통계 (유저/루트/세션/테마 count) |
| POST | `/admin/themes` | `AdminController.createTheme` | 테마 생성 |
| DELETE | `/admin/themes/:id` | `AdminController.deleteTheme` | 테마 삭제 |
| POST | `/admin/routes` | `AdminController.createRoute` | 산책 루트 생성 |
| DELETE | `/admin/routes/:id` | `AdminController.deleteRoute` | 산책 루트 삭제 |
| GET | `/admin/users` | `AdminController.getUsers` | 사용자 목록 조회 |
| POST | `/admin/users` | `AdminController.createUser` | 사용자 생성 |
| DELETE | `/admin/users/:id` | `AdminController.deleteUser` | 사용자 삭제 |

### 기타

| Method | Path | Handler | 설명 |
|--------|------|---------|------|
| GET | `/health` | 인라인 | 헬스 체크 |
| GET | `/db/test` | `DatabaseController.testConnection` | DB 연결 테스트 |
| GET | `/config/kakao` | 인라인 | Kakao Map API Key 반환 |
| GET | `/legacy/sessions` | `DatabaseController.getSessions` | 레거시 세션 조회 |
| GET | `/legacy/posts` | `DatabaseController.getPosts` | 레거시 게시글 조회 |

---

## 주요 코드 플로우

### 1. 서버 시작 플로우

```
server.ts
  ├── dotenv/config 로드
  ├── app (Express 인스턴스) import
  ├── config (환경변수) import
  ├── app.listen(PORT)
  │    └── pool.query('SELECT NOW()') → DB 연결 테스트
  └── SIGTERM/SIGINT 핸들러 등록 → graceful shutdown
```

### 2. Express 미들웨어 체인 (`app.ts`)

```
요청 수신
  │
  ├── 1. bigInt.ts polyfill (import 시 실행)
  ├── 2. helmet() — 보안 헤더 (CSP: Kakao/Daum 도메인 허용)
  ├── 3. cors() — ALLOWED_ORIGINS 기반
  ├── 4. express.json() / urlencoded()
  ├── 5. express.static('public/')
  ├── 6. [dev only] 요청 로깅
  ├── 7. routes → /api/*
  ├── 8. notFound 핸들러 (404)
  └── 9. errorHandler (전역 에러 핸들러)
```

### 3. 추천 루트 조회 플로우

```
GET /api/routes?theme=1&time=30
  │
  ├── routeRoutes.ts → RouteController.getRecommendedRoutes
  │
  ├── RouteController (controllers/routeController.ts)
  │    ├── query 파라미터 파싱 & 검증 (theme, time → Number)
  │    └── RouteService.getRecommendedRoutes(themeId, walkTime) 호출
  │
  ├── RouteService (services/routeService.ts)
  │    ├── RouteModel.findRoutesByFilter(theme, time)
  │    │    └── Prisma: route.findMany({ where: { theme_id, estimated_time 범위 } })
  │    ├── 결과를 시간 근접도 순으로 정렬
  │    ├── paths[] (JSON 문자열 배열) → JSON 객체 파싱
  │    ├── detail_paths가 없는 루트 → TmapClient로 상세 경로 생성 & DB 저장
  │    └── 최대 5개 반환
  │
  └── TmapClient (clients/tmapClient.ts)
       ├── 경유점 배열을 순차적으로 T-Map 보행자 경로 API 호출
       ├── LineString 좌표를 LatLng 배열로 변환
       └── 중복 좌표 제거 후 하나의 경로로 합침
```

### 4. OAuth 로그인 플로우 (예: GitHub)

```
1. 프론트엔드 → GET /api/auth/signin/github
   └── AuthController.getGithubUrl → GitHub OAuth URL 반환

2. 사용자가 GitHub에서 인증 후 리다이렉트
   → GET /api/auth/callback/github?code=xxx

3. OAuthController.handlerOauthCallback → githubSignin
   ├── githubOAuth.getToken(code) → access_token 획득
   ├── githubOAuth.getProfile(token) → { username, providerId, avatarUrl }
   └── completeOAuthSignin(res, profile)
        ├── SocialUser.findByProviderId(providerId) — Supabase 조회
        ├── User.upsert({ username, avatarUrl, userId }) — Supabase upsert
        ├── SocialUser.upsert({ userId, providerId, providerName }) — Supabase upsert
        ├── UserInfo.upsert({ userId }) — Supabase upsert
        ├── issueJWT({ username, id }) → JWT 토큰 생성
        └── res.cookie('walkey_access_token', token) → 쿠키에 JWT 저장
```

### 5. 산책 세션 생성 플로우

```
POST /api/users/sessions
  Body: { user_id: "uuid", route_id: 1 }
  │
  ├── UserController.createUserSession
  │    ├── 입력값 검증 (user_id UUID 형식, route_id 존재)
  │    ├── prisma.user.findUnique({ id: user_id }) → 사용자 존재 확인
  │    ├── prisma.session.findFirst({ user_id, end_time: null }) → 진행 중 세션 확인
  │    │    └── 이미 존재하면 409 Conflict
  │    └── prisma.session.create({ user_id, route_id }) → 새 세션 생성
  └── 201 Created 응답
```

---

## 응답 포맷

### 성공 응답
```json
{
  "message": "성공 메시지",
  "data": { ... }
}
```

### 에러 응답
```json
{
  "message": "에러 메시지",
  "errors": [ ... ]  // optional
}
```

---

## 환경변수

| 변수명 | 설명 |
|--------|------|
| `PORT` | 서버 포트 (기본값: 3000) |
| `NODE_ENV` | 환경 (development/production) |
| `DATABASE_URL` | PostgreSQL 연결 문자열 (Supabase) |
| `SUPABASE_URL` | Supabase 프로젝트 URL |
| `SUPABASE_ANON_KEY` | Supabase 익명 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 롤 키 (관리자용) |
| `JWT_SECRET` | JWT 서명 시크릿 |
| `ALLOWED_ORIGINS` | CORS 허용 오리진 (쉼표 구분) |
| `AUTH_GITHUB_CLIENT_ID` | GitHub OAuth Client ID |
| `AUTH_GITHUB_SECRET` | GitHub OAuth Client Secret |
| `AUTH_GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret |
| `AUTH_KAKAO_CLIENT_ID` | Kakao OAuth Client ID |
| `NAVER_CLIENT_ID` | Naver OAuth Client ID |
| `NAVER_CLIENT_SECRET` | Naver OAuth Client Secret |
| `TMAP_API_KEY` | T-Map API Key (SK Open API) |
| `KAKAO_API_KEY` | Kakao Map JavaScript API Key |

---

## 개발 스크립트

```bash
npm run dev      # nodemon으로 개발 서버 실행 (src/server.ts)
npm run build    # TypeScript 컴파일 (dist/ 출력)
npm start        # 프로덕션 서버 실행 (dist/server.js)
npm test         # Jest 테스트 실행
```

---

## 참고 사항

1. **BigInt 직렬화**: PostgreSQL의 `bigint` 타입(Route.id, Session.id)은 JS `BigInt`로 매핑되어 JSON 직렬화 시 에러가 발생한다. `src/utils/bigInt.ts`에서 `BigInt.prototype.toJSON`을 오버라이드하여 문자열로 변환한다.

2. **Prisma PG Adapter**: `src/lib/prisma.ts`에서 `@prisma/adapter-pg`를 사용하여 Prisma가 자체 DB 커넥션 대신 `pg.Pool`을 공유한다.

3. **OAuth 미완성**: `kakaoOAuth` 클래스의 `getToken`, `getProfile` 메서드는 빈 구현 상태(stub)이다.

4. **인증 미들웨어 미적용**: 현재 라우트에 JWT 검증 미들웨어가 마운트되어 있지 않다. 관리자 API(`/api/admin`)를 포함해 모든 엔드포인트가 인증 없이 접근 가능한 상태이다.

5. **social_users 테이블**: Prisma 스키마에는 정의되어 있지 않지만, `socialUserModel.ts`에서 Supabase SDK로 직접 접근하는 `social_users` 테이블이 존재한다.

6. **community_posts 테이블**: `databaseController.ts`의 `getPosts`에서 raw SQL로 `community_posts` 테이블을 조회하는 레거시 코드가 있으나, 스키마에는 정의되어 있지 않다.
