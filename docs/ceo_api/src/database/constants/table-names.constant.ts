/**
 * Database Table Names Constants
 * Centralized table names for better maintainability
 */

// Main Database Tables (ceo_main)
export const MAIN_TABLES = {
    TENANT: 'tenant',
    TENANT_MODULE: 'tenant_module',
    TENANT_SETTING: 'tenant_setting',
    TENANT_LOG: 'tenant_log',
    SUBSCRIPTION_PLAN: 'subscription_plan',
    MODULE: 'module',
    PERMISSION_TEMPLATE: 'permission_template',
} as const;

// Tenant Database Tables (tenant-specific)
export const TENANT_TABLES = {
    // Core
    USER: 'user',
    USER_PROFILE: 'user_profile',
    USER_PROFILE_PERMISSION: 'user_profile_permission',
    USER_USER_PROFILE: 'user_user_profile',
    PERMISSION: 'permission',
    COMPANY: 'company',

    // HR
    EMPLOYEE: 'employee',
    DEPARTMENT: 'department',

    // CRM
    CLIENT: 'client',
    SUPPLIER: 'supplier',
    LEAD: 'lead',

    // Sales
    PRODUCT: 'product',
    QUOTE: 'quote',
    ORDER: 'order',
    PAYMENT: 'payment',

    // Support
    SUPPORT_TICKET: 'support_ticket',
    EQUIPMENT: 'equipment',

    // Content
    CONTENT: 'content',
    TRAINING: 'training',
    FORUM_TOPIC: 'forum_topic',
    FORUM_POST: 'forum_post',

    // System
    CUSTOM_FIELD: 'custom_field',
    CUSTOM_FIELD_VALUE: 'custom_field_value',
    UPLOAD: 'upload',
    ADDRESS: 'address',
    DOCUMENT: 'document',
    EMAIL_LOG: 'email_log',
    SETTING: 'setting',
} as const;

// Common field names
export const COMMON_FIELDS = {
    ID: 'id',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
    DELETED_AT: 'deleted_at',
    CREATED_BY: 'created_by',
    UPDATED_BY: 'updated_by',
} as const;
