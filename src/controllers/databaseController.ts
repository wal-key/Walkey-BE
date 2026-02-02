import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse, errorResponse } from '../utils/response';

class DatabaseController {
  /**
   * 데이터베이스 연결 테스트
   */
  static testConnection = asyncHandler(async (req: Request, res: Response) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return successResponse(res, 200, null, '데이터베이스 연결 성공');
    } catch (error) {
      return errorResponse(res, 500, '데이터베이스 연결 실패');
    }
  });

  /**
   * 전체 사용자 목록 조회 (Legacy style)
   */
  static getUsers = asyncHandler(async (req: Request, res: Response) => {
    const result = await prisma.user.findMany({
      include: { user_info: { select: { email: true } } },
      orderBy: { created_at: 'desc' },
      take: 10,
    });
    return successResponse(res, 200, result, '사용자 목록 조회 성공');
  });

  /**
   * 전체 테마 목록 조회 (Legacy style)
   */
  static getThemes = asyncHandler(async (req: Request, res: Response) => {
    const result = await prisma.theme.findMany({
      orderBy: { id: 'asc' },
    });
    return successResponse(res, 200, result, '테마 목록 조회 성공');
  });

  /**
   * 전체 루트 목록 조회 (Legacy style)
   */
  static getRoutes = asyncHandler(async (req: Request, res: Response) => {
    const result = await prisma.route.findMany({
      orderBy: { id: 'asc' },
    });
    const formatted = result.map((r) => ({ ...r, id: r.id.toString() }));
    return successResponse(res, 200, formatted, '루트 목록 조회 성공');
  });

  /**
   * 전체 세션 목록 조회 (Legacy style)
   */
  static getSessions = asyncHandler(async (req: Request, res: Response) => {
    const result = await prisma.session.findMany({
      orderBy: { created_at: 'desc' },
    });
    const formatted = result.map((s) => ({
      ...s,
      id: s.id.toString(),
      route_id: s.route_id?.toString(),
    }));
    return successResponse(res, 200, formatted, '세션 목록 조회 성공');
  });

  /**
   * 전체 게시글 목록 조회 (Legacy style)
   */
  static getPosts = asyncHandler(async (req: Request, res: Response) => {
    try {
      const result =
        await prisma.$queryRaw`SELECT * FROM public."community_posts" LIMIT 10`;
      return successResponse(res, 200, result, '게시글 목록 조회 성공');
    } catch (error) {
      return successResponse(
        res,
        200,
        [],
        '게시글 테이블이 존재하지 않습니다.'
      );
    }
  });
}

export default DatabaseController;
