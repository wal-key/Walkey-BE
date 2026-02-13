import { asyncHandler } from '../utils/asyncHandler';
import { errorResponse, successResponse } from '../utils/response';
import { NextFunction, Request, Response } from 'express';
import {
  githubOAuth,
  googleOAuth,
  kakaoOAuth,
  naverOAuth,
} from '../services/OAuthService';
import SocialUser from '../models/socialUserModel';
import User from '../models/userModel';
import UserInfo from '../models/userInfoModel';
import { issueJWT } from '../utils/jwtUtils';

const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

class OAuthController {
  static providerHandlers = (): {
    [key: string]: (req: Request, res: Response, next: NextFunction) => void;
  } => {
    return {
      google: OAuthController.googleSignin,
      github: OAuthController.githubSignin,
      naver: OAuthController.naverSignin,
      kakao: OAuthController.kakaoSignin,
    };
  };
  static handlerOauthCallback = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { provider } = req.params;
      const handler = this.providerHandlers()[provider as string];

      if (!handler) {
        return errorResponse(
          res,
          400,
          `지원하지 않는 OAuth 제공자입니다: ${provider}`
        );
      }

      await handler(req, res, next);
    }
  );

  static googleSignin = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.query;
    //OAuth token 요청
    const token = await googleOAuth.getToken(code as string);
    if (!token) {
      return errorResponse(res, 500, '소셜 로그인 토큰 에러가 발생했습니다.');
    }

    //OAuth 프로필 요청
    const profile = await googleOAuth.getProfile(token);
    if (!profile) {
      return errorResponse(res, 500, '소셜 로그인 프로필 에러가 발생했습니다.');
    }
    await this.completeOAuthSignin(res, profile);
  });

  static githubSignin = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.query;
    //OAuth token 요청
    const token = await githubOAuth.getToken(code as string);

    if (!token) {
      return errorResponse(res, 500, '소셜 로그인 토큰 에러가 발생했습니다.');
    }

    //OAuth 프로필 요청
    const profile = await githubOAuth.getProfile(token);
    if (!profile) {
      return errorResponse(res, 500, '소셜 로그인 프로필 에러가 발생했습니다.');
    }

    await this.completeOAuthSignin(res, profile);
  });

  static naverSignin = asyncHandler(async (req: Request, res: Response) => {
    const { code, state } = req.query;

    //OAuth token 요청
    const token = await naverOAuth.getToken(code as string, state as string);
    if (!token) {
      return errorResponse(res, 500, '소셜 로그인 토큰 에러가 발생했습니다.');
    }

    //OAuth 프로필 요청
    const profile = await naverOAuth.getProfile(token);
    if (!profile) {
      return errorResponse(res, 500, '소셜 로그인 프로필 에러가 발생했습니다.');
    }

    await this.completeOAuthSignin(res, profile);
  });

  static kakaoSignin = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.query;
    const token = await kakaoOAuth.getToken(code as string);
    if (!token) {
      return errorResponse(res, 500, '소셜 로그인 토큰 에러가 발생했습니다.');
    }
    const profile = await kakaoOAuth.getProfile(token);
    if (!profile) {
      return errorResponse(res, 500, '소셜 로그인 프로필 에러가 발생했습니다.');
    }

    await this.completeOAuthSignin(res, profile);
  });

  static completeOAuthSignin = async (
    res: Response,
    profile: {
      providerId: string;
      providerName: string;
      avatarUrl: string;
      username: string;
    }
  ) => {
    //DB 소셜 계정 존재 확인
    const socialUser = await SocialUser.findByProviderId(profile.providerId);

    //DB 소셜 계정이 없으면 사용자 생성, 있으면 업데이트
    const { data: userData, error: userError } = await User.upsert({
      username: profile.username,
      avatarUrl: profile.avatarUrl,
      userId: socialUser?.user_id,
    });

    if (userError) {
      return errorResponse(res, 500, userError.message);
    }

    //DB에 소셜 계성 생성 또는 업데이트
    const { data: socialUserData, error: socialUserError } =
      await SocialUser.upsert({
        userId: userData.id,
        providerId: profile.providerId,
        providerName: profile.providerName,
      });

    if (socialUserError) {
      return errorResponse(res, 500, socialUserError.message);
    }
    //DB user_infos에 생성 또는 업데이트
    const { error: userInfoError } = await UserInfo.upsert({
      userId: socialUserData.user_id,
    });

    if (userInfoError) {
      return errorResponse(res, 500, userInfoError.message);
    }

    //JWT 토큰 발행
    const accessToken = issueJWT(
      {
        username: userData.username,
        id: userData.id,
      },
      'walkey',
      ONE_WEEK
    );

    //JWT 쿠키에 삽입
    res.cookie('walkey_access_token', accessToken, {
      httpOnly: true,
    });

    return successResponse(res, 200, '성공적으로 로그인 되었습니다.');
  };
}

export default OAuthController;
