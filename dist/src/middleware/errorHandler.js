"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFound = void 0;
const response_1 = require("../utils/response");
// 404 에러 핸들러
const notFound = (req, res, next) => {
    (0, response_1.errorResponse)(res, 404, `요청한 경로를 찾을 수 없습니다: ${req.originalUrl}`);
};
exports.notFound = notFound;
// 전역 에러 핸들러
const errorHandler = (err, req, res, next) => {
    console.error('❌ 에러 발생:', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || '서버 내부 오류가 발생했습니다.';
    (0, response_1.errorResponse)(res, statusCode, message, err.errors);
};
exports.errorHandler = errorHandler;
