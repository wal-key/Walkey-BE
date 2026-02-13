import prisma from '../lib/prisma';

/**
 * UserInfo Repository (Repository Pattern)
 *
 * [패턴: Repository Pattern]
 * user_infos 테이블에 대한 데이터 접근 로직을 캡슐화합니다.
 * Supabase 직접 쿼리를 Prisma로 통일했습니다.
 */
class UserInfo {
  /** 사용자 정보 생성/업데이트 */
  static async upsert(userData: { userId: string; email?: string }) {
    const { userId, email } = userData;

    return prisma.userInfo.upsert({
      where: { id: userId },
      update: { ...(email && { email }) },
      create: { id: userId, email, password: '' },
    });
  }
}

export default UserInfo;
