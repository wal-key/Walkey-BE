# Walkey-BE

Express.js + TypeScript + Prisma + Supabase 기반의 백엔드 API 서버

## 기술 스택

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: Supabase (PostgreSQL)
- **Validation**: Zod

## 프로젝트 구조

```
src/
├── config/          # 환경변수 및 Prisma 설정
├── controllers/     # 요청 핸들러
├── middleware/      # Express 미들웨어
├── routes/          # API 라우트 정의
├── services/        # 비즈니스 로직
├── types/           # 커스텀 타입 정의
├── utils/           # 유틸리티 함수
├── app.ts           # Express 앱 설정
└── server.ts        # 서버 엔트리포인트
```

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.example`을 `.env`로 복사하고 Supabase 연결 정보를 입력하세요:

```bash
cp .env.example .env
```

`.env` 파일을 열어 다음 값들을 수정:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?schema=public"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

### 3. Prisma 설정

```bash
# Prisma 클라이언트 생성
npm run prisma:generate

# 데이터베이스에 스키마 푸시 (개발용)
npm run prisma:push

# 또는 마이그레이션 사용 (프로덕션 권장)
npm run prisma:migrate
```

### 4. 개발 서버 실행

```bash
npm run dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

## 사용 가능한 스크립트

| 스크립트 | 설명 |
|----------|------|
| `npm run dev` | 개발 서버 실행 (hot reload) |
| `npm run build` | TypeScript 컴파일 |
| `npm start` | 프로덕션 서버 실행 |
| `npm run prisma:generate` | Prisma 클라이언트 생성 |
| `npm run prisma:migrate` | 마이그레이션 실행 |
| `npm run prisma:push` | 스키마를 DB에 푸시 |
| `npm run prisma:studio` | Prisma Studio 실행 |
| `npm run lint` | ESLint 검사 |
| `npm run format` | Prettier 포맷팅 |

## API 엔드포인트

### Health Check

```bash
GET /api/health
```

응답 예시:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected"
}
```

## 라이선스

ISC
