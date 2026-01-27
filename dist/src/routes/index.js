"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dbController = __importStar(require("../controllers/databaseController"));
const authRoutes_1 = __importDefault(require("./authRoutes"));
const router = express_1.default.Router();
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
// 인증 라우트
router.use('/auth', authRoutes_1.default);
exports.default = router;
