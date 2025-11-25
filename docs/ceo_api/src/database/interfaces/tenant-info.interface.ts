/**
 * Tenant Information Interface
 * Returned from database queries
 */
export interface TenantInfo {
    id: number;
    name: string;
    database_name: string;
    slug?: string;
}

/**
 * Tenant Database Configuration
 */
export interface TenantDbConfig {
    server: string;
    port: number;
    user: string;
    password: string;
    database: string;
    options: {
        encrypt: boolean;
        trustServerCertificate: boolean;
    };
    pool: {
        max: number;
        min: number;
        idleTimeoutMillis: number;
    };
}

/**
 * Tenant Connection Pool
 */
export interface TenantConnection {
    pool: any; // sql.ConnectionPool
    lastUsed: Date;
    database: string;
}
