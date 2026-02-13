import axios from 'axios';
import config from '../config';

export interface LatLng {
  lat: number;
  lng: number;
}

export class TmapClient {
  /**
   * 경유 지점 배열을 받아
   * 각 지점 사이의 보행자 경로를 조회하고,
   * 중복 좌표를 제거하여 하나의 경로로 합쳐 반환한다.
   * @param {LatLng} points
   */
  static async getPedestrianRoute(points: LatLng[]) {
    const detailPath = [];

    if (!Array.isArray(points) || points.length < 2) {
      throw new Error('points 배열이 2개 이상의 LatLng 객체를 반환해야합니다.');
    }

    for (const p of points) {
      if (
        typeof p.lat !== 'number' ||
        typeof p.lng !== 'number' ||
        isNaN(p.lat) ||
        isNaN(p.lng)
      ) {
        throw new Error(`올바르지 않은 LatLng 좌표: ${JSON.stringify(p)}`);
      }
    }

    for (let i = 0; i < points.length - 1; i++) {
      detailPath.push(points[i]);

      const segments = await this.callTmap(points[i], points[i + 1]);

      const middlePoints = segments.length > 2 ? segments.slice(1, -1) : [];
      // 중복 좌표 제거
      for (const point of middlePoints) {
        const lastPoint = detailPath[detailPath.length - 1];
        if (!(lastPoint.lat === point.lat && lastPoint.lng === point.lng)) {
          detailPath.push(point);
        }
      }
    }

    detailPath.push(points[points.length - 1]);
    return detailPath;
  }

  /**
   * Tmap에서 경도 위도를 반환받음.
   * @param {LatLng} start
   * @param {LatLng} end
   */
  private static async callTmap(start: LatLng, end: LatLng): Promise<LatLng[]> {
    const response = await axios.post(
      'https://apis.openapi.sk.com/tmap/routes/pedestrian',
      {
        startX: start.lng,
        startY: start.lat,
        endX: end.lng,
        endY: end.lat,
        startName: 'start',
        endName: 'end',
        reqCoordType: 'WGS84GEO',
        resCoordType: 'WGS84GEO',
      },
      {
        headers: {
          appKey: config.external.tmapApiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.features
      .filter((f: any) => f.geometry.type === 'LineString')
      .flatMap((f: any) =>
        f.geometry.coordinates.map((coord: number[]) => ({
          lat: coord[1],
          lng: coord[0],
        }))
      );
  }
}
