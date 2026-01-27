import app from './app';
import config from './config';
import pool from './config/database';

const PORT = config.server.port;

// 서버 시작
const server = app.listen(PORT, async () => {
    console.log('🚀 ========================================');
    console.log(`🚀 Walkey API 서버가 시작되었습니다!`);
    console.log(`🚀 환경: ${config.server.env}`);
    console.log(`🚀 포트: ${PORT}`);
    console.log(`🚀 URL: http://localhost:${PORT}`);
    console.log('🚀 ========================================');

    // 데이터베이스 연결 테스트
    try {
        await pool.query('SELECT NOW()');
        console.log('✅ 데이터베이스 연결 성공');
    } catch (error: any) {
        console.error('❌ 데이터베이스 연결 실패:', error.message);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM 신호를 받았습니다. 서버를 종료합니다...');
    server.close(() => {
        console.log('✅ 서버가 정상적으로 종료되었습니다.');
        pool.end();
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('👋 SIGINT 신호를 받았습니다. 서버를 종료합니다...');
    server.close(() => {
        console.log('✅ 서버가 정상적으로 종료되었습니다.');
        pool.end();
        process.exit(0);
    });
});
