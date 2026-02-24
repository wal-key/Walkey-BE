import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse, errorResponse } from '../utils/response';
import User from '../models/userModel';
import { validate as uuidValidate } from 'uuid';
import { userService } from '../services/userService';

class UserController {
  /**
   * 사용자 세션 생성
   */
  static createUserSession = asyncHandler(
    async (req: Request, res: Response) => {
      const { user_id, route_id } = req.body;
      if (!user_id || !route_id || !uuidValidate(user_id)) {
        errorResponse(res, 400, '필수 요청 값이 누락되었습니다.');
        return;
      }

      const validUser = await prisma.user.findUnique({
        where: {
          id: user_id,
        },
      });

      if (!validUser) {
        return errorResponse(res, 404, '존재하지 않는 사용자 입니다.');
      }

      const hasSession = await prisma.session.findFirst({
        where: {
          user_id: user_id,
          end_time: {
            equals: null,
          },
        },
      });

      if (hasSession) {
        return errorResponse(res, 409, '사용자 세션이 이미 존재합니다.');
      } else {
        const session = await prisma.session.create({
          data: {
            user_id,
            route_id,
          },
        });
        if (session) {
          successResponse(res, 201, session, '정상적으로 생성되었습니다.');
          return;
        }
      }
    }
  );

  /**
   * 사용자 정보 조회
   */
  static getUserByUsername = asyncHandler(
    async (req: Request, res: Response) => {
      const username = req.params.username as string;

      // 요청 형식 검증
      if (!username || username.trim() === '') {
        return errorResponse(
          res,
          400,
          '요청을 처리할 수 없습니다. 요청 형식이 올바르지 않습니다.'
        );
      }

      const user = await User.findByUsername(username);

      if (!user) {
        return errorResponse(res, 404, '요청하신 사용자를 찾을 수 없습니다');
      }

      return successResponse(res, 200, user, '사용자 조회 성공');
    }
  );

  /**
   * 사용자 정보
   */
  static getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return errorResponse(res, 401, '로그인이 필요합니다.');
    }

    const user = await userService.getCurrentUser(userId);

    if (!user) {
      return errorResponse(res, 404, '사용자를 찾을 수 없습니다.');
    }

    return successResponse(res, 200, {
      user: {
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
      },
    });
  });

  /**
   * 사용자의 산책 내역 조회
   */
  static getUserSessions = asyncHandler(async (req: Request, res: Response) => {
    const username = req.params.username as string;
    const user = await User.findByUsername(username);

    if (!user) {
      return errorResponse(res, 404, '사용자를 찾을 수 없습니다.');
    }

    const sessions = await User.findSessionsByUserId(user.id);

    let actualDistance = 0,
      actualDuration = 0,
      totalDistance = 0,
      totalDuration = 0;

    for (let s of sessions) {
      const { actual_distance, actual_duration } = s;
      const { total_distance, estimated_time } = s.route;
      actualDistance += actual_distance;
      actualDuration += actual_duration;
      totalDistance += total_distance;
      totalDuration += estimated_time;
    }

    // Convert BigInt IDs to string for JSON serialization
    const formattedSessions = sessions.map((s: any) => ({
      ...s,
      id: s.id.toString(),
      route_id: s.route_id?.toString(),
    }));

    return successResponse(
      res,
      200,
      {
        session_info: {
          total_distance: totalDistance,
          total_duration: totalDuration,
          actual_distance: actualDuration,
          actual_duration: actualDuration,
        },
        ...formattedSessions,
      },
      '산책 내역 조회 성공'
    );
  });
}

export default UserController;
