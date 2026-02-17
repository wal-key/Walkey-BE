import express from 'express';
import AuthController from '../controllers/authController';
import OAuthController from '../controllers/oauthController';

const authRouter = express.Router();

// 로그인
authRouter.post('/login', AuthController.login);
authRouter.get('/signin/:provider', AuthController.getSigninUrl);

authRouter
  .route('/callback/:provider')
  .get(OAuthController.handlerOauthCallback);

export default authRouter;
