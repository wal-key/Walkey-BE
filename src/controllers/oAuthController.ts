import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';
import { asyncHandler } from '../utils/asyncHandler';
import { errorResponse, successResponse } from '../utils/response';
import { NextFunction, Request, Response } from 'express';
import ProviderController from './providerController';
import axios from 'axios';
import { googleOAuth } from '../services/OAuthService';
import SocialUser from '../models/socialUserModel';
import User from '../models/userModel';
import UserInfo from '../models/userInfoModel';
import { issueJWT } from '../utils/jwtUtils';

const JWT_SECRET = process.env.JWT_SECRET || '';
const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

class OAuthController {
  static handlerOauthCallback = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { provider } = req.params;
      switch (provider) {
        case 'google':
          this.googleSignin(req, res, next);
        case 'github':
          this.githubSignin(req, res, next);
        case 'naver':
          this.naverSignin(req, res, next);
        case 'kakao':
        default:
          break;
      }
    }
  );

  static googleSignin = asyncHandler(async (req: Request, res: Response) => {
    const { provider } = req.params;
    const { code } = req.query;

    //OAuth token 요청
    const token = await googleOAuth.getToken<string>(code as string);
    if (!token) {
      return errorResponse(res, 500, '소셜 로그인 토큰 에러가 발생했습니다.');
    }

    //OAuth 프로필 요청
    const profile = await googleOAuth.getProfile(token);
    if (!profile) {
      return errorResponse(res, 500, '소셜 로그인 프로필 에러가 발생했습니다.');
    }

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
        providerName: provider as string,
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
  });

  static githubSignin = asyncHandler(async (req: Request, res: Response) => {
    const { code, state } = req.query;

    if (!code || !state) {
      return errorResponse(res, 400, 'code와 state가 필요합니다.');
    }

    const params = {
      client_id: process.env.AUTH_GITHUB_CLIENT_ID,
      client_secret: process.env.AUTH_GITHUB_SECRET,
      code: code,
    };

    const authRes = await fetch(`https://github.com/login/oauth/access_token`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const authData = await authRes.json();

    const { access_token } = authData as { access_token: string };

    const githubUserRes = await fetch('https://api.github.com/user', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + access_token,
      },
    });

    const socialLoginData = (await githubUserRes.json()) as {
      name: string;
      id: number;
      avatar_url: string;
    };
    const { name, avatar_url, id: provider_id } = socialLoginData;

    const { data: exist } = await supabase
      .from('social_users')
      .select('user_id, id')
      .eq('provider_id', provider_id.toString())
      .eq('provider_name', 'github')
      .single();

    let userRes;
    if (exist) {
      userRes = await supabase
        .from('users')
        .upsert({
          id: exist.user_id,
          username: name,
          avatar_url: avatar_url,
        })
        .select()
        .single();
    } else {
      userRes = await supabase
        .from('users')
        .insert({
          username: name,
          avatar_url: avatar_url,
        })
        .select()
        .single();
    }

    const { data: userData, error: userError } = userRes;

    if (userError) {
      return errorResponse(res, 500, userError.message);
    }

    const { error: socialError } = await supabase.from('social_users').upsert(
      {
        user_id: userData.id,
        provider_id: provider_id.toString(),
        provider_name: 'github',
      },
      { onConflict: 'provider_id' }
    );

    if (socialError) {
      return errorResponse(res, 500, socialError.message);
    }

    const { error: userInfoError } = await supabase
      .from('user_infos')
      .upsert({ id: userData.id });

    if (userInfoError) {
      return errorResponse(res, 500, userInfoError.message);
    }

    const accessToken = jwt.sign(
      {
        username: userData.username,
        id: userData.id,
      },
      JWT_SECRET,
      {
        issuer: 'walkey',
        expiresIn: ONE_WEEK,
      }
    );
    res.cookie('walkey_access_token', accessToken, {
      httpOnly: true,
    });

    successResponse(res, 200, '성공적으로 로그인 되었습니다.');
  });
}

export default OAuthController;
