import { BadRequestError, NotFoundError, UnauthorizedError } from '../errors/AppError';
import { OAuthStrategyFactory } from './OAuthService';
import User from '../models/userModel';
import SocialUser from '../models/socialUserModel';
import UserInfo from '../models/userInfoModel';
import { issueJWT } from '../utils/jwtUtils';
import { OAuthProfile, JwtPayload } from '../types';

/**
 * 인증 서비스 (Facade Pattern)
 *
 * [패턴: Facade Pattern]
 * 복잡한 인증 관련 비즈니스 로직(사용자 조회, 비밀번호 검증, JWT 발급, OAuth 처리)을
 * 단일 인터페이스 뒤에 캡슐화합니다.
 *
 * [효과]
 * 1. 컨트롤러가 비즈니스 로직의 세부 구현을 알 필요 없이 서비스 메서드만 호출
 * 2. 인증 로직 변경(예: JWT → 세션)이 서비스 내부에서만 이루어짐
 * 3. 단위 테스트가 용이 — 서비스 레이어만 독립적으로 테스트 가능
 */
export class AuthService {
    /**
     * 이메일/비밀번호 로그인
     * @returns JWT 토큰과 사용자 정보
     */
    static async login(email: string, password: string) {
        if (!email || !password) {
            throw new BadRequestError('이메일과 비밀번호를 모두 입력해주세요.');
        }

        const user = await User.findByEmail(email);
        if (!user) {
            throw new UnauthorizedError('이메일 또는 비밀번호가 올바르지 않습니다.');
        }

        const isMatch = await User.verifyPassword(password, user.password as string);
        if (!isMatch) {
            throw new UnauthorizedError('이메일 또는 비밀번호가 올바르지 않습니다.');
        }

        const token = issueJWT({ id: user.id, username: user.username });

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                avatarUrl: user.avatar_url,
            },
        };
    }

    /**
     * OAuth 로그인 URL 생성
     * Strategy Pattern을 통해 provider별 인증 URL을 반환합니다.
     */
    static getSigninUrl(provider: string): string {
        const strategy = OAuthStrategyFactory.getStrategy(provider);
        return strategy.getAuthUrl();
    }

    /**
     * OAuth 콜백 처리
     * 인가 코드로 토큰 → 프로필 → DB upsert → JWT 발급까지 전체 플로우를 처리합니다.
     */
    static async handleOAuthCallback(
        provider: string,
        code: string,
        state?: string
    ): Promise<string> {
        const strategy = OAuthStrategyFactory.getStrategy(provider);

        // 1. 액세스 토큰 발급
        const token = await strategy.getToken(code, state);
        if (!token) {
            throw new UnauthorizedError('소셜 로그인 토큰 에러가 발생했습니다.');
        }

        // 2. 사용자 프로필 조회
        const profile = await strategy.getProfile(token);
        if (!profile) {
            throw new UnauthorizedError('소셜 로그인 프로필 에러가 발생했습니다.');
        }

        // 3. DB에 사용자 upsert 및 JWT 발급
        return this.completeOAuthSignin(profile);
    }

    /**
     * OAuth 프로필로 사용자 upsert 후 JWT 토큰 반환
     * User → SocialUser → UserInfo 순서로 DB에 upsert합니다.
     */
    private static async completeOAuthSignin(profile: OAuthProfile): Promise<string> {
        // 기존 소셜 계정 확인
        const socialUser = await SocialUser.findByProviderId(profile.providerId);

        // 사용자 생성/업데이트
        const userData = await User.upsert({
            username: profile.username,
            avatarUrl: profile.avatarUrl,
            userId: socialUser?.user_id,
        });

        // 소셜 계정 생성/업데이트
        const socialUserData = await SocialUser.upsert({
            userId: userData.id,
            providerId: profile.providerId,
            providerName: profile.providerName,
        });

        // 사용자 정보 생성/업데이트
        await UserInfo.upsert({ userId: socialUserData.user_id });

        // JWT 발급
        return issueJWT({
            username: userData.username,
            id: userData.id,
        });
    }
}
