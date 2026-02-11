import axios from 'axios';

export class githubOAuth {
  static async getToken(code: string) {}

  static async getProfile(token: string) {}
}
export class naverOAuth {
  static async getToken(code: string) {}

  static async getProfile(token: string) {}
}
export class kakaoOAuth {
  static async getToken(code: string) {}

  static async getProfile(token: string) {}
}
export class googleOAuth {
  static async getToken<T>(code: string) {
    const params = {
      client_id: process.env.AUTH_GOOGLE_CLIENT_ID,
      client_secret: process.env.AUTH_GOOGLE_SECRET,
      code: code,
      redirect_uri: 'http://localhost:3000/api/auth/callback/google',
      grant_type: 'authorization_code',
    };
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    return await axios
      .post(tokenUrl, JSON.stringify(params))
      .then<T>((res) => res.data.access_token);
  }

  static async getProfile(token: string): Promise<{
    username: string;
    providerId: string;
    avatarUrl: string;
  } | null> {
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
      avatarUrl: profileData.picture,
    };
    return userData;
  }
}
