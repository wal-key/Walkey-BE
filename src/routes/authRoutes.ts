import express from 'express';
import AuthController from '../controllers/authController';
import { authCookieParser } from '../middleware/auth';

const router = express.Router();

// 로그인
router.post('/login', AuthController.login);
router.get('/login/github', AuthController.githubLogin);

// ******************* 소셜 로그인 기능 *********************
router.use(authCookieParser);

export default router;
