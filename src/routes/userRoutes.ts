import express from 'express';
import UserController from '../controllers/userController';
import UserSessionController from '../controllers/userSessionController';
import { requireAuth } from '../middleware/authMiddleware';

const router = express.Router();

// 로그인
router.post('/signin', UserController.signin);

// 산책 세션 시작 (POST /api/users/sessions)
router.post('/sessions', requireAuth, UserController.createUserSession);

// 내 산책 기록 조회 (GET /api/users/sessions)
router.get('/sessions', requireAuth, UserSessionController.getUserSessions);

/**
 * 회원가입, 및 기타 API 임시 주석처리
// 회원 가입
router.post('/', UserController.signup);

// 사용자 정보 조회
router.get('/:username', UserController.getUserByUsername);
*/

export default router;
