import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/response';
import { AdminService } from '../services/adminService';

/**
 * 관리자 컨트롤러 (Thin Controller Pattern)
 *
 * [패턴: Thin Controller]
 * 관리자 CRUD 비즈니스 로직을 AdminService에 완전히 위임합니다.
 * 컨트롤러는 요청 파싱 → 서비스 호출 → 응답 반환만 담당합니다.
 */
class AdminController {
  /** 대시보드 통계 조회 */
  static getDashboardStats = asyncHandler(
    async (req: Request, res: Response) => {
      const stats = await AdminService.getDashboardStats();
      return successResponse(res, 200, stats, '대시보드 통계 조회 성공');
    }
  );

  // ─── 테마 관리 ─────────────────────────────────────────────

  /** 테마 생성 */
  static createTheme = asyncHandler(async (req: Request, res: Response) => {
    const result = await AdminService.createTheme(req.body);
    return successResponse(res, 201, result, '테마 생성 성공');
  });

  /** 테마 삭제 */
  static deleteTheme = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await AdminService.deleteTheme(parseInt(id));
    return successResponse(res, 200, null, '테마 삭제 성공');
  });

  // ─── 루트 관리 ─────────────────────────────────────────────

  /** 산책 루트 생성 */
  static createRoute = asyncHandler(async (req: Request, res: Response) => {
    const result = await AdminService.createRoute(req.body);
    return successResponse(res, 201, result, '산책 루트 생성 성공');
  });

  /** 산책 루트 삭제 */
  static deleteRoute = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await AdminService.deleteRoute(BigInt(id));
    return successResponse(res, 200, null, '산책 루트 삭제 성공');
  });

  // ─── 사용자 관리 ───────────────────────────────────────────

  /** 사용자 목록 조회 */
  static getUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await AdminService.getUsers();
    return successResponse(res, 200, users, '사용자 목록 조회 성공');
  });

  /** 사용자 생성 */
  static createUser = asyncHandler(async (req: Request, res: Response) => {
    const newUser = await AdminService.createUser(req.body);
    return successResponse(res, 201, newUser, '사용자 생성 성공');
  });

  /** 사용자 삭제 */
  static deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await AdminService.deleteUser(id);
    return successResponse(res, 200, null, '사용자 삭제 성공');
  });
}

export default AdminController;
