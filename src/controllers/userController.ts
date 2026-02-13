import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/response';
import { UserService } from '../services/userService';

/**
 * 사용자 컨트롤러 (Thin Controller Pattern)
 *
 * [패턴: Thin Controller]
 * 모든 비즈니스 로직은 UserService에 위임합니다.
 * 컨트롤러는 요청 파싱과 응답 포맷팅만 담당합니다.
 *
 * [효과]
 * 1. 비즈니스 로직 변경이 UserService에서만 이루어짐
 * 2. AppError를 throw하면 asyncHandler + 전역 에러 핸들러가 자동 처리
 * 3. 컨트롤러 코드가 극도로 간결 (199줄 → ~60줄)
 */
class UserController {
  /** 산책 세션 생성 */
  static createUserSession = asyncHandler(
    async (req: Request, res: Response) => {
      const { user_id, route_id } = req.body;
      const session = await UserService.createSession(user_id, route_id);
      return successResponse(res, 201, session, '정상적으로 생성되었습니다.');
    }
  );

  /** 사용자 정보 조회 */
  static getUserByUsername = asyncHandler(
    async (req: Request, res: Response) => {
      const username = req.params.username as string;
      const user = await UserService.findByUsername(username);
      return successResponse(res, 200, user, '사용자 조회 성공');
    }
  );

  /** 사용자 산책 내역 조회 */
  static getUserSessions = asyncHandler(
    async (req: Request, res: Response) => {
      const username = req.params.username as string;
      const result = await UserService.getUserSessions(username);
      return successResponse(res, 200, result, '산책 내역 조회 성공');
    }
  );

  /** 로그인 */
  static signin = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const userInfo = await UserService.signin(email, password);
    return successResponse(
      res,
      200,
      null,
      `${userInfo.email}님 성공적으로 로그인되었습니다.`
    );
  });

  /** 회원 가입 */
  static signup = asyncHandler(async (req: Request, res: Response) => {
    const { username, email, password, avatar_url } = req.body;
    const newUser = await UserService.signup(
      username,
      email,
      password,
      avatar_url
    );
    return successResponse(res, 201, newUser, '회원가입 성공');
  });
}

export default UserController;
