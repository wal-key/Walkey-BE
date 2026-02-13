import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { errorResponse } from '../utils/response';
import config from '../config';

/**
 * 전역 에러 핸들러
 *
 * AppError 인스턴스인 경우: isOperational 에러로 간주하고 statusCode에 맞는 응답 반환
 * 그 외 에러: 500 Internal Server Error 반환
 *
 * 개발 환경에서는 스택 트레이스를 콘솔에 출력하여 디버깅을 돕습니다.
 */

/** 404 Not Found 핸들러 */
export const notFound = (req: Request, res: Response, _next: NextFunction) => {
  errorResponse(res, 404, `요청한 경로를 찾을 수 없습니다: ${req.originalUrl}`);
};

/** 전역 에러 핸들러 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // 개발 환경에서는 스택 트레이스 출력
  if (config.server.env === 'development') {
    console.error('❌ 에러 발생:', err);
  } else {
    console.error('❌ 에러 발생:', err.message);
  }

  // AppError인 경우 정의된 statusCode 사용, 아니면 500
  if (err instanceof AppError) {
    return errorResponse(res, err.statusCode, err.message);
  }

  // 예상치 못한 에러는 500으로 처리
  return errorResponse(res, 500, '서버 내부 오류가 발생했습니다.');
};
