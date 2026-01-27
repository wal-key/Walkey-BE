import express from 'express';
import AuthController from '../controllers/authController';

const router = express.Router();

// 로그인
router.post('/login', AuthController.login);

export default router;
