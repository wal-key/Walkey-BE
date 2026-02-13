import axios from 'axios';
import config from '../config';
import { OAuthProfile, OAuthProvider } from '../types';

/**
 * OAuth 서비스 — Strategy Pattern 적용
 *
 * [패턴: Strategy Pattern]
 * 각 OAuth 제공자(Google, GitHub, Naver, Kakao)를 공통 인터페이스(IOAuthStrategy)로 추상화합니다.
 *
 * [효과]
 * 1. OCP (Open/Closed Principle): 새 OAuth 제공자 추가 시 기존 코드 변경 없이
 *    전략 클래스만 추가하면 됩니다.
 * 2. 단일 책임: 각 전략 클래스는 자신의 OAuth 플로우만 관리합니다.
 * 3. 코드 중복 제거: 기존 3개 컨트롤러(authKakao, authNaver, oAuth)에
 *    산재되어 있던 OAuth 로직이 하나의 인터페이스로 통일됩니다.
 *
 * [사용 예시]
 * const strategy = OAuthStrategyFactory.getStrategy('google');
 * const authUrl = strategy.getAuthUrl();
 * const token = await strategy.getToken(code);
 * const profile = await strategy.getProfile(token);
 */

// ─── Strategy Interface ────────────────────────────────────────

export interface IOAuthStrategy {
  /** OAuth 인증 페이지 URL 생성 */
  getAuthUrl(): string;
  /** 인가 코드로 액세스 토큰 발급 */
  getToken(code: string, state?: string): Promise<string | null>;
  /** 액세스 토큰으로 사용자 프로필 조회 */
  getProfile(token: string): Promise<OAuthProfile | null>;
}

// ─── Google Strategy ───────────────────────────────────────────

class GoogleStrategy implements IOAuthStrategy {
  private readonly clientId = config.oauth.google.clientId;
  private readonly clientSecret = config.oauth.google.clientSecret;
  private readonly redirectUri = `${config.oauth.baseCallbackUrl}/google`;

  getAuthUrl(): string {
    return (
      `https://accounts.google.com/o/oauth2/v2/auth` +
      `?response_type=code` +
      `&client_id=${this.clientId}` +
      `&redirect_uri=${this.redirectUri}` +
      `&scope=profile`
    );
  }

  async getToken(code: string): Promise<string | null> {
    const response = await axios.post(
      'https://oauth2.googleapis.com/token',
      JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code',
      }),
      {
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.access_token ?? null;
  }

  async getProfile(token: string): Promise<OAuthProfile | null> {
    const { data } = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (data.error) return null;
    return {
      username: data.name,
      providerId: data.sub,
      providerName: 'google',
      avatarUrl: data.picture,
    };
  }
}

// ─── GitHub Strategy ───────────────────────────────────────────

class GithubStrategy implements IOAuthStrategy {
  private readonly clientId = config.oauth.github.clientId;
  private readonly clientSecret = config.oauth.github.clientSecret;
  private readonly redirectUri = `${config.oauth.baseCallbackUrl}/github`;

  getAuthUrl(): string {
    return (
      `https://github.com/login/oauth/authorize` +
      `?client_id=${this.clientId}` +
      `&redirect_uri=${this.redirectUri}` +
      `&scope=email user:name user:login`
    );
  }

  async getToken(code: string): Promise<string | null> {
    const tokenUrl =
      `https://github.com/login/oauth/access_token` +
      `?client_id=${this.clientId}` +
      `&client_secret=${this.clientSecret}` +
      `&code=${code}`;
    const response = await axios.post(tokenUrl, null, {
      headers: { accept: 'application/json' },
    });
    return response.data.access_token ?? null;
  }

  async getProfile(token: string): Promise<OAuthProfile | null> {
    const { data } = await axios.get('https://api.github.com/user', {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (data.error) return null;
    return {
      username: data.name,
      providerId: String(data.id),
      providerName: 'github',
      avatarUrl: data.avatar_url,
    };
  }
}

// ─── Naver Strategy ────────────────────────────────────────────

class NaverStrategy implements IOAuthStrategy {
  private readonly clientId = config.oauth.naver.clientId;
  private readonly clientSecret = config.oauth.naver.clientSecret;
  private readonly redirectUri = `${config.oauth.baseCallbackUrl}/naver`;

  getAuthUrl(): string {
    const state = Math.random().toString(36).substring(2, 15);
    return (
      `https://nid.naver.com/oauth2.0/authorize` +
      `?response_type=code` +
      `&client_id=${this.clientId}` +
      `&redirect_uri=${this.redirectUri}` +
      `&state=${state}`
    );
  }

  async getToken(code: string, state?: string): Promise<string | null> {
    const response = await axios.post(
      'https://nid.naver.com/oauth2.0/token',
      null,
      {
        params: {
          grant_type: 'authorization_code',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code,
          state,
        },
      }
    );
    return response.data.access_token ?? null;
  }

  async getProfile(token: string): Promise<OAuthProfile | null> {
    const { data } = await axios.get(
      'https://openapi.naver.com/v1/nid/me',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!data?.response?.id) return null;
    return {
      username: data.response.name,
      providerId: data.response.id,
      providerName: 'naver',
      avatarUrl: data.response.profile_image,
    };
  }
}

// ─── Kakao Strategy ────────────────────────────────────────────

class KakaoStrategy implements IOAuthStrategy {
  private readonly clientId = config.oauth.kakao.clientId;
  private readonly clientSecret = config.oauth.kakao.clientSecret;
  private readonly redirectUri = `${config.oauth.baseCallbackUrl}/kakao`;

  getAuthUrl(): string {
    return (
      `https://kauth.kakao.com/oauth/authorize` +
      `?client_id=${this.clientId}` +
      `&redirect_uri=${this.redirectUri}` +
      `&response_type=code`
    );
  }

  async getToken(code: string): Promise<string | null> {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);
    params.append('redirect_uri', this.redirectUri);
    params.append('code', code);

    const response = await axios.post(
      'https://kauth.kakao.com/oauth/token',
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      }
    );
    return response.data.access_token ?? null;
  }

  async getProfile(token: string): Promise<OAuthProfile | null> {
    const { data } = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });
    if (data.error) return null;
    return {
      username: data.kakao_account.profile.nickname,
      providerId: String(data.id),
      providerName: 'kakao',
      avatarUrl: data.kakao_account.profile.profile_image_url,
    };
  }
}

// ─── Strategy Factory ──────────────────────────────────────────

/**
 * OAuth Strategy Factory
 *
 * [패턴: Factory Pattern + Strategy Pattern 조합]
 * provider 이름 문자열을 받아 해당 전략 인스턴스를 반환합니다.
 * 전략 인스턴스를 캐싱하여 불필요한 생성을 방지합니다 (Flyweight 경량화).
 *
 * @throws {Error} 지원하지 않는 provider인 경우
 */
export class OAuthStrategyFactory {
  private static readonly strategies: Record<OAuthProvider, IOAuthStrategy> = {
    google: new GoogleStrategy(),
    github: new GithubStrategy(),
    naver: new NaverStrategy(),
    kakao: new KakaoStrategy(),
  };

  /** provider 이름에 해당하는 전략을 반환 */
  static getStrategy(provider: string): IOAuthStrategy {
    const strategy = this.strategies[provider as OAuthProvider];
    if (!strategy) {
      throw new Error(`지원하지 않는 OAuth 제공자입니다: ${provider}`);
    }
    return strategy;
  }

  /** 유효한 OAuth provider인지 검증 */
  static isValidProvider(provider: string): provider is OAuthProvider {
    return provider in this.strategies;
  }
}
