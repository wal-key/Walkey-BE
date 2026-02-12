import express, { Request, Response } from 'express';
import dbController from '../controllers/databaseController';
import userRoutes from './userRoutes';
import themeRoutes from './themeRoutes';
import routeRoutes from './routeRoutes';
import adminRoutes from './adminRoutes';

const router = express.Router();

// 헬스 체크
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'API 서버가 정상적으로 작동 중입니다.',
    timestamp: new Date().toISOString(),
  });
});

// 데이터베이스 테스트 라우트
router.get('/db/test', dbController.testConnection);

// 주요 API 라우트
router.use('/users', userRoutes);
router.use('/themes', themeRoutes);
router.use('/routes', routeRoutes);
router.use('/admin', adminRoutes);

// 레거시 API (호환성을 위해 유지하거나 정리)
router.get('/legacy/sessions', dbController.getSessions);
router.get('/legacy/posts', dbController.getPosts);

export default router;
