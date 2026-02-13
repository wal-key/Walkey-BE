import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/response';
import { AuthService } from '../services/authService';
import { OAuthStrategyFactory } from '../services/OAuthService';
import { BadRequestError } from '../errors/AppError';

/**
 * OAuth 콜백 컨트롤러 (Thin Controller + Strategy Pattern 활용)
 *
 * [패턴: Thin Controller]
 * OAuth 콜백 처리를 Strategy Pattern 기반의 AuthService에 완전히 위임합니다.
 *
 * [변경사항]
 * 기존: 4개의 개별 signin 메서드 + providerHandlers Record로 라우팅
 *       → string[] 인덱스 타입 에러 발생
 * 현재: OAuthStrategyFactory.isValidProvider()로 타입 가드 후 AuthService에 위임
 *       → 타입 안전성 보장 + 코드 172줄 → 40줄로 축소
 */
class OAuthController {
  /** OAuth 콜백 핸들러 — provider별 전략이 자동으로 선택됨 */
  static handleOAuthCallback = asyncHandler(
    async (req: Request, res: Response) => {
      const provider = req.params.provider as string;

      // 타입 가드: 유효한 OAuth provider인지 검증
      if (!OAuthStrategyFactory.isValidProvider(provider)) {
        throw new BadRequestError(
          `지원하지 않는 OAuth 제공자입니다: ${provider}`
        );
      }

      const code = req.query.code as string;
      const state = req.query.state as string | undefined;

      // AuthService가 토큰 발급 → 프로필 조회 → DB upsert → JWT 발급을 처리
      const accessToken = await AuthService.handleOAuthCallback(
        provider,
        code,
        state
      );

      // JWT를 httpOnly 쿠키에 설정
      res.cookie('walkey_access_token', accessToken, {
        httpOnly: true,
      });

      return successResponse(res, 200, null, '성공적으로 로그인 되었습니다.');
    }
  );
}

export default OAuthController;
