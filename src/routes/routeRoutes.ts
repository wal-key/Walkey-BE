import express from 'express';
import WorkRouteController from '../controllers/workRouteController';

const router = express.Router();

// 산책 루트 목록 조회
router.get('/', WorkRouteController.getRecommendedRoutes);

export default router;
