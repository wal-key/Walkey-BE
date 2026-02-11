import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { successResponse } from '../utils/response';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string | number;
      };
    }
  }
}

interface JwtPayload {
  userId: string;
  iat: number;
  exp: number;
}

export const authCookieParser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.walkey_access_token;

  if (!token) {
    return next();
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET as string);

    return successResponse(res, 200, '이미 로그인되어 있습니다.');
  } catch (err) {
    return next();
  }
};
