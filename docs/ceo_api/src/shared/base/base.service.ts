import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { QueryOptions, PaginationOptions, PaginatedResponse } from '../interfaces/query-options.interface';
import * as sql from 'mssql';

@Injectable()
export abstract class BaseService {
    constructor(protected databaseService: DatabaseService) { }

    /**
     * Execute raw query on tenant database
     * @param tenantId - Tenant ID
     * @param query - SQL query
     * @param params - Query parameters
     * @param options - Query options (soft delete, types)
     */
    protected async executeQuery<T = any>(
        tenantId: number,
        query: string,
        params?: Record<string, any>,
        options?: QueryOptions,
    ): Promise<T[]> {
        const pool = await this.databaseService.getTenantConnection(tenantId);
        const request = pool.request();

        // Add parameters with types if provided
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                const type = options?.types?.[key];
                if (type) {
                    request.input(key, type, value);
                } else {
                    request.input(key, value);
                }
            });
        }

        const result = await request.query(query);
        return result.recordset as T[];
    }

    /**
     * Execute stored procedure on tenant database
     * @param tenantId - Tenant ID
     * @param procedureName - Stored procedure name
     * @param params - Procedure parameters
     * @param options - Query options
     */
    protected async executeProcedure<T = any>(
        tenantId: number,
        procedureName: string,
        params?: Record<string, any>,
        options?: QueryOptions,
    ): Promise<T[]> {
        const pool = await this.databaseService.getTenantConnection(tenantId);
        const request = pool.request();

        // Add parameters with types
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                const type = options?.types?.[key];
                if (type) {
                    request.input(key, type, value);
                } else {
                    request.input(key, value);
                }
            });
        }

        const result = await request.execute(procedureName);
        return result.recordset as T[];
    }

    /**
     * Execute paginated query with automatic soft delete filtering
     * @param tenantId - Tenant ID
     * @param baseQuery - Base SELECT query (without ORDER BY and pagination)
     * @param params - Query parameters
     * @param options - Pagination and query options
     */
    protected async executePaginatedQuery<T = any>(
        tenantId: number,
        baseQuery: string,
        params: Record<string, any> = {},
        options: PaginationOptions = {},
    ): Promise<PaginatedResponse<T>> {
        const {
            page = 1,
            pageSize = 50,
            orderBy = 'id',
            orderDirection = 'DESC',
            includeSoftDeleted = false,
        } = options;

        const offset = (page - 1) * pageSize;

        // Add soft delete filter if not already present and not explicitly disabled
        let finalQuery = baseQuery;
        if (!includeSoftDeleted && !baseQuery.toLowerCase().includes('deleted_at')) {
            // Add WHERE or AND depending on query structure
            if (baseQuery.toLowerCase().includes('where')) {
                finalQuery = `${baseQuery} AND deleted_at IS NULL`;
            } else {
                finalQuery = `${baseQuery} WHERE deleted_at IS NULL`;
            }
        }

        // Build paginated query
        const paginatedQuery = `
            ${finalQuery}
            ORDER BY ${orderBy} ${orderDirection}
            OFFSET @offset ROWS
            FETCH NEXT @pageSize ROWS ONLY
        `;

        // Build count query
        const countQuery = `
            SELECT COUNT(*) as total
            FROM (${finalQuery}) as countTable
        `;

        const pool = await this.databaseService.getTenantConnection(tenantId);

        // Execute count query
        const countRequest = pool.request();
        Object.entries(params).forEach(([key, value]) => {
            const type = options.types?.[key];
            if (type) {
                countRequest.input(key, type, value);
            } else {
                countRequest.input(key, value);
            }
        });
        const countResult = await countRequest.query(countQuery);
        const total = countResult.recordset[0]?.total || 0;

        // Execute data query
        const dataRequest = pool.request();
        Object.entries({ ...params, offset, pageSize }).forEach(([key, value]) => {
            const type = options.types?.[key];
            if (type) {
                dataRequest.input(key, type, value);
            } else {
                dataRequest.input(key, value);
            }
        });
        const dataResult = await dataRequest.query(paginatedQuery);

        const totalPages = Math.ceil(total / pageSize);

        return {
            data: dataResult.recordset as T[],
            meta: {
                total,
                page,
                pageSize,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }

    /**
     * Find one record by ID with automatic soft delete filtering
     * @param tenantId - Tenant ID
     * @param tableName - Table name
     * @param id - Record ID
     * @param options - Query options
     */
    protected async findById<T = any>(
        tenantId: number,
        tableName: string,
        id: number | string,
        options?: QueryOptions,
    ): Promise<T | null> {
        const softDeleteFilter = options?.includeSoftDeleted ? '' : 'AND deleted_at IS NULL';

        const query = `
            SELECT *
            FROM ${tableName}
            WHERE id = @id
            ${softDeleteFilter}
        `;

        const result = await this.executeQuery<T>(
            tenantId,
            query,
            { id },
            options,
        );

        return result[0] || null;
    }

    /**
     * Find all records from a table with automatic soft delete filtering
     * @param tenantId - Tenant ID
     * @param tableName - Table name
     * @param options - Query options
     */
    protected async findAll<T = any>(
        tenantId: number,
        tableName: string,
        options?: QueryOptions,
    ): Promise<T[]> {
        const softDeleteFilter = options?.includeSoftDeleted ? '' : 'WHERE deleted_at IS NULL';

        const query = `
            SELECT *
            FROM ${tableName}
            ${softDeleteFilter}
            ORDER BY id DESC
        `;

        return this.executeQuery<T>(tenantId, query, {}, options);
    }

    /**
     * Soft delete a record
     * @param tenantId - Tenant ID
     * @param tableName - Table name
     * @param id - Record ID
     * @param userId - User performing the delete
     */
    protected async softDelete(
        tenantId: number,
        tableName: string,
        id: number | string,
        userId?: number,
    ): Promise<boolean> {
        const pool = await this.databaseService.getTenantConnection(tenantId);

        const query = `
            UPDATE ${tableName}
            SET deleted_at = GETDATE()
                ${userId ? ', updated_by = @userId' : ''}
            WHERE id = @id
              AND deleted_at IS NULL
        `;

        const request = pool.request();
        request.input('id', id);
        if (userId) {
            request.input('userId', sql.Int, userId);
        }

        const result = await request.query(query);
        return result.rowsAffected[0] > 0;
    }

    /**
     * Restore a soft-deleted record
     * @param tenantId - Tenant ID
     * @param tableName - Table name
     * @param id - Record ID
     * @param userId - User performing the restore
     */
    protected async restore(
        tenantId: number,
        tableName: string,
        id: number | string,
        userId?: number,
    ): Promise<boolean> {
        const pool = await this.databaseService.getTenantConnection(tenantId);

        const query = `
            UPDATE ${tableName}
            SET deleted_at = NULL
                ${userId ? ', updated_by = @userId' : ''}
            WHERE id = @id
              AND deleted_at IS NOT NULL
        `;

        const request = pool.request();
        request.input('id', id);
        if (userId) {
            request.input('userId', sql.Int, userId);
        }

        const result = await request.query(query);
        return result.rowsAffected[0] > 0;
    }
}
