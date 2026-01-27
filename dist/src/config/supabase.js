"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseAdmin = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const index_1 = __importDefault(require("./index"));
// Supabase 클라이언트 초기화
exports.supabase = (0, supabase_js_1.createClient)(index_1.default.supabase.url, index_1.default.supabase.anonKey);
// 관리자 권한이 필요한 작업을 위한 클라이언트
exports.supabaseAdmin = (0, supabase_js_1.createClient)(index_1.default.supabase.url, index_1.default.supabase.serviceRoleKey || '' // Fallback required for TS strict mode if key is undefined
);
