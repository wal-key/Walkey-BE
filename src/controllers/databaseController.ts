import { Request, Response } from 'express';
import pool from '../config/database';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/response';

/**
 * 데이터베이스 연결 테스트
 */
export const testConnection = asyncHandler(async (req: Request, res: Response) => {
    const result = await pool.query('SELECT NOW() as current_time, version() as db_version');
    return successResponse(res, 200, {
        currentTime: result.rows[0].current_time,
        dbVersion: result.rows[0].db_version
    }, '데이터베이스 연결 성공');
});

/**
 * 모든 테이블 목록 조회
 */
export const getTables = asyncHandler(async (req: Request, res: Response) => {
    const result = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
    `);
    return successResponse(res, 200, result.rows, '테이블 목록 조회 성공');
});

/**
 * 사용자 목록 조회
 */
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC LIMIT 10');
    return successResponse(res, 200, result.rows, '사용자 목록 조회 성공');
});

/**
 * 테마 목록 조회
 */
export const getThemes = asyncHandler(async (req: Request, res: Response) => {
    const result = await pool.query('SELECT * FROM themes ORDER BY theme_id');
    return successResponse(res, 200, result.rows, '테마 목록 조회 성공');
});

/**
 * 산책 루트 목록 조회
 */
export const getRoutes = asyncHandler(async (req: Request, res: Response) => {
    const result = await pool.query(`
        SELECT wr.*, t.theme_name, t.color_code
        FROM walk_routes wr
        LEFT JOIN themes t ON wr.theme_id = t.theme_id
        ORDER BY wr.created_at DESC
        LIMIT 10
    `);
    return successResponse(res, 200, result.rows, '산책 루트 목록 조회 성공');
});

/**
 * 산책 세션 목록 조회
 */
export const getSessions = asyncHandler(async (req: Request, res: Response) => {
    const result = await pool.query(`
        SELECT ws.*, u.nickname, wr.route_name
        FROM walk_sessions ws
        LEFT JOIN users u ON ws.user_id = u.user_id
        LEFT JOIN walk_routes wr ON ws.route_id = wr.route_id
        ORDER BY ws.start_time DESC
        LIMIT 10
    `);
    return successResponse(res, 200, result.rows, '산책 세션 목록 조회 성공');
});

/**
 * 커뮤니티 게시글 목록 조회
 */
export const getPosts = asyncHandler(async (req: Request, res: Response) => {
    const result = await pool.query(`
        SELECT cp.*, u.nickname, ws.route_id
        FROM community_posts cp
        LEFT JOIN users u ON cp.user_id = u.user_id
        LEFT JOIN walk_sessions ws ON cp.session_id = ws.session_id
        ORDER BY cp.created_at DESC
        LIMIT 10
    `);
    return successResponse(res, 200, result.rows, '커뮤니티 게시글 목록 조회 성공');
});

