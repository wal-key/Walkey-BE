import pool from '../config/database';
import bcrypt from 'bcrypt';

class User {
    /**
     * 이메일로 사용자 조회
     * @param {string} email 
     */
    static async findByEmail(email: string) {
        const query = `
            SELECT * FROM public."users"
            WHERE email = $1
        `;
        const result = await pool.query(query, [email]);
        return result.rows[0];
    }

    /**
     * ID로 사용자 조회
     * @param {number} userId 
     */
    static async findById(userId: number | string) {
        // userId can be string from JWT payload
        const query = `
            SELECT user_id, email, nickname, avatar
            FROM public."users"
            WHERE user_id = $1
        `;
        const result = await pool.query(query, [userId]);
        return result.rows[0];
    }

    /**
     * 비밀번호 검증
     * @param {string} inputPassword - 입력받은 비밀번호
     * @param {string} storedHash - 저장된 해시
     */
    static async verifyPassword(inputPassword: string, storedHash: string) {
        // storedHash가 숫자인 경우 (bigint 타입 컬럼 오용 시) 처리 불가
        if (typeof storedHash !== 'string') {
            console.warn('⚠️ 저장된 비밀번호 해시가 문자열이 아닙니다. 스키마 타입을 확인하세요.');
            return false;
        }
        return await bcrypt.compare(inputPassword, storedHash);
    }
}

export default User;
