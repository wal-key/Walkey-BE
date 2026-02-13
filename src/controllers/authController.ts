import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/response';
import { AuthService } from '../services/authService';
import { OAuthStrategyFactory } from '../services/OAuthService';
import { BadRequestError } from '../errors/AppError';

/**
 * 인증 컨트롤러 (Thin Controller Pattern)
 *
 * [패턴: Thin Controller]
 * 컨트롤러의 책임을 "입력 파싱 → 서비스 호출 → 응답 반환"으로 제한합니다.
 * 모든 비즈니스 로직은 AuthService에 위임됩니다.
 *
 * [효과]
 * 1. 컨트롤러가 얇아져서 가독성과 유지보수성이 향상
 * 2. 비즈니스 로직을 서비스 레이어에서 독립적으로 테스트 가능
 * 3. HTTP 관심사(req/res)와 도메인 로직의 명확한 분리
 */
class AuthController {
  /** OAuth 로그인 URL 조회 */
  static getSigninUrl = asyncHandler(async (req: Request, res: Response) => {
    const provider = req.params.provider as string;

    if (!OAuthStrategyFactory.isValidProvider(provider)) {
      throw new BadRequestError(`지원하지 않는 OAuth 제공자입니다: ${provider}`);
    }

    const url = AuthService.getSigninUrl(provider);
    return successResponse(res, 200, { url });
  });

  /** 이메일/비밀번호 로그인 */
  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    return successResponse(res, 200, result, '로그인 성공');
  });
}

export default AuthController;
