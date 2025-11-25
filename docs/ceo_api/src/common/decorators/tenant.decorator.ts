import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantContext } from '../interfaces/tenant-context.interface';

/**
 * Decorator para extrair o contexto do tenant da request
 * Usado em rotas que necessitam do contexto do tenant
 */
export const Tenant = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): TenantContext => {
        const request = ctx.switchToHttp().getRequest();
        return request.tenant;
    },
);