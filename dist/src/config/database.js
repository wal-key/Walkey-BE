"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const index_1 = __importDefault(require("./index"));
// PostgreSQL 연결 풀 생성
const pool = new pg_1.Pool({
    connectionString: index_1.default.database.url,
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
exports.default = pool;
