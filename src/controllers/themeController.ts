import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/response';

class ThemeController {
    /**
     * 전체 테마 목록 조회
     */
    static getThemes = asyncHandler(async (req: Request, res: Response) => {
        const result = await prisma.theme.findMany({
            orderBy: { id: 'asc' }
        });
        return successResponse(res, 200, result, '테마 목록 조회 성공');
    });
}

export default ThemeController;
