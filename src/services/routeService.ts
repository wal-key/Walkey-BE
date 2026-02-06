import { RouteModel } from '../models/routeModel';
import { TmapClient } from '../clients/tmapClient';

export class RouteService {
  static async getRecommendedRoutes(themeId: number, walkTime: number) {
    const routes = await RouteModel.findRoutesByFilter(themeId, walkTime);

    if (!routes.length) return [];

    // 시간이 가장 가까운 순으로 계산
    const sorted = routes.sort(
      (a, b) =>
        Math.abs(a.estimated_time - walkTime) -
        Math.abs(b.estimated_time - walkTime)
    );

    const parsedSorted = sorted.map((route) => ({
      ...route,
      paths: RouteService.parsePathStrings(route.paths),
    }));

    await this.createDetailPaths(sorted);

    // 최대 5개 반환
    return parsedSorted.slice(0, 5);
  }

  /**
   * detailpath가 없는 경로들에 대해 Tmap API 호출 및 업데이트
   * @param {any} routes
   */
  private static async createDetailPaths(routes: any[]) {
    for (const [index, route] of routes.entries()) {
      if (route.detail_paths && route.detail_paths.length > 0) {
        continue;
      }

      const points = this.parsePathStrings(route.paths);
      const routeId = route.id;

      try {
        const tmapDetailPaths = await TmapClient.getPedestrianRoute(points);

        await RouteModel.updateDetailPaths(routeId, tmapDetailPaths);
      } catch (error) {
        console.log(`${index}번 경로 Tmap 처리 실패`, error);
      }
    }
  }

  /**
   * string을 json으로 변경
   * @param {string} paths
   */
  private static parsePathStrings(paths: string[]) {
    const result = [];

    for (const [i, p] of paths.entries()) {
      try {
        result.push(JSON.parse(p));
      } catch {
        console.warn(`paths[${i}] JSON 파싱 실패`, p);
      }
    }

    return result;
  }
}
