import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/response';

class RouteController {
    /**
     * 산책 루트 목록 조회 (필터링 지원)
     */
    static getRoutes = asyncHandler(async (req: Request, res: Response) => {
        const { theme_id, duration } = req.query;

        const where: any = {};
        if (theme_id) where.theme_id = parseInt(theme_id as string);
        if (duration) where.estimated_time = { contains: duration as string };

        const result = await prisma.route.findMany({
            where,
            include: { theme: { select: { title: true } } },
            orderBy: { id: 'asc' }
        });

        // Prisma result formatting (BigInt to string for JSON)
        const formattedResult = result.map(route => ({
            ...route,
            id: route.id.toString(),
            theme_title: route.theme?.title
        }));

        return successResponse(res, 200, formattedResult, '루트 목록 조회 성공');
    });
}

export default RouteController;
