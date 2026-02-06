import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse, errorResponse } from '../utils/response';

// JWT 비밀키 (환경변수에서 가져오거나 기본값 사용)
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_key_change_me';

class AuthController {
  static githubLogin = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.query;
    console.log('authorization code: ', code);
    successResponse(res, 200, `엑세스 코드: ${code}`);
  });

  /**
   * 로그인
   * POST /api/auth/login
   */
  static login = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, password } = req.body;

      // 1. 입력값 검증
      if (!email || !password) {
        return errorResponse(
          res,
          400,
          '이메일과 비밀번호를 모두 입력해주세요.'
        );
      }

      // 2. 사용자 조회
      const user = await User.findByEmail(email);
      if (!user) {
        return errorResponse(
          res,
          401,
          '이메일 또는 비밀번호가 올바르지 않습니다.'
        );
      }

      // 3. 비밀번호 검증
      // 주의: user.password 컬럼명은 DB 스키마에 따름 (Note: users table might have password column, handled as string)
      const isMatch = await User.verifyPassword(
        password,
        user.password as string
      );
      if (!isMatch) {
        return errorResponse(
          res,
          401,
          '이메일 또는 비밀번호가 올바르지 않습니다.'
        );
      }

      // 4. JWT 토큰 생성
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: '24h',
      });

      // 5. 응답
      return successResponse(
        res,
        200,
        {
          token,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            avatar_url: user.avatar_url,
          },
        },
        '로그인 성공'
      );
    }
  );
}

export default AuthController;
