const { errorResponse } = require('../utils/response');

// 404 에러 핸들러
const notFound = (req, res, next) => {
    errorResponse(res, 404, `요청한 경로를 찾을 수 없습니다: ${req.originalUrl}`);
};

// 전역 에러 핸들러
const errorHandler = (err, req, res, next) => {
    console.error('❌ 에러 발생:', err);

    const statusCode = err.statusCode || 500;
    const message = err.message || '서버 내부 오류가 발생했습니다.';

    errorResponse(res, statusCode, message, err.errors);
};

module.exports = {
    notFound,
    errorHandler,
};
