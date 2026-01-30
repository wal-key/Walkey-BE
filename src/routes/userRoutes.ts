import express from 'express';
import UserController from '../controllers/userController';

const router = express.Router();

// 회원 가입
router.post('/', UserController.signup);

// 사용자 정보 조회
router.get('/:username', UserController.getUserByUsername);

// 사용자의 산책 세션 목록 조회
router.get('/sessions/:username', UserController.getUserSessions);

export default router;
