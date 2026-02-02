import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse, errorResponse } from '../utils/response';
import User from '../models/userModel';
import bcrypt from 'bcrypt';

class UserController {
  /**
   * 사용자 정보 조회
   */
  static getUserByUsername = asyncHandler(
    async (req: Request, res: Response) => {
      const username = req.params.username as string;
      const user = await User.findByUsername(username);

      if (!user) {
        return errorResponse(res, 404, '사용자를 찾을 수 없습니다.');
      }

      return successResponse(res, 200, user, '사용자 조회 성공');
    }
  );

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

    // Convert BigInt IDs to string for JSON serialization
    const formattedSessions = sessions.map((s: any) => ({
      ...s,
      id: s.id.toString(),
      route_id: s.route_id?.toString(),
    }));

    return successResponse(res, 200, formattedSessions, '산책 내역 조회 성공');
  });

  //로그임
  static signin = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    //검증 절차
    //이메일 검증
    if (!email || typeof email !== 'string') {
      errorResponse(res, 400, '아이디 또는 비밀번호가 올바르지 않습니다.');
      return;
    }
    const userInfo = await prisma.userInfo.findUnique({
      where: { email },
    });
    //비번 검증
    if (!password || password !== userInfo?.password) {
      errorResponse(res, 400, '아이디 또는 비밀번호가 올바르지 않습니다.');
      return;
    }

    successResponse(
      res,
      200,
      `${userInfo?.email}님 성공적으로 로그인되었습니다.`
    );
  });

  /**
   * 회원 가입
   */
  static signup = asyncHandler(async (req: Request, res: Response) => {
    const { username, email, password, avatar_url } = req.body;

    // 1. 중복 확인
    const [existingEmail, existingUsername] = await Promise.all([
      prisma.userInfo.findUnique({ where: { email } }),
      prisma.user.findFirst({ where: { username } }),
    ]);

    if (existingEmail) {
      return errorResponse(res, 400, '이미 가입된 이메일입니다.');
    }

    if (existingUsername) {
      return errorResponse(res, 400, '이미 사용 중인 사용자 이름입니다.');
    }

    // 2. 비밀번호 해싱
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. 사용자 생성
    const newUser = await User.create({
      username,
      avatar_url:
        avatar_url ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      email,
      passwordHash,
    });

    return successResponse(res, 201, newUser, '회원가입 성공');
  });
}

export default UserController;
