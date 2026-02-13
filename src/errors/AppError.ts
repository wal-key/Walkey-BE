/**
 * 커스텀 에러 계층 구조 (Custom Error Hierarchy Pattern)
 *
 * [패턴 설명]
 * Express의 전역 에러 핸들러와 연동하여 에러 유형에 따라
 * 자동으로 적절한 HTTP 상태 코드와 메시지를 반환합니다.
 *
 * [효과]
 * 1. 컨트롤러에서 `throw new NotFoundError('...')`처럼 선언적 에러 처리 가능
 * 2. `isOperational` 플래그로 예상된 에러(사용자 입력 오류)와
 *    예상치 못한 에러(시스템 장애)를 구분
 * 3. 에러 응답 포맷이 자동으로 일관되게 유지됨
 */

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        // prototype chain이 올바르게 설정되도록 보장
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}

/** 400 Bad Request — 잘못된 요청 파라미터 */
export class BadRequestError extends AppError {
    constructor(message = '잘못된 요청입니다.') {
        super(message, 400);
    }
}

/** 401 Unauthorized — 인증 실패 */
export class UnauthorizedError extends AppError {
    constructor(message = '인증이 필요합니다.') {
        super(message, 401);
    }
}

/** 403 Forbidden — 권한 없음 */
export class ForbiddenError extends AppError {
    constructor(message = '접근 권한이 없습니다.') {
        super(message, 403);
    }
}

/** 404 Not Found — 리소스 미발견 */
export class NotFoundError extends AppError {
    constructor(message = '요청한 리소스를 찾을 수 없습니다.') {
        super(message, 404);
    }
}

/** 409 Conflict — 리소스 충돌 (중복 등) */
export class ConflictError extends AppError {
    constructor(message = '리소스가 이미 존재합니다.') {
        super(message, 409);
    }
}

/** 500 Internal Server Error — 서버 내부 오류 */
export class InternalError extends AppError {
    constructor(message = '서버 내부 오류가 발생했습니다.') {
        super(message, 500, false);
    }
}
