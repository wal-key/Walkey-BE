import express from 'express';
import AuthController from '../controllers/authController';

const router = express.Router();

// 로그인
router.post('/login', AuthController.login);

router.get('/login/github', AuthController.githubLogin);
router.route('/callback/google').get(AuthController.googleSignin);

export default router;
