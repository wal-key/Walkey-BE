import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/response';

/**
 * 데이터베이스 컨트롤러 (레거시 호환용)
 *
 * [참고]
 * 데이터베이스 연결 테스트 및 레거시 조회 API를 제공합니다.
 * asyncHandler + AppError 패턴으로 통일하여 수동 try-catch를 제거했습니다.
 */
class DatabaseController {
  /** 데이터베이스 연결 테스트 */
  static testConnection = asyncHandler(async (req: Request, res: Response) => {
    await prisma.$queryRaw`SELECT 1`;
    return successResponse(res, 200, null, '데이터베이스 연결 성공');
  });

  /** 전체 사용자 목록 조회 (Legacy) */
  static getUsers = asyncHandler(async (req: Request, res: Response) => {
    const result = await prisma.user.findMany({
      include: { user_info: { select: { email: true } } },
      orderBy: { created_at: 'desc' },
      take: 10,
    });
    return successResponse(res, 200, result, '사용자 목록 조회 성공');
  });

  /** 전체 테마 목록 조회 (Legacy) */
  static getThemes = asyncHandler(async (req: Request, res: Response) => {
    const result = await prisma.theme.findMany({ orderBy: { id: 'asc' } });
    return successResponse(res, 200, result, '테마 목록 조회 성공');
  });

  /** 전체 루트 목록 조회 (Legacy) */
  static getRoutes = asyncHandler(async (req: Request, res: Response) => {
    const result = await prisma.route.findMany({ orderBy: { id: 'asc' } });
    const formatted = result.map((r) => ({ ...r, id: r.id.toString() }));
    return successResponse(res, 200, formatted, '루트 목록 조회 성공');
  });

  /** 전체 세션 목록 조회 (Legacy) */
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

  /** 전체 게시글 목록 조회 (Legacy) */
  static getPosts = asyncHandler(async (req: Request, res: Response) => {
    const result =
      await prisma.$queryRaw`SELECT * FROM public."community_posts" LIMIT 10`;
    return successResponse(res, 200, result, '게시글 목록 조회 성공');
  });
}

export default DatabaseController;
