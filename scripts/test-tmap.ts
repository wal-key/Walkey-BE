// scripts/test-tmap.ts
import axios from 'axios';

async function testTmapAPI() {
  try {
    console.log('🧪 Tmap API 테스트 시작...\n');

    const response = await axios.post(
      'https://apis.openapi.sk.com/tmap/routes/pedestrian',
      {
        startX: 126.92365,
        startY: 37.55677,
        endX: 126.92432,
        endY: 37.55279,
        startName: '출발지',
        endName: '도착지',
        reqCoordType: 'WGS84GEO',
        resCoordType: 'WGS84GEO',
      },
      {
        headers: {
          appKey: process.env.TMAP_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ API 호출 성공!\n');

    const coordinates = response.data.features
      .filter((f: any) => f.geometry.type === 'LineString')
      .flatMap((f: any) =>
        f.geometry.coordinates.map((coord: number[]) => ({
          lng: coord[0],
          lat: coord[1],
        }))
      );

    console.log(`📍 총 좌표 개수: ${coordinates.length}개\n`);
    // console.log('🎯 시작 좌표:', coordinates[0]);
    // console.log('🏁 끝 좌표:', coordinates[coordinates.length - 1]);
    coordinates.forEach((coord, index) => {
      console.log(`${index + 1}:`, coord);
    });
  } catch (error: any) {
    console.error('❌ API 호출 실패:\n');
    console.error(error.response?.data || error.message);
  }
}

testTmapAPI();
