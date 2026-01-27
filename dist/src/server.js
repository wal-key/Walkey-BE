"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config"));
const database_1 = __importDefault(require("./config/database"));
const PORT = config_1.default.server.port;
// 서버 시작
const server = app_1.default.listen(PORT, async () => {
    console.log('🚀 ========================================');
    console.log(`🚀 Walkey API 서버가 시작되었습니다!`);
    console.log(`🚀 환경: ${config_1.default.server.env}`);
    console.log(`🚀 포트: ${PORT}`);
    console.log(`🚀 URL: http://localhost:${PORT}`);
    console.log('🚀 ========================================');
    // 데이터베이스 연결 테스트
    try {
        await database_1.default.query('SELECT NOW()');
        console.log('✅ 데이터베이스 연결 성공');
    }
    catch (error) {
        console.error('❌ 데이터베이스 연결 실패:', error.message);
    }
});
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM 신호를 받았습니다. 서버를 종료합니다...');
    server.close(() => {
        console.log('✅ 서버가 정상적으로 종료되었습니다.');
        database_1.default.end();
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    console.log('👋 SIGINT 신호를 받았습니다. 서버를 종료합니다...');
    server.close(() => {
        console.log('✅ 서버가 정상적으로 종료되었습니다.');
        database_1.default.end();
        process.exit(0);
    });
});
