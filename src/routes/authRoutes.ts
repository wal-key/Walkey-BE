import express from 'express';
import AuthController from '../controllers/authController';
import AuthNaverController from '../controllers/authNaverController';
import { authCookieParser } from '../middleware/auth';

const router = express.Router();

// 로그인
router.post('/login', AuthController.login);

router.get('/login/github', AuthController.githubLogin);
router.route('/callback/google').get(AuthController.googleSignin);

// 네이버
router.get('/login/naver', AuthNaverController.getNaverUrl);

// ******************* 소셜 로그인 기능 *********************
router.use(authCookieParser);

router.get('/callback/naver', AuthNaverController.naverLogin);

export default router;
