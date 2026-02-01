import { RouteService } from '../services/routeService';
import { Request, Response } from 'express';

export class RouteController {
  /**
   * 산책 루트 목록 조회 (필터링 지원)
   */
  static async getRecommendedRoutes(req: Request, res: Response) {
    const { theme, time } = req.query;

    const routes = await RouteService.getRecommendedRoutes(
      Number(theme),
      Number(time)
    );

    return res.status(200).json(routes);
  }
}

export default RouteController;
