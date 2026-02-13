import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import User from '../models/userModel';
import { BadRequestError } from '../errors/AppError';

/**
 * 관리자 서비스 (Facade Pattern)
 *
 * [패턴: Facade Pattern]
 * 관리자 대시보드 / CRUD 비즈니스 로직을 캡슐화합니다.
 *
 * [효과]
 * AdminController가 입력 파싱과 응답 반환만 담당하고,
 * Prisma 쿼리 조합 등은 이 서비스에서 관리합니다.
 */
export class AdminService {
    /** 대시보드 통계 조회 */
    static async getDashboardStats() {
        const [users, routes, sessions, themes] = await Promise.all([
            prisma.user.count(),
            prisma.route.count(),
            prisma.session.count(),
            prisma.theme.count(),
        ]);
        return { users, routes, sessions, themes };
    }

    /** 테마 생성 */
    static async createTheme(data: {
        title: string;
        description: string;
        color_code: string;
        icon_url: string;
    }) {
        return prisma.theme.create({ data });
    }

    /** 테마 삭제 */
    static async deleteTheme(id: number) {
        return prisma.theme.delete({ where: { id } });
    }

    /** 산책 루트 생성 */
    static async createRoute(data: {
        theme_id: number;
        name: string;
        total_distance: number;
        estimated_time: number;
        thumbnail_url: string;
        paths?: string[];
    }) {
        return prisma.route.create({
            data: {
                theme_id: data.theme_id,
                name: data.name,
                total_distance: data.total_distance,
                estimated_time: data.estimated_time,
                thumbnail_url: data.thumbnail_url,
                paths: data.paths || [],
            },
        });
    }

    /** 산책 루트 삭제 */
    static async deleteRoute(id: bigint) {
        return prisma.route.delete({ where: { id } });
    }

    /** 사용자 목록 조회 (관리자용) */
    static async getUsers() {
        const users = await prisma.user.findMany({
            include: { user_info: { select: { email: true } } },
            orderBy: { created_at: 'desc' },
        });

        return users.map((u) => ({
            id: u.id,
            username: u.username,
            avatar_url: u.avatar_url,
            created_at: u.created_at,
            email: u.user_info?.email,
        }));
    }

    /** 사용자 생성 (관리자용) */
    static async createUser(data: {
        username: string;
        email: string;
        password: string;
        avatar_url?: string;
    }) {
        if (!data.username || !data.email || !data.password) {
            throw new BadRequestError('필수 항목이 누락되었습니다.');
        }

        const passwordHash = await bcrypt.hash(data.password, 10);

        return User.upsert({
            username: data.username,
            email: data.email,
            passwordHash,
            avatarUrl:
                data.avatar_url ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
        });
    }

    /** 사용자 삭제 */
    static async deleteUser(id: string) {
        return prisma.user.delete({ where: { id } });
    }
}
