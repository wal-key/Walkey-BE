"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("./config"));
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
// 보안 헤더 설정
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "dapi.kakao.com", "*.kakao.com"],
            scriptSrcAttr: ["'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "*.kakao.com", "*.daumcdn.net", "t1.daumcdn.net", "map.daumcdn.net"],
            connectSrc: ["'self'", "*.kakao.com"],
        },
    },
}));
// CORS 설정
app.use((0, cors_1.default)({
    origin: config_1.default.cors.allowedOrigins,
    credentials: true,
}));
// Body 파싱 미들웨어
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// 정적 파일 제공 (public 폴더)
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// 요청 로깅 (개발 환경)
if (config_1.default.server.env === 'development') {
    app.use((req, res, next) => {
        console.log(`📝 ${req.method} ${req.path}`);
        next();
    });
}
// API 라우트
app.use('/api', routes_1.default);
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
app.use(errorHandler_1.notFound);
// 전역 에러 핸들러
app.use(errorHandler_1.errorHandler);
exports.default = app;
