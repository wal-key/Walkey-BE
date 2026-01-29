import express from 'express';
import ThemeController from '../controllers/themeController';

const router = express.Router();

// 테마 목록 조회
router.get('/', ThemeController.getThemes);

export default router;
