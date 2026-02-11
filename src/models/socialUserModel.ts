import { UUID } from 'node:crypto';
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
      .eq('provider_id', providerId)
      .single();

    if (error) {
      return null;
    }

    return socialUserInfo;
  }

  /**
   * 새 소셜 사용자 생성 (회원가입)
   * @param userData
   */
  static async upsert(userData: {
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
