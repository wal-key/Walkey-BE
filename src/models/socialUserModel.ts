import prisma from '../lib/prisma';

/**
 * SocialUser Repository (Repository Pattern)
 *
 * [패턴: Repository Pattern]
 * 소셜 로그인 사용자 테이블에 대한 데이터 접근 로직을 캡슐화합니다.
 * Supabase 직접 쿼리를 Prisma로 통일했습니다.
 *
 * [효과]
 * Prisma의 타입 안전성을 활용하여 컴파일 타임에 쿼리 오류를 감지합니다.
 *
 * [참고]
 * Prisma 스키마에 SocialUser 모델이 없는 경우,
 * 이 클래스는 raw query를 사용합니다.
 */
class SocialUser {
  /** Provider ID로 소셜 사용자 조회 */
  static async findByProviderId(providerId: string) {
    const result = await prisma.$queryRaw<
      { user_id: string }[]
    >`SELECT user_id FROM social_users WHERE provider_id = ${providerId} LIMIT 1`;

    return result[0] ?? null;
  }

  /** 소셜 사용자 생성/업데이트 */
  static async upsert(userData: {
    userId: string;
    providerId: string;
    providerName: string;
  }) {
    const { userId, providerId, providerName } = userData;

    // ON CONFLICT (provider_id) DO UPDATE
    await prisma.$executeRaw`
      INSERT INTO social_users (user_id, provider_id, provider_name)
      VALUES (${userId}, ${providerId}, ${providerName})
      ON CONFLICT (provider_id)
      DO UPDATE SET user_id = ${userId}, provider_name = ${providerName}
    `;

    // 방금 upsert된 레코드 반환
    const result = await prisma.$queryRaw<
      { id: string; user_id: string; provider_id: string; provider_name: string }[]
    >`SELECT * FROM social_users WHERE provider_id = ${providerId} LIMIT 1`;

    return result[0];
  }
}

export default SocialUser;
