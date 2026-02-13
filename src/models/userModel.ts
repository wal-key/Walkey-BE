import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';

/**
 * User Repository (Repository Pattern)
 *
 * [패턴: Repository Pattern]
 * 사용자 테이블에 대한 모든 데이터 접근 로직을 캡슐화합니다.
 * Prisma로 데이터 접근을 통일하여 Supabase 직접 쿼리를 제거했습니다.
 *
 * [효과]
 * 1. 데이터 소스 변경(Supabase → Prisma) 시 이 파일만 수정하면 됨
 * 2. 쿼리 최적화를 한 곳에서 관리
 * 3. 비즈니스 로직과 데이터 접근 로직의 명확한 분리
 */
class User {
  /** 이메일로 사용자 조회 (로그인용) */
  static async findByEmail(email: string) {
    const result = await prisma.userInfo.findUnique({
      where: { email },
      include: { user: true },
    });

    if (!result) return null;

    return {
      ...result.user,
      email: result.email,
      password: result.password,
    };
  }

  /** ID로 사용자 조회 */
  static async findById(userId: string) {
    const result = await prisma.user.findUnique({
      where: { id: userId },
      include: { user_info: true },
    });

    if (!result) return null;

    return {
      id: result.id,
      email: result.user_info?.email,
      username: result.username,
      avatar_url: result.avatar_url,
    };
  }

  /** 사용자명으로 사용자 조회 */
  static async findByUsername(username: string) {
    const result = await prisma.user.findFirst({
      where: { username },
      include: { user_info: true },
    });

    if (!result) return null;

    return {
      id: result.id,
      email: result.user_info?.email,
      username: result.username,
      avatar_url: result.avatar_url,
      created_at: result.created_at,
    };
  }

  /** 사용자 산책 세션 목록 조회 */
  static async findSessionsByUserId(userId: string) {
    return prisma.session.findMany({
      where: { user_id: userId },
      include: {
        route: {
          select: { total_distance: true, estimated_time: true, name: true },
        },
      },
      orderBy: { start_time: 'desc' },
    });
  }

  /**
   * 사용자 생성 또는 업데이트 (Prisma 통일)
   *
   * [변경사항]
   * 기존: Supabase 클라이언트 직접 사용
   * 현재: Prisma upsert로 통일하여 일관된 데이터 접근 보장
   */
  static async upsert(userData: {
    username: string;
    avatarUrl: string;
    email?: string;
    passwordHash?: string;
    userId?: string;
  }) {
    const { username, avatarUrl, email, passwordHash, userId } = userData;

    if (userId) {
      // 기존 사용자 업데이트
      return prisma.user.upsert({
        where: { id: userId },
        update: { username, avatar_url: avatarUrl },
        create: {
          id: userId,
          username,
          avatar_url: avatarUrl,
          ...(email && {
            user_info: {
              create: { email, password: passwordHash || '' },
            },
          }),
        },
      });
    } else {
      // 신규 사용자 생성
      return prisma.user.create({
        data: {
          username,
          avatar_url: avatarUrl,
          ...(email && {
            user_info: {
              create: { email, password: passwordHash || '' },
            },
          }),
        },
      });
    }
  }

  /** 비밀번호 검증 */
  static async verifyPassword(
    inputPassword: string,
    storedHash: string
  ): Promise<boolean> {
    if (!storedHash || typeof storedHash !== 'string') {
      console.warn('⚠️ 저장된 비밀번호 해시가 유효하지 않습니다.');
      return false;
    }
    return bcrypt.compare(inputPassword, storedHash);
  }
}

export default User;
