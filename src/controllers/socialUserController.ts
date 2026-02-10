import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse, errorResponse } from '../utils/response';
import { supabase } from '../config/supabase';
import { UUID } from 'node:crypto';

interface ProviderUserInfo {
  name: string;
  providerId: string;
  providerName: string;
  avatarUrl: string;
}

interface SocialUserInfo extends ProviderUserInfo {
  userId: UUID;
}
class SocialUserController {
  static upsertSocialUser = async (socialUserInfo: SocialUserInfo) => {
    const { userId, name, providerId, providerName, avatarUrl } =
      socialUserInfo;

    const { error: socialError } = await supabase.from('social_users').upsert(
      {
        user_id: userId,
        provider_id: providerId,
        provider_name: providerName,
      },
      { onConflict: 'provider_id' }
    );

    if (socialError) {
      return socialError;
    }

    const { error: userInfoError } = await supabase
      .from('user_infos')
      .upsert({ id: userId });

    if (userInfoError) {
      return userInfoError;
    }
  };

  static upsertUser = async ({
    name,
    providerId,
    providerName,
    avatarUrl,
  }: ProviderUserInfo) => {
    const { data: exist } = await supabase
      .from('social_users')
      .select('user_id, id')
      .eq('provider_id', providerId)
      .eq('provider_name', providerName)
      .single();

    let userRes;
    if (exist) {
      userRes = await supabase
        .from('users')
        .upsert({
          id: exist.user_id,
          username: name,
          avatar_url: avatarUrl,
        })
        .select()
        .single();
    } else {
      userRes = await supabase
        .from('users')
        .insert({
          username: name,
          avatar_url: avatarUrl,
        })
        .select()
        .single();
    }

    const { data: userData, error: userError } = userRes;

    if (userError) {
      return userError;
    }
    return userData;
  };
}

export default SocialUserController;
