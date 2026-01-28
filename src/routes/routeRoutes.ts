import express from 'express';
import RouteController from '../controllers/routeController';

const router = express.Router();

// 산책 루트 목록 조회
router.get('/', RouteController.getRoutes);

export default router;
