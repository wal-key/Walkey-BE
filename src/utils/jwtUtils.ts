import jwt from 'jsonwebtoken';
import config from '../config';
import { JwtPayload } from '../types';

/**
 * JWT 유틸리티
 *
 * config에서 일관된 JWT 설정(secret, issuer, expiresIn)을 참조합니다.
 * 발급과 검증을 모두 제공하여 JWT 관련 로직을 한 곳에서 관리합니다.
 */

/** JWT 토큰 발급 */
export const issueJWT = (
  payload: JwtPayload,
  issuer = config.jwt.issuer,
  expiresIn = config.jwt.expiresIn
): string => {
  return jwt.sign({ ...payload }, config.jwt.secret, { issuer, expiresIn });
};

/** JWT 토큰 검증 및 디코딩 */
export const verifyJWT = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
};
