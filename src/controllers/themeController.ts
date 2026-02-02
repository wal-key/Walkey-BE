import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse, errorResponse } from '../utils/response';

class ThemeController {
  /**
   * 전체 테마 목록 조회
   */
  static getThemes = asyncHandler(async (req: Request, res: Response) => {
    try {
      const result = await prisma.theme.findMany({
        orderBy: { id: 'asc' },
      });

      // 테마가 하나도 없을 경우
      if (!result || result.length === 0) {
        return errorResponse(res, 404, '해당하는 테마가 없습니다.');
      }

      return successResponse(res, 200, result, '테마 목록 조회 성공');
    } catch (error) {
      // 데이터베이스 오류
      return errorResponse(res, 500, '데이터베이스 오류입니다.');
    }
  });
}

export default ThemeController;
