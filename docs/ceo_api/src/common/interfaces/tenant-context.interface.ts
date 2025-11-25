export interface TenantContext {
    tenantId: number;
    tenantNome: string;
    tenantDatabase: string;
    empresaId?: number; // Empresa atual do utilizador
}

