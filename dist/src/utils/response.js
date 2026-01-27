"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = exports.errorResponse = void 0;
// 에러 응답 포맷팅 유틸리티
const errorResponse = (res, statusCode, message, errors = null) => {
    const response = {
        success: false,
        message,
        timestamp: new Date().toISOString(),
    };
    if (errors) {
        response.errors = errors;
    }
    return res.status(statusCode).json(response);
};
exports.errorResponse = errorResponse;
// 성공 응답 포맷팅 유틸리티
const successResponse = (res, statusCode, data, message = 'Success') => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString(),
    });
};
exports.successResponse = successResponse;
