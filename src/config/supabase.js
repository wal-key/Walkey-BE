const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

// Supabase 클라이언트 초기화
const supabase = createClient(
    config.supabase.url,
    config.supabase.anonKey
);

// 관리자 권한이 필요한 작업을 위한 클라이언트
const supabaseAdmin = createClient(
    config.supabase.url,
    config.supabase.serviceRoleKey
);

module.exports = {
    supabase,
    supabaseAdmin,
};
