import { Request, Response } from 'express';
import { RouteService } from '../services/routeService';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/response';
import { BadRequestError } from '../errors/AppError';

/**
 * 산책 루트 컨트롤러 (Thin Controller Pattern)
 *
 * [패턴: Thin Controller]
 * RouteService에 비즈니스 로직을 위임하고,
 * asyncHandler를 통해 에러를 전역 핸들러에서 처리합니다.
 *
 * [변경사항]
 * 기존: asyncHandler 미사용, 에러 핸들링 누락 가능
 * 현재: asyncHandler 래핑 + AppError 기반 입력 검증
 */
class RouteController {
  /** 산책 루트 목록 조회 (필터링 지원) */
  static getRecommendedRoutes = asyncHandler(
    async (req: Request, res: Response) => {
      const { theme, time } = req.query;

      const parsedTheme = Number(theme);
      const parsedTime = Number(time);

      if (isNaN(parsedTheme) || isNaN(parsedTime)) {
        throw new BadRequestError('요청 형식이 올바르지 않습니다.');
      }

      const routes = await RouteService.getRecommendedRoutes(
        parsedTheme,
        parsedTime
      );
      return successResponse(res, 200, routes);
    }
  );
}

export default RouteController;
