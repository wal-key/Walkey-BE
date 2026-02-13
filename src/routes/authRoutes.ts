import express from 'express';
import AuthController from '../controllers/authController';
import OAuthController from '../controllers/oAuthController';

const router = express.Router();

// 이메일/비밀번호 로그인
router.post('/login', AuthController.login);

// OAuth 로그인 URL 조회
router.get('/signin/:provider', AuthController.getSigninUrl);

// OAuth 콜백 (Google, GitHub, Naver, Kakao 통합)
router.get('/callback/:provider', OAuthController.handleOAuthCallback);

export default router;
