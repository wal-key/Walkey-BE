import { RouteModel } from '../models/routeModel';
import { TmapClient } from '../clients/tmapClient';

export class RouteService {
  static async getRecommendedRoutes(theme: number, time: number) {
    const routes = await RouteModel.findRoutesByFilter(theme, time);

    if (!routes.length) return [];

    // 시간이 가장 가까운 순으로 계산
    const sorted = routes.sort(
      (a, b) =>
        Math.abs(a.estimated_time - time) - Math.abs(b.estimated_time - time)
    );

    await this.createDetailPaths(routes.id, sorted);

    // 최대 4개 반환
    return sorted.slice(0, 4);
  }

  /**
   * detailpath가 없는 경로들에 대해 Tmap API 호출 및 업데이트
   * @param {number} routeId
   * @param {any} routes
   */
  private static async createDetailPaths(routeId: number, routes: any[]) {
    for (const [index, route] of routes.entries()) {
      const points = this.parsePathStrings(route.paths);

      try {
        const tmapDetailPaths = await TmapClient.getPedestrianRoute(points);
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
