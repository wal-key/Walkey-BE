# Walkey - 산책로 추천 웹 서비스

산책 루트를 생성하고 추천해주는 웹 서비스입니다. Express, Supabase, 카카오맵 API를 활용합니다.

## 🛠 기술 스택

- **Backend**: Node.js, Express
- **Database**: PostgreSQL (Supabase)
- **Map API**: Kakao Map API
- **Frontend**: HTML, CSS, JavaScript

## 📁 프로젝트 구조

```
walkey/
├── database/                # 데이터베이스 관련 파일
│   └── schema.sql          # 데이터베이스 스키마 정의
│
├── public/                 # 프론트엔드 정적 파일
│   ├── index.html         # 메인 HTML 페이지
│   ├── css/
│   │   └── style.css      # 스타일시트
│   └── js/
│       └── app.js         # 프론트엔드 JavaScript
│
├── src/                    # 백엔드 소스 코드
│   ├── config/            # 설정 파일
│   │   ├── index.js       # 환경 변수 설정
│   │   ├── database.js    # PostgreSQL 연결 설정
│   │   └── supabase.js    # Supabase 클라이언트 설정
│   │
│   ├── controllers/       # 컨트롤러 (요청 처리)
│   │   └── databaseController.js  # 데이터베이스 테스트 컨트롤러
│   │
│   ├── middleware/        # 미들웨어
│   │   ├── errorHandler.js  # 에러 핸들링
│   │   └── validate.js      # 유효성 검사
│   │
│   ├── models/            # 데이터 모델
│   │
│   ├── routes/            # API 라우트
│   │   └── index.js       # 라우트 정의
│   │
│   ├── services/          # 비즈니스 로직
│   │
│   ├── utils/             # 유틸리티 함수
│   │   └── response.js    # 응답 포맷팅
│   │
│   ├── app.js             # Express 앱 설정
│   └── server.js          # 서버 진입점
│
├── .env                   # 환경 변수 (gitignore에 포함)
├── .gitignore            # Git 제외 파일
├── package.json          # 프로젝트 의존성
└── README.md             # 프로젝트 문서
```

### 폴더별 설명

#### `database/`
- 데이터베이스 스키마와 관련 SQL 파일을 저장합니다.
- `schema.sql`: 테이블 구조 정의 (user, themes, walk_routes, walk_sessions, community_posts, route_points)

#### `public/`
- 프론트엔드 정적 파일을 저장합니다.
- Express의 `express.static` 미들웨어를 통해 제공됩니다.
- 데이터베이스 연결 테스트 및 데이터 조회 UI를 포함합니다.

#### `src/config/`
- 애플리케이션 설정 파일들을 관리합니다.
- 환경 변수, 데이터베이스 연결, Supabase 클라이언트 설정 등

#### `src/controllers/`
- HTTP 요청을 처리하고 응답을 반환하는 컨트롤러 함수들
- 비즈니스 로직은 services 폴더로 분리하는 것을 권장합니다.

#### `src/middleware/`
- Express 미들웨어 함수들
- 에러 핸들링, 인증, 유효성 검사 등

#### `src/models/`
- 데이터베이스 테이블과 상호작용하는 모델 클래스/함수
- ORM 또는 쿼리 빌더 패턴 사용 가능

#### `src/routes/`
- API 엔드포인트 정의
- 각 리소스별로 라우터를 분리하여 관리

#### `src/services/`
- 비즈니스 로직을 처리하는 서비스 레이어
- 컨트롤러와 모델 사이의 중간 계층

#### `src/utils/`
- 재사용 가능한 유틸리티 함수들


#### 프론트엔드에 API 키 적용

`public/index.html` 파일에서 다음 주석을 해제하고 API 키를 입력합니다:

```html
<!-- 주석 해제 -->
<script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_API_KEY"></script>
```

`public/js/app.js` 파일의 `initKakaoMap()` 함수에서 주석 처리된 코드를 활성화합니다.

### 5. 서버 실행

#### 개발 모드 (nodemon 사용)
```bash
npm run dev
```

#### 프로덕션 모드
```bash
npm start
```

서버가 성공적으로 시작되면 다음 주소에서 접속할 수 있습니다:
- **프론트엔드**: http://localhost:3000
- **API**: http://localhost:3000/api

## 📡 API 엔드포인트

### 기본 엔드포인트
- `GET /` - 서버 상태 확인
- `GET /api/health` - API 헬스 체크

### 데이터베이스 테스트
- `GET /api/db/test` - 데이터베이스 연결 테스트
- `GET /api/db/tables` - 테이블 목록 조회

### 데이터 조회
- `GET /api/users` - 사용자 목록 조회
- `GET /api/themes` - 테마 목록 조회
- `GET /api/routes` - 산책 루트 목록 조회
- `GET /api/sessions` - 산책 세션 목록 조회
- `GET /api/posts` - 커뮤니티 게시글 목록 조회

## 🗄️ 데이터베이스 스키마

### 테이블 구조

#### `user` - 사용자
- `user_id`: 사용자 ID (Primary Key)
- `email`: 이메일
- `nickname`: 닉네임
- `avatar`: 프로필 이미지
- `created_at`: 생성 시간

#### `themes` - 테마
- `theme_id`: 테마 ID (Primary Key)
- `theme_name`: 테마 이름
- `description`: 설명
- `color_code`: 색상 코드
- `icon_url`: 아이콘 URL

#### `walk_routes` - 산책 루트
- `route_id`: 루트 ID (Primary Key)
- `theme_id`: 테마 ID (Foreign Key)
- `route_name`: 루트 이름
- `total_distance`: 총 거리
- `estimated_time`: 예상 소요 시간
- `thumbnail_url`: 썸네일 URL
- `created_at`: 생성 시간

#### `route_points` - 루트 포인트
- `point_id`: 포인트 ID (Primary Key)
- `route_id`: 루트 ID (Foreign Key)
- `latitude`: 위도
- `longitude`: 경도
- `sequence`: 순서

#### `walk_sessions` - 산책 세션
- `session_id`: 세션 ID (Primary Key)
- `user_id`: 사용자 ID (Foreign Key)
- `route_id`: 루트 ID (Foreign Key)
- `start_time`: 시작 시간
- `end_time`: 종료 시간
- `actual_distance`: 실제 거리
- `actual_duration`: 실제 소요 시간
- `is_liked`: 좋아요 여부

#### `community_posts` - 커뮤니티 게시글
- `post_id`: 게시글 ID (Primary Key)
- `session_id`: 세션 ID (Foreign Key)
- `user_id`: 사용자 ID (Foreign Key)
- `photo_url`: 사진 URL
- `content`: 내용
- `created_at`: 생성 시간

## 🧪 데이터베이스 연결 테스트

1. 서버를 실행합니다: `npm run dev`
2. 브라우저에서 http://localhost:3000 접속
3. "연결 테스트" 버튼을 클릭하여 데이터베이스 연결 확인
4. "테이블 조회" 버튼으로 생성된 테이블 목록 확인
5. 각 데이터 조회 버튼으로 테이블 데이터 확인

## 🔧 추가 설정 사항

### CORS 설정
프론트엔드가 다른 포트에서 실행되는 경우, `.env` 파일의 `ALLOWED_ORIGINS`에 해당 URL을 추가하세요.

### SSL 설정
Supabase는 기본적으로 SSL을 사용합니다. `src/config/database.js`에서 SSL 설정이 활성화되어 있는지 확인하세요.



## 📄 라이선스

ISC

