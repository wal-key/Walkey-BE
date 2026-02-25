import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse, errorResponse } from '../utils/response';
import { supabase } from '../config/supabase';

class UserSessionController {
  /**
   * 사용자의 산책 기록 수정
   * GET /api/users/sessions
   */
  static updateUserSession = asyncHandler(
    async (req: Request, res: Response) => {
      const { session_id, end_time, actual_distance, actual_duration } =
        req.body;
      const { data, error } = await supabase
        .from('sessions')
        .update({
          end_time,
          actual_distance,
          actual_duration,
        })
        .eq('id', session_id)
        .select()
        .single();

      if (error) {
        console.error(error);
        return errorResponse(res, 500, '세션 정보 업데이트 실패');
      }
      return successResponse(res, 200, data, '성공적으로 수정이 되었습니다.');
    }
  );

  /**
   * 사용자의 모든 산책 기록 조회
   * GET /api/users/sessions
   */
  static getUserSessions = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return errorResponse(res, 401, '인증 정보가 없습니다.');
    }

    // 1. 유저 존재 여부 확인
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return errorResponse(res, 404, '사용자를 찾을 수 없습니다.');
    }

    // 2. 산책 기록(Sessions) 조회 (Routes 정보 포함)
    const sessions = await prisma.session.findMany({
      where: { user_id: userId },
      include: {
        route: true, // routes 테이블의 모든 컬럼 포함
      },
      orderBy: {
        start_time: 'desc', // 최신순 정렬
      },
    });

    return successResponse(res, 200, sessions, '산책 기록 조회 성공');
  });
}

export default UserSessionController;
