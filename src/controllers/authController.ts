import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse, errorResponse } from '../utils/response';
import { supabase } from '../config/supabase';
import 'dotenv/config';

// JWT 비밀키 (환경변수에서 가져오거나 기본값 사용)
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_key_change_me';
const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

type AuthType = 'authentication' | 'authorization' | 'signin';

class AuthController {
  static googleSignin = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.query;
    console.log('code=', code);

    const params = {
      client_id: process.env.AUTH_GOOGLE_CLIENT_ID,
      client_secret: process.env.AUTH_GOOGLE_SECRET,
      code: code,
      redirect_uri: 'http://localhost:3000/api/auth/callback/google',
      grant_type: 'authorization_code',
    };

    const uri = 'https://oauth2.googleapis.com/token';
    const authRes = await fetch(uri, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const authData = await authRes.json();

    if (!authData) {
      errorResponse(res, 500, 'authentication error');
    }

    const { access_token } = authData as { access_token: string };
    console.log('access-token:', access_token);
    const googleUserRes = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const googleUserData = await googleUserRes.json();

    const { name, sub, picture } = googleUserData as {
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

  static githubLogin = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.query;
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
