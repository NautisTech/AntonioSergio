// ==================== ENUMS ====================

export type ProductType = 'product' | 'service'

export type ProductStatus = 'active' | 'inactive' | 'discontinued' | 'out_of_stock'

export type StockMovementType =
    | 'purchase'
    | 'sale'
    | 'adjustment'
    | 'return'
    | 'transfer'
    | 'damaged'
    | 'lost'
    | 'initial'

export type UnitOfMeasure =
    | 'unit'
    | 'kg'
    | 'liter'
    | 'meter'
    | 'hour'
    | 'box'
    | 'package'

export type VATCode = 'NOR' | 'RED' | 'INT' | 'ISE'

// ==================== SUB-TYPES ====================

export interface ProductVariant {
    id?: number
    name: string
    value: string
    skuSuffix?: string
    priceAdjustment?: number
    stock?: number
}

export interface ProductImage {
    id?: number
    url: string
    caption?: string
    isPrimary?: boolean
    order?: number
}

export interface BundleItem {
    id?: number
    productId: number
    quantity: number
    discount?: number
}

// ==================== PRODUCT TYPES ====================

export interface Product {
    id: number
    code: string
    name: string
    description?: string
    type: ProductType
    category?: string
    subcategory?: string
    unit: UnitOfMeasure
    costPrice?: number
    salePrice: number
    promotionalPrice?: number
    promotionStartDate?: string
    promotionEndDate?: string
    profitMargin?: number
    vatRate: number
    vatCode?: VATCode
    currentStock?: number
    minStock?: number
    maxStock?: number
    reorderPoint?: number
    reorderQuantity?: number
    weight?: number
    dimensions?: string
    barcode?: string
    supplierReference?: string
    supplierId?: number
    supplier_name?: string
    leadTimeDays?: number
    warrantyMonths?: number
    images?: ProductImage[]
    variants?: ProductVariant[]
    bundleItems?: BundleItem[]
    notes?: string
    status?: ProductStatus
    isFeatured?: boolean
    visibleInCatalog?: boolean
    allowBackorders?: boolean
    trackStock?: boolean
    isTaxable?: boolean
    createdAt: string
    updatedAt?: string
    deletedAt?: string
    createdBy?: number
    updatedBy?: number
    deletedBy?: number
}

export interface CreateProductDto {
    code: string
    name: string
    description?: string
    type: ProductType
    category?: string
    subcategory?: string
    unit: UnitOfMeasure
    costPrice?: number
    salePrice: number
    promotionalPrice?: number
    promotionStartDate?: string
    promotionEndDate?: string
    profitMargin?: number
    vatRate: number
    vatCode?: VATCode
    currentStock?: number
    minStock?: number
    maxStock?: number
    reorderPoint?: number
    reorderQuantity?: number
    weight?: number
    dimensions?: string
    barcode?: string
    supplierReference?: string
    supplierId?: number
    leadTimeDays?: number
    warrantyMonths?: number
    images?: ProductImage[]
    variants?: ProductVariant[]
    bundleItems?: BundleItem[]
    notes?: string
    isFeatured?: boolean
    visibleInCatalog?: boolean
    allowBackorders?: boolean
    trackStock?: boolean
    isTaxable?: boolean
}

export interface UpdateProductDto {
    code?: string
    name?: string
    description?: string
    type?: ProductType
    category?: string
    subcategory?: string
    unit?: UnitOfMeasure
    costPrice?: number
    salePrice?: number
    promotionalPrice?: number
    promotionStartDate?: string
    promotionEndDate?: string
    profitMargin?: number
    vatRate?: number
    vatCode?: VATCode
    currentStock?: number
    minStock?: number
    maxStock?: number
    reorderPoint?: number
    reorderQuantity?: number
    weight?: number
    dimensions?: string
    barcode?: string
    supplierReference?: string
    supplierId?: number
    leadTimeDays?: number
    warrantyMonths?: number
    images?: ProductImage[]
    variants?: ProductVariant[]
    bundleItems?: BundleItem[]
    notes?: string
    status?: ProductStatus
    isFeatured?: boolean
    visibleInCatalog?: boolean
    allowBackorders?: boolean
    trackStock?: boolean
    isTaxable?: boolean
}

export interface ProductListFilters {
    type?: ProductType
    category?: string
    subcategory?: string
    status?: ProductStatus
    active?: boolean
    isFeatured?: boolean
    visibleInCatalog?: boolean
    lowStock?: boolean
    outOfStock?: boolean
    supplierId?: number
    minPrice?: number
    maxPrice?: number
    search?: string
    page?: number
    pageSize?: number
}

export interface ProductListResponse {
    data: Product[]
    total: number
    page: number
    pageSize: number
}

// ==================== STOCK MANAGEMENT ====================

export interface AdjustStockDto {
    quantity: number
    movementType: StockMovementType
    reference?: string
    notes?: string
    unitCost?: number
}

export interface StockMovement {
    id: number
    productId: number
    quantity: number
    movementType: StockMovementType
    reference?: string
    notes?: string
    unitCost?: number
    previousStock: number
    newStock: number
    createdAt: string
    createdBy?: number
}

// ==================== BULK OPERATIONS ====================

export interface BulkPriceUpdateDto {
    productIds: number[]
    percentageAdjustment?: number
    fixedAdjustment?: number
    newVatRate?: number
}

// ==================== UTILITIES ====================

export interface CalculatePriceDto {
    costPrice: number
    profitMargin: number
    vatRate?: number
}

export interface CalculatePriceResponse {
    costPrice: number
    profitMargin: number
    vatRate: number
    salePriceBeforeVAT: number
    salePriceWithVAT: number
    profit: number
    vatAmount: number
}

export interface Category {
    category: string
    count: number
}

// ==================== STATISTICS ====================

export interface ProductStats {
    totalProducts: number
    activeProducts: number
    outOfStock: number
    lowStock: number
    totalInventoryValueCost: number
    totalInventoryValueSale: number
    byCategory: Array<{
        category: string
        count: number
        totalValue: number
    }>
    byType: {
        product: { count: number; value: number }
        service: { count: number; value: number }
    }
    topProductsByValue: Array<{
        productId: number
        productCode: string
        productName: string
        stock: number
        value: number
    }>
}
