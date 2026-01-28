import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse, errorResponse } from '../utils/response';
import bcrypt from 'bcrypt';
import User from '../models/userModel';

class AdminController {
    /**
     * 대시보드 통계 조회
     */
    static getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
        const [usersCount, routesCount, sessionsCount, themesCount] = await Promise.all([
            prisma.user.count(),
            prisma.route.count(),
            prisma.session.count(),
            prisma.theme.count()
        ]);

        return successResponse(res, 200, {
            users: usersCount,
            routes: routesCount,
            sessions: sessionsCount,
            themes: themesCount
        }, '대시보드 통계 조회 성공');
    });

    // --- 테마 관리 ---
    static createTheme = asyncHandler(async (req: Request, res: Response) => {
        const { title, description, color_code, icon_url } = req.body;
        const result = await prisma.theme.create({
            data: { title, description, color_code, icon_url }
        });
        return successResponse(res, 201, result, '테마 생성 성공');
    });

    static deleteTheme = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        await prisma.theme.delete({
            where: { id: parseInt(id as string) }
        });
        return successResponse(res, 200, null, '테마 삭제 성공');
    });

    // --- 루트 관리 ---
    static createRoute = asyncHandler(async (req: Request, res: Response) => {
        const { theme_id, name, total_distance, estimated_time, thumbnail_url, paths } = req.body;
        const result = await prisma.route.create({
            data: {
                theme_id: theme_id ? parseInt(theme_id) : null,
                name,
                total_distance: total_distance ? parseFloat(total_distance) : null,
                estimated_time,
                thumbnail_url,
                paths: paths || []
            }
        });
        return successResponse(res, 201, result, '산책 루트 생성 성공');
    });

    static deleteRoute = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        await prisma.route.delete({
            where: { id: BigInt(id as string) }
        });
        return successResponse(res, 200, null, '산책 루트 삭제 성공');
    });

    // --- 사용자 관리 ---
    static getUsers = asyncHandler(async (req: Request, res: Response) => {
        const users = await prisma.user.findMany({
            include: { user_info: { select: { email: true } } },
            orderBy: { created_at: 'desc' }
        });

        const formattedUsers = users.map(u => ({
            id: u.id,
            username: u.username,
            avatar_url: u.avatar_url,
            created_at: u.created_at,
            email: u.user_info?.email
        }));

        return successResponse(res, 200, formattedUsers, '사용자 목록 조회 성공');
    });

    static createUser = asyncHandler(async (req: Request, res: Response) => {
        const { username, email, password, avatar_url } = req.body;

        if (!username || !email || !password) {
            return errorResponse(res, 400, '필수 항목이 누락되었습니다.');
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email,
            passwordHash,
            avatar_url: avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
        });

        return successResponse(res, 201, newUser, '사용자 생성 성공');
    });

    static deleteUser = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        // User delete will cascade to UserInfo if onDelete: Cascade is set in schema
        await prisma.user.delete({
            where: { id: id as string }
        });
        return successResponse(res, 200, null, '사용자 삭제 성공');
    });
}

export default AdminController;
