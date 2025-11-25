// ==================== ENUMS ====================

export type EquipmentStatus = 'operational' | 'maintenance' | 'broken' | 'inactive' | 'retired' | 'in_repair'
export type EquipmentCondition = 'new' | 'excellent' | 'good' | 'fair' | 'poor'
export type MaintenanceType = 'preventive' | 'corrective' | 'upgrade' | 'cleaning' | 'inspection' | 'calibration'
export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
export type AssignmentType = 'employee_assignment' | 'location_change' | 'department_transfer' | 'loan' | 'return'

// ==================== BRANDS ====================

export interface Brand {
    id: number
    name: string
    logoUrl?: string
    website?: string
    readingCode?: string
    readingType?: string
    supportEmail?: string
    supportPhone?: string
    supportLink?: string
    active: boolean
    createdAt: string
    updatedAt?: string
    deletedAt?: string
}

export interface CreateBrandDto {
    name: string
    logoUrl?: string
    website?: string
    readingCode?: string
    readingType?: string
    supportEmail?: string
    supportPhone?: string
    supportLink?: string
    active?: boolean
}

export interface UpdateBrandDto {
    name?: string
    logoUrl?: string
    website?: string
    readingCode?: string
    readingType?: string
    supportEmail?: string
    supportPhone?: string
    supportLink?: string
    active?: boolean
}

export interface BrandListFilters {
    active?: boolean
    search?: string
    page?: number
    pageSize?: number
}

export interface BrandListResponse {
    data: Brand[]
    total: number
    page: number
    pageSize: number
}

// ==================== CATEGORIES ====================

export interface EquipmentCategory {
    id: number
    name: string
    icon?: string
    color?: string
    description?: string
    defaultLifespanMonths?: number
    defaultDepreciationRate?: number
    active: boolean
    createdAt: string
    updatedAt?: string
    deletedAt?: string
}

export interface CreateCategoryDto {
    name: string
    icon?: string
    color?: string
    description?: string
    defaultLifespanMonths?: number
    defaultDepreciationRate?: number
    active?: boolean
}

export interface UpdateCategoryDto {
    name?: string
    icon?: string
    color?: string
    description?: string
    defaultLifespanMonths?: number
    defaultDepreciationRate?: number
    active?: boolean
}

export interface CategoryListFilters {
    active?: boolean
    search?: string
    page?: number
    pageSize?: number
}

export interface CategoryListResponse {
    data: EquipmentCategory[]
    total: number
    page: number
    pageSize: number
}

// ==================== MODELS ====================

export interface EquipmentModel {
    id: number
    name: string
    code: string
    brandId: number
    brand_name?: string
    categoryId: number
    category_name?: string
    description?: string
    specifications?: Record<string, any>
    imageUrl?: string
    expectedLifespanMonths?: number
    defaultWarrantyMonths?: number
    maintenanceIntervalDays?: number
    active: boolean
    createdAt: string
    updatedAt?: string
    deletedAt?: string
}

export interface CreateModelDto {
    name: string
    code: string
    brandId: number
    categoryId: number
    description?: string
    specifications?: Record<string, any>
    imageUrl?: string
    expectedLifespanMonths?: number
    defaultWarrantyMonths?: number
    maintenanceIntervalDays?: number
    active?: boolean
}

export interface UpdateModelDto {
    name?: string
    code?: string
    brandId?: number
    categoryId?: number
    description?: string
    specifications?: Record<string, any>
    imageUrl?: string
    expectedLifespanMonths?: number
    defaultWarrantyMonths?: number
    maintenanceIntervalDays?: number
    active?: boolean
}

export interface ModelListFilters {
    brandId?: number
    categoryId?: number
    active?: boolean
    search?: string
    page?: number
    pageSize?: number
}

export interface ModelListResponse {
    data: EquipmentModel[]
    total: number
    page: number
    pageSize: number
}

// ==================== EQUIPMENT ====================

export interface Equipment {
    id: number
    modelId: number
    model_name?: string
    model_code?: string
    brand_name?: string
    category_name?: string
    serialNumber: string
    internalNumber: string
    description?: string
    location?: string
    responsibleId?: number
    responsible_name?: string
    userId?: number
    user_name?: string
    acquisitionDate?: string
    acquisitionValue?: number
    supplier?: string
    warrantyExpirationDate?: string
    nextMaintenanceDate?: string
    status: EquipmentStatus
    condition: EquipmentCondition
    purchaseOrderNumber?: string
    invoiceNumber?: string
    notes?: string
    photoUrl?: string
    active: boolean
    createdAt: string
    updatedAt?: string
    deletedAt?: string
    createdBy?: number
    updatedBy?: number
}

export interface CreateEquipmentDto {
    modelId: number
    serialNumber: string
    internalNumber: string
    description?: string
    location?: string
    responsibleId?: number
    userId?: number
    acquisitionDate?: string
    acquisitionValue?: number
    supplier?: string
    warrantyExpirationDate?: string
    nextMaintenanceDate?: string
    status?: EquipmentStatus
    condition?: EquipmentCondition
    purchaseOrderNumber?: string
    invoiceNumber?: string
    notes?: string
    photoUrl?: string
    active?: boolean
}

export interface UpdateEquipmentDto {
    modelId?: number
    serialNumber?: string
    internalNumber?: string
    description?: string
    location?: string
    responsibleId?: number
    userId?: number
    acquisitionDate?: string
    acquisitionValue?: number
    supplier?: string
    warrantyExpirationDate?: string
    nextMaintenanceDate?: string
    status?: EquipmentStatus
    condition?: EquipmentCondition
    purchaseOrderNumber?: string
    invoiceNumber?: string
    notes?: string
    photoUrl?: string
    active?: boolean
}

export interface EquipmentListFilters {
    modelId?: number
    responsibleId?: number
    userId?: number
    status?: EquipmentStatus
    location?: string
    search?: string
    active?: boolean
    page?: number
    pageSize?: number
}

export interface EquipmentListResponse {
    data: Equipment[]
    total: number
    page: number
    pageSize: number
}

export interface EquipmentDashboardStats {
    totalEquipment: number
    operational: number
    inMaintenance: number
    broken: number
    totalValue: number
    warrantiesExpiringSoon: number
    maintenancesDue: number
    assignedEquipment: number
    unassignedEquipment: number
    byCategory: Array<{
        category: string
        count: number
        value: number
    }>
    byStatus: Array<{
        status: string
        count: number
    }>
    byCondition: Array<{
        condition: string
        count: number
    }>
}

// ==================== MAINTENANCE ====================

export interface EquipmentMaintenance {
    id: number
    equipmentId: number
    equipment_internal_number?: string
    equipment_model_name?: string
    type: MaintenanceType
    scheduledDate: string
    description?: string
    performedBy?: number
    performer_name?: string
    estimatedCost?: number
    actualCost?: number
    completionDate?: string
    status: MaintenanceStatus
    serviceProvider?: string
    partsReplaced?: Record<string, any>
    notes?: string
    createdAt: string
    updatedAt?: string
    deletedAt?: string
    createdBy?: number
}

export interface CreateMaintenanceDto {
    equipmentId: number
    type: MaintenanceType
    scheduledDate: string
    description?: string
    performedBy?: number
    estimatedCost?: number
    actualCost?: number
    completionDate?: string
    status?: MaintenanceStatus
    serviceProvider?: string
    partsReplaced?: Record<string, any>
    notes?: string
}

export interface UpdateMaintenanceDto {
    equipmentId?: number
    type?: MaintenanceType
    scheduledDate?: string
    description?: string
    performedBy?: number
    estimatedCost?: number
    actualCost?: number
    completionDate?: string
    status?: MaintenanceStatus
    serviceProvider?: string
    partsReplaced?: Record<string, any>
    notes?: string
}

export interface MaintenanceStats {
    totalMaintenances: number
    scheduled: number
    inProgress: number
    completed: number
    cancelled: number
    totalCost: number
    averageCost: number
    byType: Array<{
        type: string
        count: number
        totalCost: number
    }>
}

// ==================== ASSIGNMENTS ====================

export interface EquipmentAssignment {
    id: number
    equipmentId: number
    equipment_internal_number?: string
    equipment_model_name?: string
    type: AssignmentType
    assignedToEmployeeId?: number
    employee_name?: string
    assignedToUserId?: number
    user_name?: string
    location?: string
    department?: string
    startDate: string
    expectedReturnDate?: string
    actualReturnDate?: string
    notes?: string
    assignedBy?: number
    assigned_by_name?: string
    createdAt: string
    updatedAt?: string
    deletedAt?: string
}

export interface CreateAssignmentDto {
    equipmentId: number
    type: AssignmentType
    assignedToEmployeeId?: number
    assignedToUserId?: number
    location?: string
    department?: string
    startDate: string
    expectedReturnDate?: string
    actualReturnDate?: string
    notes?: string
    assignedBy?: number
}

export interface UpdateAssignmentDto {
    actualReturnDate?: string
    notes?: string
}

export interface AssignmentStats {
    totalAssignments: number
    activeAssignments: number
    overdueReturns: number
    byType: Array<{
        type: string
        count: number
    }>
    byEmployee: Array<{
        employeeId: number
        employeeName: string
        count: number
    }>
}
