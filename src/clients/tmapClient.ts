import axios from 'axios';

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
  // static async getPedestrianRoute(points: LatLng[]) {
  //   const segments: LatLng[][] = [];
  //
  //   for (let i = 0; i < points.length - 1; i++) {
  //     const segment = await this.callTmap(points[i], points[i + 1]);
  //     segments.push(segment);
  //   }
  //
  //   console.log('두번째', segments);
  //
  //   return this.mergeSegments(segments);
  // }
  static async getPedestrianRoute(points: LatLng[]) {
    const detailPath = [];

    for (let i = 0; i < points.length - 1; i++) {
      detailPath.push(points[i]);

      const segments = await this.callTmap(points[i], points[i + 1]);

      // 중복 좌표 제거
      for (const point of segments.slice(1, -1)) {
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
          appKey: process.env.TMAP_API_KEY!,
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

  /**
   * 여러 경로 세그먼트를 하나의 경로로 병합.
   * @param {LatLng} segments
   */
  // private static mergeSegments(segments: LatLng[][]): LatLng[] {
  //   const merged: LatLng[] = [];
  //
  //   segments.forEach((segment, index) => {
  //     if (index === 0) merged.push(...segment);
  //     else merged.push(...segment.slice(1)); // 중복 제거
  //   });
  //
  //   return merged;
  // }
}
