/**
 * Query execution options
 */
export interface QueryOptions {
    /**
     * Include soft-deleted records
     * @default false
     */
    includeSoftDeleted?: boolean;

    /**
     * SQL Server type mappings for parameters
     * Example: { id: sql.Int, name: sql.VarChar }
     */
    types?: Record<string, any>;
}

/**
 * Pagination options
 */
export interface PaginationOptions extends QueryOptions {
    /**
     * Current page number (1-indexed)
     * @default 1
     */
    page?: number;

    /**
     * Items per page
     * @default 50
     */
    pageSize?: number;

    /**
     * Column to order by
     * @default 'id'
     */
    orderBy?: string;

    /**
     * Sort direction
     * @default 'DESC'
     */
    orderDirection?: 'ASC' | 'DESC';
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}
