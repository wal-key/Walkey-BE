import { RouteService } from '../services/routeService';
import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../utils/response';

export class WorkRouteController {
  /**
   * 산책 루트 목록 조회 (필터링 지원)
   */
  static async getRecommendedRoutes(req: Request, res: Response) {
    const { theme, time } = req.query;

    const parsedTheme = Number(theme);
    const parsedTime = Number(time);

    if (isNaN(parsedTheme) || isNaN(parsedTime)) {
      return errorResponse(res, 400, '요청 형식이 올바르지 않습니다.');
    }

    const routes = await RouteService.getRecommendedRoutes(
      parsedTheme,
      parsedTime
    );

    return successResponse(res, 200, routes);
  }
}

export default WorkRouteController;
