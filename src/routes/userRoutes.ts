import express from 'express';
import UserController from '../controllers/userController';
import UserSessionController from '../controllers/userSessionController';
import { requireAuth } from '../middleware/authMiddleware';

const router = express.Router();

// 산책 세션 시작 (POST /api/users/sessions) *userSessionController에 넣기
router.post('/sessions', UserController.createUserSession);

// 산책 세션 수정 (patch /api/users/sessions)
router.patch('/sessions', UserSessionController.updateUserSession);

// 내 산책 기록 조회 (GET /api/users/sessions)
router.get('/sessions', UserSessionController.getUserSessions);

router.get('/me', UserController.getCurrentUser);

/**
 * 회원가입, 및 기타 API 임시 주석처리
// 회원 가입
router.post('/', UserController.signup);

// 사용자 정보 조회
router.get('/:username', UserController.getUserByUsername);
*/

export default router;
