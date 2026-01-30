import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';

class User {
    /**
     * 이메일로 사용자 조회
     * @param {string} email 
     */
    static async findByEmail(email: string) {
        const result = await prisma.userInfo.findUnique({
            where: { email },
            include: { user: true }
        });

        if (!result) return null;

        // Flatten the structure to match previous response
        return {
            ...result.user,
            email: result.email,
            password: result.password
        };
    }

    /**
     * ID로 사용자 조회
     * @param {string} userId 
     */
    static async findById(userId: string) {
        const result = await prisma.user.findUnique({
            where: { id: userId },
            include: { user_info: true }
        });

        if (!result) return null;

        return {
            id: result.id,
            email: result.user_info?.email,
            username: result.username,
            avatar_url: result.avatar_url
        };
    }

    /**
     * 사용자명으로 사용자 조회
     * @param {string} username 
     */
    static async findByUsername(username: string) {
        const result = await prisma.user.findFirst({
            where: { username },
            include: { user_info: true }
        });

        if (!result) return null;

        return {
            id: result.id,
            email: result.user_info?.email,
            username: result.username,
            avatar_url: result.avatar_url,
            created_at: result.created_at
        };
    }

    /**
     * 사용자의 산책 세션 목록 조회
     * @param {string} userId 
     */
    static async findSessionsByUserId(userId: string) {
        return await prisma.session.findMany({
            where: { user_id: userId },
            include: { route: { select: { total_distance: true, estimated_time: true, name: true } } },
            orderBy: { start_time: 'desc' }
        });
    }

    /**
     * 새 사용자 생성 (회원가입)
     * @param userData 
     */
    static async create(userData: { username: string, avatar_url: string, email: string, passwordHash: string }) {
        const result = await prisma.user.create({
            data: {
                username: userData.username,
                avatar_url: userData.avatar_url,
                user_info: {
                    create: {
                        email: userData.email,
                        password: userData.passwordHash
                    }
                }
            },
            include: { user_info: true }
        });

        return {
            id: result.id,
            username: result.username,
            email: result.user_info?.email,
            avatar_url: result.avatar_url
        };
    }

    /**
     * 비밀번호 검증
     * @param {string} inputPassword - 입력받은 비밀번호
     * @param {string} storedHash - 저장된 해시
     */
    static async verifyPassword(inputPassword: string, storedHash: string) {
        if (!storedHash || typeof storedHash !== 'string') {
            console.warn('⚠️ 저장된 비밀번호 해시가 유효하지 않습니다.');
            return false;
        }
        return await bcrypt.compare(inputPassword, storedHash);
    }
}

export default User;
