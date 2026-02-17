import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/response';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string | number;
        name: string;
      };
    }
  }
}

/**
 * 1모든 요청에서 실행
 * - 토큰이 있으면 해석해서 req.user에 저장
 * - 절대 막지 않음
 */
export const parseJwtUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.walkey_access_token;

  if (!token) {
    req.user = undefined;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      name: string;
    };

    req.user = {
      id: decoded.id,
      name: decoded.name,
    };
  } catch (err) {
    req.user = undefined;
  }

  next();
};

/**
 * 2️⃣ 보호가 필요한 API에서만 사용
 * - 로그인 안되어 있으면 401
 */

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return errorResponse(res, 401, '로그인이 필요합니다.');
  }

  next();
};
