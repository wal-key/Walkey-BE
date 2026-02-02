import { Response } from 'express';

// 에러 응답 포맷팅 유틸리티
export const errorResponse = (res: Response, statusCode: number, message: string, errors: any = null) => {
    const response: any = {
        message,
    };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

// 성공 응답 포맷팅 유틸리티
export const successResponse = (res: Response, statusCode: number, data: any, message: string = 'Success') => {
    return res.status(statusCode).json({
        message,
        data,
    });
};
