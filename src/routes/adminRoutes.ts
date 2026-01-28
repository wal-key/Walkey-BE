import express from 'express';
import AdminController from '../controllers/adminController';

const router = express.Router();

// 대시보드 통계
router.get('/stats', AdminController.getDashboardStats);

// 테마 관리
router.post('/themes', AdminController.createTheme);
router.delete('/themes/:id', AdminController.deleteTheme);

// 루트 관리
router.post('/routes', AdminController.createRoute);
router.delete('/routes/:id', AdminController.deleteRoute);

// 사용자 관리
router.get('/users', AdminController.getUsers);
router.post('/users', AdminController.createUser);
router.delete('/users/:id', AdminController.deleteUser);

export default router;
