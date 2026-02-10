import express from 'express';
import AuthController from '../controllers/authController';
import AuthNaverController from '../controllers/authNaverController';

const router = express.Router();

// 로그인
router.post('/login', AuthController.login);

router.get('/login/github', AuthController.githubLogin);
router.route('/callback/google').get(AuthController.googleSignin);

// 네이버
router.get('/callback/naver', AuthNaverController.naverLogin);
router.get('/login/naver', AuthNaverController.getNaverUrl);

export default router;
