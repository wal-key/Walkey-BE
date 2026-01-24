const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const config = require('./config');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// 보안 헤더 설정
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "dapi.kakao.com", "*.kakao.com"],
                imgSrc: ["'self'", "data:", "*.kakao.com", "*.daumcdn.net", "t1.daumcdn.net", "map.daumcdn.net"],
                connectSrc: ["'self'", "*.kakao.com"],
            },
        },
    })
);

// CORS 설정
app.use(cors({
    origin: config.cors.allowedOrigins,
    credentials: true,
}));

// Body 파싱 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공 (public 폴더)
app.use(express.static(path.join(__dirname, '../public')));

// 요청 로깅 (개발 환경)
if (config.server.env === 'development') {
    app.use((req, res, next) => {
        console.log(`📝 ${req.method} ${req.path}`);
        next();
    });
}

// API 라우트
app.use('/api', routes);

// Kakao Map API Key 제공 API
app.get('/api/config/kakao', (req, res) => {
    res.json({
        success: true,
        apiKey: process.env.KAKAO_API_KEY
    });
});

// 루트 경로
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Walkey API 서버에 오신 것을 환영합니다! 🚶‍♂️',
        version: '1.0.0',
    });
});

// 404 에러 핸들러
app.use(notFound);

// 전역 에러 핸들러
app.use(errorHandler);

module.exports = app;
