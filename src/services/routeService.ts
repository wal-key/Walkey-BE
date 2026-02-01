import { RouteModel } from '../models/routeModel';

export class RouteService {
  static async getRecommendedRoutes(theme: number, time: number) {
    const routes = await RouteModel.findRoutesByFilter(theme, time);

    if (!routes.length) return [];

    // 시간이 가장 가까운 순으로 계산
    const sorted = routes.sort(
      (a, b) =>
        Math.abs(a.estimated_time - time) - Math.abs(b.estimated_time - time)
    );

    // 최대 4개 반환
    return sorted.slice(0, 4);
  }
}
