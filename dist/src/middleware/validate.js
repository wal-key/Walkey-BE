"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const response_1 = require("../utils/response");
// 유효성 검사 결과 확인 미들웨어
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return (0, response_1.errorResponse)(res, 400, '입력 데이터가 유효하지 않습니다.', errors.array());
    }
    next();
};
exports.default = validate;
