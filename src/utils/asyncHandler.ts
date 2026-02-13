import { Request, Response, NextFunction } from 'express';

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

/**
 * Async Handler — try-catch 보일러플레이트를 제거
 *
 * 컨트롤러의 비동기 핸들러에서 발생하는 에러를 자동으로
 * Express의 next()에 전달하여 전역 에러 핸들러에서 처리합니다.
 *
 * AppError를 throw하면 전역 에러 핸들러가 statusCode에 맞는 응답을 반환합니다.
 *
 * @example
 * static getUser = asyncHandler(async (req, res) => {
 *   const user = await userService.findById(id);
 *   if (!user) throw new NotFoundError('사용자를 찾을 수 없습니다.');
 *   return successResponse(res, 200, user);
 * });
 */
export const asyncHandler = (fn: AsyncRequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
