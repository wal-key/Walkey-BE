import { Response } from 'express';
import { ApiResponse } from '../types';

/**
 * 통일된 API 응답 유틸리티
 *
 * 모든 API 응답이 동일한 구조({ message, data?, errors? })를 갖도록 보장합니다.
 * 제네릭 타입을 통해 응답 데이터의 타입 안전성을 확보합니다.
 */

/** 성공 응답 */
export const successResponse = <T>(
  res: Response,
  statusCode: number,
  data: T,
  message = 'Success'
): Response => {
  const body: ApiResponse<T> = { message, data };
  return res.status(statusCode).json(body);
};

/** 에러 응답 */
export const errorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  errors: unknown[] | null = null
): Response => {
  const body: ApiResponse = { message };

  if (errors) {
    body.errors = errors;
  }

  return res.status(statusCode).json(body);
};
