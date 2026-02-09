// API 기본 URL
const API_BASE_URL = 'http://localhost:3000/api';

/**
 * API 요청 헬퍼 함수
 */
async function fetchAPI(endpoint) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API 요청 오류:', error);
    return {
      success: false,
      message: '서버에 연결할 수 없습니다.',
      error: error.message,
    };
  }
}

/**
 * 결과를 화면에 표시하는 함수
 */
function displayResult(elementId, data, isSuccess) {
  const resultBox = document.getElementById(elementId);
  resultBox.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
  resultBox.className = 'result-box ' + (isSuccess ? 'success' : 'error');
  resultBox.style.display = 'block';
}

/**
 * 로딩 표시
 */
function showLoading(elementId) {
  const resultBox = document.getElementById(elementId);
  resultBox.innerHTML = '<div class="loading"></div> 로딩 중...';
  resultBox.className = 'result-box';
  resultBox.style.display = 'block';
}

/**
 * 데이터베이스 연결 테스트
 */
async function testConnection() {
  console.log('👆 연결 테스트 버튼 클릭됨');
  alert('연결 테스트를 시작합니다!'); // 디버깅용 알림
  showLoading('connection-result');
  const data = await fetchAPI('/db/test');
  console.log('📡 서버 응답:', data);
  displayResult('connection-result', data, data.success);
}

/**
 * 테이블 목록 조회
 */
async function getTables() {
  showLoading('tables-result');
  const data = await fetchAPI('/db/tables');
  displayResult('tables-result', data, data.success);
}

/**
 * github 로그인
 */
async function githubLogin() {
  const endpoint = '/';
  const token = await fetchAPI('/users/signin/github');
}

/**
 * 데이터 조회
 */
async function getData(type) {
  showLoading('data-result');
  const data = await fetchAPI(`/${type}`);
  displayResult('data-result', data, data.success);
}

/**
 * 카카오맵 초기화
 */
/**
 * 카카오맵 API 로드 및 초기화
 */
async function loadKakaoMap() {
  try {
    // 1. API 키 가져오기
    const config = await fetchAPI('/config/kakao');
    if (!config.success || !config.apiKey) {
      throw new Error('API 키를 가져올 수 없습니다.');
    }

    // 2. 스크립트 동적 로드
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${config.apiKey}&autoload=false`;
    script.async = true;

    script.onload = () => {
      // 3. 맵 초기화 (autoload=false이므로 load 메서드 사용)
      kakao.maps.load(() => {
        initMap();
      });
    };

    script.onerror = () => {
      throw new Error('카카오맵 스크립트 로드 실패');
    };

    document.head.appendChild(script);
  } catch (error) {
    console.error('❌ 카카오맵 로딩 실패:', error);
    const mapContainer = document.getElementById('map');
    mapContainer.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #ffebee; color: #c62828; padding: 20px; text-align: center;">❌ ${error.message}</div>`;
  }
}

/**
 * 맵 그리기 로직
 */
function initMap() {
  try {
    const container = document.getElementById('map');
    const options = {
      center: new kakao.maps.LatLng(37.5665, 126.978), // 서울 시청 좌표
      level: 3,
    };
    const map = new kakao.maps.Map(container, options);

    // 마커 추가
    const markerPosition = new kakao.maps.LatLng(37.5665, 126.978);
    const marker = new kakao.maps.Marker({
      position: markerPosition,
    });
    marker.setMap(map);

    // 인포윈도우 추가
    const infowindow = new kakao.maps.InfoWindow({
      content: '<div style="padding:5px;font-size:12px;">서울 시청</div>',
    });
    infowindow.open(map, marker);

    console.log('✅ 카카오맵 초기화 성공');
  } catch (error) {
    console.error('❌ 카카오맵 초기화 중 오류:', error);
  }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
  console.log('Walkey 데이터베이스 테스트 페이지 로드됨');
  loadKakaoMap();
});
