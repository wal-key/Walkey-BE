import express from 'express';
import AuthController from '../controllers/authController';

import AuthKakaoController from '../controllers/authKakaoController';

const router = express.Router();

// 로그인
router.post('/login', AuthController.login);
router.get('/login/github', AuthController.githubLogin);

router.get('/login/kakao', AuthKakaoController.kakaoLogin);

export default router;
