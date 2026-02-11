import { UUID } from 'node:crypto';
import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import { supabase } from '../config/supabase';

class SocialUser {
  /**
   * Provider id로 사용자 조회
   * @param {string} email
   */
  static async findByProviderId(providerId: string) {
    const { data: socialUserInfo, error } = await supabase
      .from('social_users')
      .select('user_id')
      .is('provider_id', providerId)
      .single();

    if (error) {
      return null;
    }

    const { data: userData } = await supabase
      .from('users')
      .select()
      .eq('id', socialUserInfo.user_id)
      .single();
    return { ...userData, email: '' };
  }

  /**
   * 새 소셜 사용자 생성 (회원가입)
   * @param userData
   */
  static async create(userData: {
    userId: UUID;
    providerId: string;
    providerName: string;
  }) {
    const { userId, providerId, providerName } = userData;
    return await supabase
      .from('social_users')
      .upsert(
        {
          user_id: userId,
          provider_id: providerId,
          provider_name: providerName,
        },
        { onConflict: 'provider_id' }
      )
      .select()
      .single();
  }
}

export default SocialUser;
