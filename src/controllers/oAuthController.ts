import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';
import { asyncHandler } from '../utils/asyncHandler';
import { errorResponse, successResponse } from '../utils/response';
import { NextFunction, Request, Response } from 'express';
import ProviderController from './providerController';
import axios from 'axios';
import { githubOAuth, googleOAuth, naverOAuth } from '../services/OAuthService';
import SocialUser from '../models/socialUserModel';
import User from '../models/userModel';
import UserInfo from '../models/userInfoModel';
import { issueJWT } from '../utils/jwtUtils';
import { UUID } from 'node:crypto';

const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

class OAuthController {
  static handlerOauthCallback = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { provider } = req.params;
      switch (provider) {
        case 'google':
          this.googleSignin(req, res, next);
          break;
        case 'github':
          this.githubSignin(req, res, next);
          break;
        case 'naver':
          this.naverSignin(req, res, next);
          break;
        case 'kakao':
        default:
          break;
      }
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
    this.completeOAuthLogin(res, profile);
  });

  static githubSignin = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.query;

    //OAuth token 요청
    const token = await githubOAuth.getToken(code as string);
    if (!token) {
      return errorResponse(res, 500, '소셜 로그인 토큰 에러가 발생했습니다.');
    }

    //OAuth 프로필 요청
    const profile = await googleOAuth.getProfile(token);
    if (!profile) {
      return errorResponse(res, 500, '소셜 로그인 프로필 에러가 발생했습니다.');
    }

    this.completeOAuthLogin(res, profile);
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

    this.completeOAuthLogin(res, profile);
  });
  static kakaoSignin = asyncHandler(async (req: Request, res: Response) => {});

  static completeOAuthLogin = async (
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
      userId: socialUser?.id,
      email: socialUser?.email,
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
      userId: socialUserData.userId,
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
