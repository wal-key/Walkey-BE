import axios from 'axios';

export class githubOAuth {
  static async getToken(code: string) {
    const tokenUrl =
      `https://github.com/login/oauth/access_token` +
      `?client_id=${process.env.AUTH_GITHUB_CLIENT_ID}` +
      `&client_secret=${process.env.AUTH_GITHUB_SECRET}` +
      `&code=${code}`;
    return await axios
      .post(tokenUrl, null, {
        headers: {
          accept: 'application/json',
        },
      })
      .then<string | null>((res) => res.data.access_token);
  }

  static async getProfile(token: string) {
    const profileUrl = 'https://api.github.com/user';
    const profileData = await axios
      .get(profileUrl, {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => res.data);

    if (profileData.error) {
      return null;
    }
    const userData = {
      username: profileData.name,
      providerId: profileData.id,
      providerName: 'github',
      avatarUrl: profileData.avatar_url,
    };
    return userData;
  }
}
export class naverOAuth {
  static async getToken(code: string, state: string) {
    const params = {
      grant_type: 'authorization_code',
      client_id: process.env.AUTH_NAVER_CLIENT_ID,
      client_secret: process.env.AUTH_NAVER_CLIENT_SECRET,
      code,
      state,
    };

    const tokenUrl = 'https://nid.naver.com/oauth2.0/token';
    // TODO 확인 필요
    return await axios
      .post(tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      .then((res) => res.data.access_token);
  }

  static async getProfile(token: string) {
    const profileUrl = 'https://openapi.naver.com/v1/nid/me';
    const profileData = await axios
      .get(profileUrl, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => res.data);
    if (profileData.error) {
      return null;
    }

    // TODO 확인필요
    const userData = {
      username: profileData.response.name,
      providerId: profileData.response.id,
      providerName: 'naver',
      avatarUrl: profileData.response.profile_image,
    };
    return userData;
  }
}
export class kakaoOAuth {
  static getToken(code: string) {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', process.env.AUTH_KAKAO_CLIENT_ID || '');
    params.append('client_secret', process.env.AUTH_KAKAO_SECRET || '');
    params.append(
      'redirect_uri',
      `${process.env.SERVER_BASE_URL}/api/auth/callback/kakao`
    );
    params.append('code', code as string);

    const tokenUrl = 'https://kauth.kakao.com/oauth/token';
    return axios
      .post(tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      })
      .then((res) => res.data.access_token);
  }

  static async getProfile(token: string) {
    const profileUrl = 'https://kapi.kakao.com/v2/user/me';
    const profileData = await axios
      .get(profileUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      })
      .then((res) => res.data);

    if (profileData.error) {
      return null;
    }
    const userData = {
      username: profileData.kakao_account.profile.nickname,
      providerId: profileData.id,
      providerName: 'kakao',
      avatarUrl: profileData.kakao_account.profile.profile_image_url,
    };
    return userData;
  }
}
export class googleOAuth {
  static async getToken(code: string) {
    const params = {
      client_id: process.env.AUTH_GOOGLE_CLIENT_ID,
      client_secret: process.env.AUTH_GOOGLE_SECRET,
      code: code,
      redirect_uri: `${process.env.SERVER_BASE_URL}/api/auth/callback/google`,
      grant_type: 'authorization_code',
    };
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    return await axios
      .post(tokenUrl, JSON.stringify(params), {
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
      .then<string | null>((res) => res.data.access_token);
  }

  static async getProfile(token: string) {
    const profileUrl = 'https://www.googleapis.com/oauth2/v3/userinfo';
    const profileData = await axios
      .get(profileUrl, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => res.data);
    if (profileData.error) {
      return null;
    }
    const userData = {
      username: profileData.name,
      providerId: profileData.sub,
      providerName: 'google',
      avatarUrl: profileData.picture,
    };
    return userData;
  }
}
