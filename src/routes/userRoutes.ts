import express from 'express';
import UserController from '../controllers/userController';

const router = express.Router();
// 로그인
router.post('/signin', UserController.signin);

// 산책 세션 시작
router.post('/sessions', UserController.createUserSession);

/**
 * 회원가입, 및 기타 API 임시 주석처리

/**
 * 회원가입, 및 기타 API 임시 주석처리
// 회원 가입
router.post('/', UserController.signup);

// 사용자 정보 조회
router.get('/:username', UserController.getUserByUsername);
*/

router.get('/sessions/:username', UserController.getUserSessions);

export default router;
