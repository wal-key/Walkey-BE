import prisma from '../lib/prisma';

export class userService {
  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        avatar_url: true,
      },
    });

    return user;
  }
}
