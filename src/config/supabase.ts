import { createClient } from '@supabase/supabase-js';
import config from './index';

// Supabase 클라이언트 초기화
export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

// 관리자 권한이 필요한 작업을 위한 클라이언트
export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey // Fallback required for TS strict mode if key is undefined
);
