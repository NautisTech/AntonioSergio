import { TenantContext } from '../../common/interfaces/tenant-context.interface';
import { UserPayload } from '../../common/interfaces/user-payload.interface';

export abstract class BaseController {
    protected getTenantId(tenant: TenantContext): number {
        return tenant.tenantId;
    }

    protected getUserId(user: UserPayload): number {
        return user.sub;
    }

    protected getEmpresaId(tenant: TenantContext): number | undefined {
        return tenant.empresaId;
    }

    protected buildPaginationResponse<T>(
        data: T[],
        total: number,
        page: number,
        pageSize: number,
    ) {
        return {
            data,
            meta: {
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
                hasNextPage: page < Math.ceil(total / pageSize),
                hasPreviousPage: page > 1,
            },
        };
    }
}