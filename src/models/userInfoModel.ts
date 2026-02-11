import { UUID } from 'node:crypto';
import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import { supabase } from '../config/supabase';

class UserInfo {
  /**
   * 새 사용자 생성 (회원가입)
   * @param userData
   */
  static async upsert(userData: { userId: UUID; email?: string }) {
    const { userId, email } = userData;
    return await supabase
      .from('user_infos')
      .upsert({ id: userId, email: email });
  }
}

export default UserInfo;
