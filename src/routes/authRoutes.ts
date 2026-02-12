import express from 'express';
import AuthController from '../controllers/authController';
import AuthNaverController from '../controllers/authNaverController';
import { authCookieParser } from '../middleware/auth';

import AuthKakaoController from '../controllers/authKakaoController';

const authRouter = express.Router();

// 로그인
authRouter.post('/login', AuthController.login);

authRouter.get('/login/github', AuthController.githubLogin);
authRouter.route('/callback/google').get(AuthController.googleSignin);

// 네이버
authRouter.get('/login/naver', AuthNaverController.getNaverUrl);

authRouter.get('/login/kakao', AuthKakaoController.kakaoLogin);

authRouter.get('/callback/naver', AuthNaverController.naverLogin);

export default authRouter;
