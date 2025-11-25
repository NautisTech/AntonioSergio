import { SetMetadata } from '@nestjs/common';

/**
 * Decorator para marcar rotas como públicas (sem autenticação)
 * Usado em conjunto com JwtAuthGuard
 *
 * Uso:
 * @Public()
 * @Get('rota-publica')
 */
export const Public = () => SetMetadata('isPublic', true);
