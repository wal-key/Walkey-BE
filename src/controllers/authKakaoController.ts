import 'dotenv/config';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse, errorResponse } from '../utils/response';
import { supabase } from '../config/supabase';

// JWT 비밀키 (환경변수에서 가져오거나 기본값 사용)
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_key_change_me';
const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

class AuthKakaoController {
  //카카오 소셜 로그인
  static kakaoLogin = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.query;

    if (!code) {
      return errorResponse(res, 400, 'Code is missing');
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', process.env.KAKAO_REST_KEY || '');
    params.append('redirect_uri', process.env.KAKAO_REDIRECT_URI || '');
    params.append('code', code as string);

    const authRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      body: params.toString(),
    });

    const authData = await authRes.json();
    const { access_token } = authData as { access_token: string };

    if (!access_token) {
      return errorResponse(res, 500, 'Kakao login failed: No access token');
    }

    const kakaoUserRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });

    const socialLoginData = (await kakaoUserRes.json()) as {
      id: number;
      properties: {
        nickname: string;
        profile_image: string;
      };
      kakao_account: {
        profile: {
          nickname: string;
          profile_image_url: string;
        };
      };
    };

    const provider_id = socialLoginData.id;
    const name = socialLoginData.id.toString();
    const avatar_url =
      socialLoginData.properties?.profile_image ||
      socialLoginData.kakao_account?.profile?.profile_image_url ||
      'https://via.placeholder.com/150'; // Fallback image

    const { data: exist } = await supabase
      .from('social_users')
      .select('user_id, id')
      .eq('provider_id', provider_id)
      .eq('provider_name', 'kakao')
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
        provider_id,
        provider_name: 'kakao',
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

export default AuthKakaoController;
