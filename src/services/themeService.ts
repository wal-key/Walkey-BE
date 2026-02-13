import prisma from '../lib/prisma';
import { NotFoundError } from '../errors/AppError';

/**
 * 테마 서비스 (Facade Pattern)
 *
 * [패턴: Facade Pattern]
 * 테마 조회 비즈니스 로직을 캡슐화합니다.
 *
 * [효과]
 * 컨트롤러에서 Prisma 직접 호출을 제거하고,
 * 데이터 접근 로직의 변경이 서비스 내부에서만 이루어집니다.
 */
export class ThemeService {
    /** 전체 테마 목록 조회 */
    static async getAllThemes() {
        const themes = await prisma.theme.findMany({
            orderBy: { id: 'asc' },
        });

        if (!themes || themes.length === 0) {
            throw new NotFoundError('해당하는 테마가 없습니다.');
        }

        return themes;
    }
}
