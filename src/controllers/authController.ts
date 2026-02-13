import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse, errorResponse } from '../utils/response';
const JWT_SECRET = process.env.JWT_SECRET || '';
class AuthController {
  static getSigninUrl = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { provider } = req.params;
      switch (provider) {
        case 'google':
          return this.getGoogleUrl(req, res, next);
        case 'github':
          return this.getGithubUrl(req, res, next);
        case 'naver':
          return this.getNaverUrl(req, res, next);
        case 'kakao':
        default:
          return this.getKakaoUrl(req, res, next);
      }
    }
  );

  static getGithubUrl = asyncHandler(async (req: Request, res: Response) => {
    const clientId = process.env.AUTH_GITHUB_CLIENT_ID;
    const redirectUri = 'http://localhost:3000/api/auth/callback/github';
    const scope = 'email user:name user:login';

    const url =
      `https://github.com/login/oauth/authorize` +
      `?client_id=${clientId}` +
      `&redirect_uri=${redirectUri}` +
      `&scope=${scope}`;
    res.json({ url });
  });

  static getGoogleUrl = asyncHandler(async (req: Request, res: Response) => {
    const clientId = process.env.AUTH_GOOGLE_CLIENT_ID;
    const scope = 'profile';
    const redirectUri = 'http://localhost:3000/api/auth/callback/google';
    const responseType = 'code';
    const url =
      `https://accounts.google.com/o/oauth2/v2/auth` +
      `?response_type=${responseType}` +
      `&client_id=${clientId}` +
      `&redirect_uri=${redirectUri}` +
      `&scope=${scope}`;
    res.json({ url });
  });

  static getNaverUrl = asyncHandler(async (req: Request, res: Response) => {
    const clientId = process.env.NAVER_CLIENT_ID;
    const redirectUri = 'http://localhost:3000/api/auth/callback/naver';
    const state = Math.random().toString(36).substring(2, 15);
    const responseType = 'code';

    const url =
      `https://nid.naver.com/oauth2.0/authorize` +
      `?response_type=${responseType}` +
      `&client_id=${clientId}` +
      `&redirect_uri=${redirectUri}` +
      `&state=${state}`;
    res.json({ url });
  });

  static getKakaoUrl = asyncHandler(async (req: Request, res: Response) => {
    const clientId = process.env.AUTH_KAKAO_CLIENT_ID;
    const redirectUri = 'http://localhost:3000/api/auth/callback/kakao';
    const responseType = 'code';
    const url =
      `https://kauth.kakao.com/oauth/authorize` +
      `?client_id=${clientId}` +
      `&redirect_uri=${redirectUri}` +
      `&response_type=${responseType}`;
    console.log(url);
    res.json({ url });
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
