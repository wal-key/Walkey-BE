import { asyncHandler } from '../utils/asyncHandler';
import { Request, Response } from 'express';
import axios from 'axios';
import { errorResponse, successResponse } from '../utils/response';
import { supabase } from '../config/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_key_change_me';
const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

class AuthNaverController {
  /**
   *
   * POST /api/auth/login/naver
   */
  static getNaverUrl = asyncHandler(async (req: Request, res: Response) => {
    const clientId = process.env.NAVER_CLIENT_ID;
    const redirectUri = 'http://localhost:3000/api/auth/callback/naver';
    const state = Math.random().toString(36).substring(2, 15);

    const url = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`;
    res.json({ url });
  });

  /**
   * 네이버 소셜 로그인
   * POST /api/auth/callback/naver
   */
  static naverLogin = asyncHandler(async (req: Request, res: Response) => {
    const { code, state } = req.query;
    const params = {
      grant_type: 'authorization_code',
      client_id: process.env.NAVER_CLIENT_ID,
      client_secret: process.env.NAVER_CLIENT_SECRET,
      code,
      state,
    };

    // access_token 요청
    const tokenResponse = await axios.post(
      'https://nid.naver.com/oauth2.0/token',
      null,

      {
        params: params,
      }
    );

    if (!tokenResponse.data?.access_token) {
      return errorResponse(res, 500, '네이버 토큰 발급 실패');
    }
    // 정보 요청
    const userResponse = await axios.get(
      'https://openapi.naver.com/v1/nid/me',
      {
        headers: {
          Authorization: `Bearer ${tokenResponse.data.access_token}`,
        },
      }
    );

    if (!userResponse.data?.response?.id) {
      return errorResponse(res, 500, '네이버 사용자 정보 조회 실패');
    }

    const socialLoginData = userResponse.data as {
      response: {
        id: string;
        name: string;
        profile_image: string;
      };
    };

    const {
      id: provider_id,
      name,
      profile_image: avatar_url,
    } = socialLoginData.response;

    // 테이블에 있는지 체크
    const { data: exist } = await supabase
      .from('social_users')
      .select('user_id, id')
      .eq('provider_id', provider_id)
      .eq('provider_name', 'naver')
      .maybeSingle();

    let userId;
    // 이미 있는 회원이면 upsert, 없는 회원이면 insert
    if (exist) {
      const { data } = await supabase
        .from('users')
        .upsert({
          id: exist.user_id,
          username: name,
          avatar_url: avatar_url,
        })
        .select('id')
        .single();

      userId = data!.id;
    } else {
      const { data } = await supabase
        .from('users')
        .insert({
          username: name,
          avatar_url: avatar_url,
        })
        .select('id')
        .single();

      userId = data!.id;
    }

    await supabase.from('social_users').upsert(
      [
        {
          provider_name: 'naver',
          provider_id: provider_id,
          user_id: userId,
        },
      ],
      {
        onConflict: 'provider_id',
      }
    );

    const { data } = await supabase.from('users').select('*').eq('id', userId);

    const userInfo = data?.[0] as {
      id: string;
      username: string;
    };

    if (!userInfo?.id || !userInfo.username) {
      return errorResponse(res, 500, 'JWT 발급 실패');
    }

    const token = jwt.sign(
      {
        id: userInfo.id,
        name: userInfo.username,
      },
      JWT_SECRET,
      {
        issuer: 'walkey',
        expiresIn: ONE_WEEK,
      }
    );

    res.cookie('walkey_access_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 30 * 60 * 1000,
    });

    successResponse(res, 200, `엑세스 코드: ${code}`);
  });
}

export default AuthNaverController;
