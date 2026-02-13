import express from 'express';
import UserController from '../controllers/userController';

const router = express.Router();

// 로그인
router.post('/signin', UserController.signin);

// 산책 세션 시작
router.post('/sessions', UserController.createUserSession);

// 사용자 산책 내역 조회
router.get('/sessions/:username', UserController.getUserSessions);

// TODO: 아래 라우트들은 추후 활성화 예정
// router.post('/', UserController.signup);           // 회원가입
// router.get('/:username', UserController.getUserByUsername); // 사용자 정보 조회

export default router;
