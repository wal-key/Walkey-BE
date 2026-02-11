import express from 'express';
import AuthController from '../controllers/authController';
import AuthNaverController from '../controllers/authNaverController';
import OAuthController from '../controllers/oauthController';

const router = express.Router();

// 로그인
router.post('/login', AuthController.login);

router.route('/callback/:provider').get(OAuthController.handlerOauthCallback);

// 네이버
router.get('/callback/naver', AuthNaverController.naverLogin);
router.get('/signin/:provider', AuthController.getSigninUrl);

export default router;
