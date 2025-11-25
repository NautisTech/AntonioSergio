export interface UserPayload {
    sub: number; // userId
    username: string;
    email: string;
    tenantId: number;
    empresas: number[]; // IDs das empresas que o utilizador tem acesso
    empresaPrincipal: number;
    permissions: string[];
}