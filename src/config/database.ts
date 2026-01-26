import { Pool } from 'pg';
import config from './index';

// PostgreSQL 연결 풀 생성
const pool = new Pool({
    connectionString: config.database.url,
    ssl: {
        rejectUnauthorized: false, // Supabase는 SSL을 사용합니다
    },
});

// 연결 테스트
pool.on('connect', () => {
    console.log('✅ PostgreSQL 데이터베이스에 연결되었습니다.');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL 연결 오류:', err);
});

export default pool;
