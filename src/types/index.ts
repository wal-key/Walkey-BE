/**
 * 공통 타입 정의 모듈
 *
 * 프로젝트 전체에서 사용되는 인터페이스와 타입을 중앙 집중적으로 관리합니다.
 * 타입 중복 방지와 일관성 유지를 위해 모든 타입은 여기서 export합니다.
 */

// ─── OAuth 관련 타입 ───────────────────────────────────────────

/**
 * 지원하는 OAuth 제공자 리터럴 유니온 타입
 * 새 OAuth 제공자 추가 시 여기에 추가하면 컴파일 타임에 누락을 감지할 수 있습니다.
 */
export type OAuthProvider = 'google' | 'github' | 'naver' | 'kakao';

/**
 * OAuth 인증 후 반환되는 사용자 프로필 공통 인터페이스
 * 모든 OAuth 제공자는 이 형태로 프로필을 정규화하여 반환합니다.
 */
export interface OAuthProfile {
    providerId: string;
    providerName: OAuthProvider;
    username: string;
    avatarUrl: string;
}

// ─── JWT 관련 타입 ─────────────────────────────────────────────

/**
 * JWT 토큰에 포함되는 페이로드 구조
 */
export interface JwtPayload {
    id: string;
    username: string;
}

// ─── API 응답 타입 ─────────────────────────────────────────────

/**
 * 통일된 API 응답 제네릭 타입
 * 모든 API 응답은 이 형태를 따릅니다.
 */
export interface ApiResponse<T = unknown> {
    message: string;
    data?: T;
    errors?: unknown[];
}

// ─── 도메인 타입 ───────────────────────────────────────────────

/**
 * 산책 세션 통계 요약
 */
export interface SessionSummary {
    totalDistance: number;
    totalDuration: number;
    actualDistance: number;
    actualDuration: number;
}

/**
 * 사용자 프로필 응답 데이터
 */
export interface UserProfile {
    id: string;
    username: string;
    email?: string | null;
    avatarUrl: string;
    createdAt?: Date;
}
