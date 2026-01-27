"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../models/userModel"));
// JWT 비밀키 (환경변수에서 가져오거나 기본값 사용)
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_key_change_me';
class AuthController {
    /**
     * 로그인
     * POST /api/auth/login
     */
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            // 1. 입력값 검증
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: '이메일과 비밀번호를 모두 입력해주세요.'
                });
            }
            // 2. 사용자 조회
            const user = await userModel_1.default.findByEmail(email);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: '이메일 또는 비밀번호가 올바르지 않습니다.'
                });
            }
            // 3. 비밀번호 검증
            // 주의: user.password 컬럼명은 DB 스키마에 따름 (Note: users table might have password column, handled as string)
            const isMatch = await userModel_1.default.verifyPassword(password, user.password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: '이메일 또는 비밀번호가 올바르지 않습니다.'
                });
            }
            // 4. JWT 토큰 생성
            const token = jsonwebtoken_1.default.sign({ id: user.user_id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
            // 5. 응답
            res.status(200).json({
                success: true,
                message: '로그인 성공',
                data: {
                    token,
                    user: {
                        id: user.user_id,
                        email: user.email,
                        nickname: user.nickname,
                        avatar: user.avatar
                    }
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = AuthController;
