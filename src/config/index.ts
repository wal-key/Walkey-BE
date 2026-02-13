import dotenv from 'dotenv';
dotenv.config();

/**
 * 환경 설정 중앙 관리 모듈
 *
 * 모든 환경 변수를 한 곳에서 관리하여 process.env 직접 참조를 방지합니다.
 * OAuth, JWT, DB 등 설정이 여기에 집중되므로 설정 누락을 쉽게 파악할 수 있습니다.
 */
const config = {
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
  },

  supabase: {
    url: process.env.SUPABASE_URL as string,
    anonKey: process.env.SUPABASE_ANON_KEY as string,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  },

  database: {
    url: process.env.DATABASE_URL as string,
  },

  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
    ],
  },

  /** JWT 토큰 설정 — 프로젝트 전체에서 일관된 설정 사용 */
  jwt: {
    secret: process.env.JWT_SECRET || '',
    issuer: 'walkey',
    expiresIn: 1000 * 60 * 60 * 24 * 7, // 1주일
  },

  /** OAuth 제공자별 클라이언트 설정 */
  oauth: {
    baseCallbackUrl:
      process.env.OAUTH_CALLBACK_BASE_URL ||
      'http://localhost:3000/api/auth/callback',

    google: {
      clientId: process.env.AUTH_GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET || '',
    },
    github: {
      clientId: process.env.AUTH_GITHUB_CLIENT_ID || '',
      clientSecret: process.env.AUTH_GITHUB_SECRET || '',
    },
    naver: {
      clientId: process.env.AUTH_NAVER_CLIENT_ID || '',
      clientSecret: process.env.AUTH_NAVER_CLIENT_SECRET || '',
    },
    kakao: {
      clientId: process.env.AUTH_KAKAO_CLIENT_ID || '',
      clientSecret: process.env.AUTH_KAKAO_SECRET || '',
    },
  },

  /** 외부 API 키 */
  external: {
    tmapApiKey: process.env.TMAP_API_KEY || '',
    kakaoApiKey: process.env.KAKAO_API_KEY || '',
  },
} as const;

export default config;
