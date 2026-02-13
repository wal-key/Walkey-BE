import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import { validate as uuidValidate } from 'uuid';
import User from '../models/userModel';
import {
    BadRequestError,
    NotFoundError,
    ConflictError,
} from '../errors/AppError';
import { SessionSummary } from '../types';

/**
 * 사용자 서비스 (Facade Pattern)
 *
 * [패턴: Facade Pattern]
 * 사용자 관련 비즈니스 로직(프로필 조회, 세션 관리, 회원가입)을
 * 컨트롤러에서 분리하여 서비스 레이어에 캡슐화합니다.
 *
 * [효과]
 * 1. 컨트롤러는 입력 파싱 → 서비스 호출 → 응답 반환만 담당
 * 2. 비즈니스 로직 변경이 서비스 내부에서만 이루어짐
 * 3. 복잡한 쿼리 조합(세션 통계 등)을 한 곳에서 관리
 */
export class UserService {
    /** 사용자명으로 사용자 조회 */
    static async findByUsername(username: string) {
        if (!username || username.trim() === '') {
            throw new BadRequestError(
                '요청을 처리할 수 없습니다. 요청 형식이 올바르지 않습니다.'
            );
        }

        const user = await User.findByUsername(username);
        if (!user) {
            throw new NotFoundError('요청하신 사용자를 찾을 수 없습니다.');
        }

        return user;
    }

    /** 산책 세션 생성 */
    static async createSession(userId: string, routeId: bigint) {
        if (!userId || !routeId || !uuidValidate(userId)) {
            throw new BadRequestError('필수 요청 값이 누락되었습니다.');
        }

        const validUser = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!validUser) {
            throw new NotFoundError('존재하지 않는 사용자 입니다.');
        }

        const hasSession = await prisma.session.findFirst({
            where: {
                user_id: userId,
                end_time: { equals: null },
            },
        });
        if (hasSession) {
            throw new ConflictError('사용자 세션이 이미 존재합니다.');
        }

        return prisma.session.create({
            data: { user_id: userId, route_id: routeId },
        });
    }

    /** 사용자 산책 내역 조회 (통계 포함) */
    static async getUserSessions(username: string) {
        const user = await User.findByUsername(username);
        if (!user) {
            throw new NotFoundError('사용자를 찾을 수 없습니다.');
        }

        const sessions = await User.findSessionsByUserId(user.id);

        // 세션 통계 계산
        const summary: SessionSummary = {
            totalDistance: 0,
            totalDuration: 0,
            actualDistance: 0,
            actualDuration: 0,
        };

        for (const s of sessions) {
            summary.actualDistance += s.actual_distance;
            summary.actualDuration += s.actual_duration;
            summary.totalDistance += s.route.total_distance;
            summary.totalDuration += s.route.estimated_time;
        }

        // BigInt → string 변환 (JSON 직렬화 호환)
        const formattedSessions = sessions.map((s: any) => ({
            ...s,
            id: s.id.toString(),
            route_id: s.route_id?.toString(),
        }));

        return { sessionInfo: summary, sessions: formattedSessions };
    }

    /** 이메일/비밀번호 로그인 */
    static async signin(email: string, password: string) {
        if (!email || typeof email !== 'string') {
            throw new BadRequestError('아이디 또는 비밀번호가 올바르지 않습니다.');
        }

        const userInfo = await prisma.userInfo.findUnique({
            where: { email },
        });
        if (!userInfo) {
            throw new NotFoundError('회원정보가 잘못 되었습니다.');
        }

        if (!password || password !== userInfo.password) {
            throw new BadRequestError('아이디 또는 비밀번호가 올바르지 않습니다.');
        }

        return userInfo;
    }

    /** 회원 가입 */
    static async signup(
        username: string,
        email: string,
        password: string,
        avatarUrl?: string
    ) {
        // 중복 확인
        const [existingEmail, existingUsername] = await Promise.all([
            prisma.userInfo.findUnique({ where: { email } }),
            prisma.user.findFirst({ where: { username } }),
        ]);

        if (existingEmail) {
            throw new ConflictError('이미 가입된 이메일입니다.');
        }
        if (existingUsername) {
            throw new ConflictError('이미 사용 중인 사용자 이름입니다.');
        }

        // 비밀번호 해싱
        const passwordHash = await bcrypt.hash(password, 10);

        return User.upsert({
            username,
            avatarUrl:
                avatarUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
            email,
            passwordHash,
        });
    }
}
