const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/response');

// 유효성 검사 결과 확인 미들웨어
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return errorResponse(res, 400, '입력 데이터가 유효하지 않습니다.', errors.array());
    }

    next();
};

module.exports = validate;
