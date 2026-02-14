import express from 'express';
import AuthController from '../controllers/authController';
import AuthNaverController from '../controllers/authNaverController';
import OAuthController from '../controllers/oauthController';

const authRouter = express.Router();

// 로그인
authRouter.post('/login', AuthController.login);
authRouter
  .route('/callback/:provider')
  .get(OAuthController.handlerOauthCallback);

// 네이버
authRouter.get('/signin/:provider', AuthController.getSigninUrl);

export default authRouter;
