import prisma from '../lib/prisma';

export class RouteModel {
  /**
   * 테마, 소요시간에 맞는 산책 경로 목록을 조회한다.
   * 추천 경로를 제공하기 위한 API
   * @param {Number} theme
   * @param {number} time
   * @Returns {Array} 루트 객체 배열
   */
  static async findRoutesByFilter(theme: number, time: number) {
    const result = await prisma.route.findMany({
      where: {
        theme_id: theme,
        estimated_time: {
          gte: time,
          lte: time + 10,
        },
      },
      select: {
        id: true,
        name: true,
        estimated_time: true,
        total_distance: true,
        thumbnail_url: true,
        paths: true,
        detail_paths: true,
      },
    });

    if (!result.length) return [];

    return result;
  }

  /**
   *
   * @param {Number} routeId
   * @param {object} detailPaths
   */
  static async updateDetailPaths(routeId: number, detailPaths: []) {
    const save = await prisma.route.update({
      where: {
        id: routeId,
      },
      data: {
        detail_paths: JSON.stringify(detailPaths),
      },
    });

    return save;
  }
}
