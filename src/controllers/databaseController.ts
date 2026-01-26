import { Request, Response } from 'express';
import pool from '../config/database';

/**
 * 데이터베이스 연결 테스트
 */
export const testConnection = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT NOW() as current_time, version() as db_version');
        res.json({
            success: true,
            message: '데이터베이스 연결 성공',
            data: {
                currentTime: result.rows[0].current_time,
                dbVersion: result.rows[0].db_version
            }
        });
    } catch (error: any) {
        console.error('데이터베이스 연결 오류:', error);
        res.status(500).json({
            success: false,
            message: '데이터베이스 연결 실패',
            error: error.message
        });
    }
};

/**
 * 모든 테이블 목록 조회
 */
export const getTables = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        res.json({
            success: true,
            message: '테이블 목록 조회 성공',
            data: result.rows
        });
    } catch (error: any) {
        console.error('테이블 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '테이블 목록 조회 실패',
            error: error.message
        });
    }
};

/**
 * 사용자 목록 조회
 */
export const getUsers = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC LIMIT 10');
        res.json({
            success: true,
            message: '사용자 목록 조회 성공',
            data: result.rows,
            count: result.rowCount
        });
    } catch (error: any) {
        console.error('사용자 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '사용자 조회 실패',
            error: error.message
        });
    }
};

/**
 * 테마 목록 조회
 */
export const getThemes = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM themes ORDER BY theme_id');
        res.json({
            success: true,
            message: '테마 목록 조회 성공',
            data: result.rows,
            count: result.rowCount
        });
    } catch (error: any) {
        console.error('테마 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '테마 조회 실패',
            error: error.message
        });
    }
};

/**
 * 산책 루트 목록 조회
 */
export const getRoutes = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT wr.*, t.theme_name, t.color_code
            FROM walk_routes wr
            LEFT JOIN themes t ON wr.theme_id = t.theme_id
            ORDER BY wr.created_at DESC
            LIMIT 10
        `);
        res.json({
            success: true,
            message: '산책 루트 목록 조회 성공',
            data: result.rows,
            count: result.rowCount
        });
    } catch (error: any) {
        console.error('산책 루트 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '산책 루트 조회 실패',
            error: error.message
        });
    }
};

/**
 * 산책 세션 목록 조회
 */
export const getSessions = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT ws.*, u.nickname, wr.route_name
            FROM walk_sessions ws
            LEFT JOIN users u ON ws.user_id = u.user_id
            LEFT JOIN walk_routes wr ON ws.route_id = wr.route_id
            ORDER BY ws.start_time DESC
            LIMIT 10
        `);
        res.json({
            success: true,
            message: '산책 세션 목록 조회 성공',
            data: result.rows,
            count: result.rowCount
        });
    } catch (error: any) {
        console.error('산책 세션 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '산책 세션 조회 실패',
            error: error.message
        });
    }
};

/**
 * 커뮤니티 게시글 목록 조회
 */
export const getPosts = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT cp.*, u.nickname, ws.route_id
            FROM community_posts cp
            LEFT JOIN users u ON cp.user_id = u.user_id
            LEFT JOIN walk_sessions ws ON cp.session_id = ws.session_id
            ORDER BY cp.created_at DESC
            LIMIT 10
        `);
        res.json({
            success: true,
            message: '커뮤니티 게시글 목록 조회 성공',
            data: result.rows,
            count: result.rowCount
        });
    } catch (error: any) {
        console.error('커뮤니티 게시글 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '커뮤니티 게시글 조회 실패',
            error: error.message
        });
    }
};
