import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';
import { asyncHandler } from '../utils/asyncHandler';
import { errorResponse, successResponse } from '../utils/response';
import { Request, Response } from 'express';
import axios from 'axios';

const JWT_SECRET = process.env.JWT_SECRET || '';
const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

class ProviderController {
  static googleSignin = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.query;
    const params = {
      client_id: process.env.AUTH_GOOGLE_CLIENT_ID,
      client_secret: process.env.AUTH_GOOGLE_SECRET,
      code: code,
      redirect_uri: 'http://localhost:3000/api/auth/callback/google',
      grant_type: 'authorization_code',
    };
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const userInfoUrl = 'https://www.googleapis.com/oauth2/v3/userinfo';
    const googleUserInfo = await axios
      .post(tokenUrl, JSON.stringify(params))
      .then(async (res) => {
        const { access_token } = res.data;
        const userData = await axios
          .get(userInfoUrl, {
            headers: { Authorization: `Bearer ${access_token}` },
          })
          .then((res) => res.data);
        return userData;
      });

    const { name, sub, picture } = googleUserInfo as {
      name: string;
      sub: number;
      picture: string;
    };

    const { data: exist } = await supabase
      .from('social_users')
      .select('user_id, id')
      .eq('provider_id', sub.toString())
      .eq('provider_name', 'google')
      .single();

    let userRes;
    if (exist) {
      userRes = await supabase
        .from('users')
        .upsert({
          id: exist.user_id,
          username: name,
          avatar_url: picture,
        })
        .select()
        .single();
    } else {
      userRes = await supabase
        .from('users')
        .insert({
          username: name,
          avatar_url: picture,
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
        provider_id: sub.toString(),
        provider_name: 'google',
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
  static naverSignin = asyncHandler(async (req: Request, res: Response) => {
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
          provider_id: provider_id, // string이라 에러 나는중
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

export default ProviderController;
