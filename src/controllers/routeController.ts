import { RouteService } from '../services/routeService';
import { Request, Response } from 'express';

export class RouteController {
  /**
   * 산책 루트 목록 조회 (필터링 지원)
   */
  static async getRecommendedRoutes(req: Request, res: Response) {
    const { theme, time } = req.query;

    const parsedTheme = Number(theme);
    const parsedTime = Number(time);

    if (isNaN(parsedTheme) || isNaN(parsedTime)) {
      return res.status(400).json({
        message: '요청을 처리할 수 없습니다. 요청 형식이 올바르지 않습니다.',
      });
    }

    const routes = await RouteService.getRecommendedRoutes(
      parsedTheme,
      parsedTime
    );

    return res.status(200).json(routes);
  }
}

export default RouteController;
