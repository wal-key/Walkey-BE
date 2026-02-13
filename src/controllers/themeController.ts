import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/response';
import { ThemeService } from '../services/themeService';

/**
 * 테마 컨트롤러 (Thin Controller Pattern)
 *
 * [패턴: Thin Controller]
 * 기존의 try-catch 블록을 제거하고 asyncHandler + AppError로 대체합니다.
 * ThemeService에서 NotFoundError를 throw하면 전역 에러 핸들러가 자동 처리합니다.
 *
 * [변경사항]
 * 기존: try-catch로 수동 에러 핸들링 + Prisma 직접 호출
 * 현재: asyncHandler가 에러를 catch → 전역 에러 핸들러가 AppError 기반 응답 반환
 */
class ThemeController {
  /** 전체 테마 목록 조회 */
  static getThemes = asyncHandler(async (req: Request, res: Response) => {
    const themes = await ThemeService.getAllThemes();
    return successResponse(res, 200, themes, '테마 목록 조회 성공');
  });
}

export default ThemeController;
