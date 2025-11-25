import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sql from 'mssql';
import { EncryptionService } from './services/encryption.service';
import { TenantConnection, TenantInfo, TenantDbConfig } from './interfaces/tenant-info.interface';
import { MAIN_TABLES } from './constants/table-names.constant';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
    private readonly logger = new Logger(DatabaseService.name);
    private mainPool: sql.ConnectionPool;
    private tenantPools: Map<number, TenantConnection> = new Map();
    private readonly POOL_TIMEOUT = 30 * 60 * 1000; // 30 minutes

    constructor(
        private configService: ConfigService,
        private encryptionService: EncryptionService,
    ) {
        this.initializeMainConnection();
        this.startPoolCleanup();
    }

    // Conexão principal (CEO_Main)
    private async initializeMainConnection() {
        const config = this.configService.get('database.main');
        this.mainPool = new sql.ConnectionPool(config);

        try {
            await this.mainPool.connect();
        } catch (error) {
            this.logger.error('Erro ao conectar ao banco de dados principal:', error);
            throw error;
        }
    }

    // Obter conexão principal
    getMainConnection(): sql.ConnectionPool {
        if (!this.mainPool?.connected) {
            throw new Error('Conexão principal não está disponível');
        }
        return this.mainPool;
    }

    // Obter ou criar conexão do tenant
    async getTenantConnection(tenantId: number): Promise<sql.ConnectionPool> {
        // Se já existir pool ativa, reutiliza
        const existing = this.tenantPools.get(tenantId);
        if (existing?.pool?.connected) {
            existing.lastUsed = new Date();
            return existing.pool;
        }

        // Buscar informações básicas do tenant (nome da base)
        const tenantInfo = await this.getTenantInfo(tenantId);
        if (!tenantInfo) {
            throw new Error(`Tenant ${tenantId} não encontrado`);
        }

        // Buscar configurações e chave de criptografia
        const tenantDbConfig = await this.getTenantDbConfig(tenantId, tenantInfo.database_name);

        // Criar nova conexão
        const pool = new sql.ConnectionPool(tenantDbConfig);
        await pool.connect();

        this.tenantPools.set(tenantId, {
            pool,
            lastUsed: new Date(),
            database: tenantDbConfig.database,
        });

        return pool;
    }

    // Busca o nome da base de dados do tenant
    private async getTenantInfo(tenantId: number): Promise<TenantInfo> {
        const result = await this.mainPool
            .request()
            .input('tenantId', sql.Int, tenantId)
            .query(`
                SELECT id, name, database_name
                FROM ${MAIN_TABLES.TENANT}
                WHERE id = @tenantId
                  AND deleted_at IS NULL
            `);

        return result.recordset[0];
    }

    async getTenantInfoBySlug(tenantSlug: string): Promise<TenantInfo> {
        const result = await this.mainPool
            .request()
            .input('tenantSlug', sql.VarChar, tenantSlug)
            .query(`
                SELECT id, name, database_name, slug
                FROM ${MAIN_TABLES.TENANT}
                WHERE slug = @tenantSlug
                  AND deleted_at IS NULL
            `);
        return result.recordset[0];
    }

    /**
     * Buscar todos os tenants que têm uma configuração específica ativada
     * @param settingKey Nome da configuração (ex: 'NOTICIAS_EXTERNAS')
     * @param expectedValue Valor esperado desencriptado (ex: '1')
     * @returns Lista de IDs dos tenants
     */
    async getTenantsWithConfig(settingKey: string, expectedValue: string = '1'): Promise<number[]> {
        const result = await this.mainPool
            .request()
            .input('settingKey', sql.VarChar, settingKey)
            .query(`
                SELECT DISTINCT tenant_id, value
                FROM ${MAIN_TABLES.TENANT_SETTING}
                WHERE setting_key = @settingKey
                  AND deleted_at IS NULL
            `);

        // Obter chave de encriptação do ambiente
        const masterKey = this.encryptionService.getMasterKey();

        // Desencriptar e filtrar
        const tenantIds: number[] = [];
        for (const row of result.recordset) {
            try {
                const decryptedValue = this.encryptionService.decrypt(row.value, masterKey);
                if (decryptedValue === expectedValue) {
                    tenantIds.push(row.tenant_id);
                }
            } catch (error) {
                this.logger.warn(`Erro ao desencriptar config ${settingKey} do tenant ${row.tenant_id}`);
            }
        }

        return tenantIds;
    }

    // Lê configurações da tabela tenant_setting
    private async getTenantDbConfig(tenantId: number, databaseName: string): Promise<TenantDbConfig> {
        const result = await this.mainPool
            .request()
            .input('tenantId', sql.Int, tenantId)
            .query(`
                SELECT setting_key, value
                FROM ${MAIN_TABLES.TENANT_SETTING}
                WHERE tenant_id = @tenantId
                  AND deleted_at IS NULL
            `);

        const configMap = Object.fromEntries(result.recordset.map(r => [r.setting_key, r.value]));

        // Obter chave de encriptação do ambiente
        const masterKey = this.encryptionService.getMasterKey();

        // usar a chave do ambiente para descriptografar
        const decrypt = (val: string) => this.encryptionService.decrypt(val, masterKey);

        // monta o config da conexão
        return {
            server: decrypt(configMap.DB_HOST),
            port: parseInt(decrypt(configMap.DB_PORT), 10),
            user: decrypt(configMap.DB_USER),
            password: decrypt(configMap.DB_PASSWORD),
            database: databaseName,
            options: {
                encrypt: process.env.DB_ENCRYPT === 'true',
                trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
            },
            pool: {
                max: 10,
                min: 0,
                idleTimeoutMillis: 30000,
            },
        };
    }

    /**
     * Get encryption service instance
     * For backwards compatibility and external access to encryption methods
     */
    getEncryptionService(): EncryptionService {
        return this.encryptionService;
    }

    // Limpar pools inativos
    private startPoolCleanup() {
        setInterval(() => {
            const now = new Date();

            this.tenantPools.forEach((connection, tenantId) => {
                const timeSinceLastUse = now.getTime() - connection.lastUsed.getTime();

                if (timeSinceLastUse > this.POOL_TIMEOUT) {
                    connection.pool.close();
                    this.tenantPools.delete(tenantId);
                }
            });
        }, 10 * 60 * 1000); // Verificar a cada 10 minutos
    }

    // Fechar todas as conexões
    async onModuleDestroy() {
        for (const [tenantId, connection] of this.tenantPools) {
            await connection.pool.close();
        }

        if (this.mainPool) {
            await this.mainPool.close();
        }
    }
}
