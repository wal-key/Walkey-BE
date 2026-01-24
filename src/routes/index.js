const express = require('express');
const router = express.Router();
const dbController = require('../controllers/databaseController');

// 헬스 체크
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API 서버가 정상적으로 작동 중입니다.',
        timestamp: new Date().toISOString(),
    });
});

// 데이터베이스 테스트 라우트
router.get('/db/test', dbController.testConnection);
router.get('/db/tables', dbController.getTables);

// 각 테이블 조회 라우트
router.get('/users', dbController.getUsers);
router.get('/themes', dbController.getThemes);
router.get('/routes', dbController.getRoutes);
router.get('/sessions', dbController.getSessions);
router.get('/posts', dbController.getPosts);

const authRoutes = require('./authRoutes');

// 인증 라우트
router.use('/auth', authRoutes);

module.exports = router;
