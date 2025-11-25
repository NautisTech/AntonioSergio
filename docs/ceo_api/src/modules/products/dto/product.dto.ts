import {
  IsInt,
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsDateString,
  IsArray,
  ValidateNested,
  Min,
  Max,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// ========================
// Enums
// ========================

export enum ProductType {
  PRODUCT = 'product',
  SERVICE = 'service',
}

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONTINUED = 'discontinued',
  OUT_OF_STOCK = 'out_of_stock',
}

export enum StockMovementType {
  PURCHASE = 'purchase',
  SALE = 'sale',
  ADJUSTMENT = 'adjustment',
  RETURN = 'return',
  TRANSFER = 'transfer',
  DAMAGED = 'damaged',
  LOST = 'lost',
  INITIAL = 'initial',
}

export enum UnitOfMeasure {
  UNIT = 'unit',
  KG = 'kg',
  LITER = 'liter',
  METER = 'meter',
  HOUR = 'hour',
  BOX = 'box',
  PACKAGE = 'package',
}

export enum VATCode {
  NORMAL = 'NOR', // 23%
  REDUCED = 'RED', // 13%
  INTERMEDIATE = 'INT', // 6%
  EXEMPT = 'ISE', // 0%
}

// ========================
// Sub-DTOs
// ========================

export class ProductVariantDto {
  @ApiProperty({ description: 'Variant name (e.g., Size, Color)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Variant value (e.g., Large, Red)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  value: string;

  @ApiPropertyOptional({ description: 'SKU suffix for this variant' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  skuSuffix?: string;

  @ApiPropertyOptional({ description: 'Price adjustment for this variant' })
  @IsOptional()
  @IsNumber()
  priceAdjustment?: number;

  @ApiPropertyOptional({ description: 'Stock for this variant' })
  @IsOptional()
  @IsNumber()
  stock?: number;
}

export class ProductImageDto {
  @ApiProperty({ description: 'Image URL' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ description: 'Image caption/alt text' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  caption?: string;

  @ApiPropertyOptional({ description: 'Is primary image', default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsInt()
  order?: number;
}

export class BundleItemDto {
  @ApiProperty({ description: 'Product ID in bundle' })
  @IsInt()
  productId: number;

  @ApiProperty({ description: 'Quantity in bundle' })
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @ApiPropertyOptional({ description: 'Discount percentage for this item' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discount?: number;
}

// ========================
// Main DTOs
// ========================

export class CreateProductDto {
  @ApiProperty({ description: 'Product code/SKU', example: 'PRD-001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiProperty({ description: 'Product name', example: 'Professional Laptop' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Detailed description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Product type', enum: ProductType })
  @IsEnum(ProductType)
  type: ProductType;

  @ApiPropertyOptional({ description: 'Product category', example: 'Electronics' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({ description: 'Product subcategory', example: 'Computers' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  subcategory?: string;

  @ApiProperty({ description: 'Unit of measure', enum: UnitOfMeasure })
  @IsEnum(UnitOfMeasure)
  unit: UnitOfMeasure;

  @ApiPropertyOptional({ description: 'Cost price', example: 800.00 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiProperty({ description: 'Sale price', example: 1200.00 })
  @IsNumber()
  @Min(0)
  salePrice: number;

  @ApiPropertyOptional({ description: 'Promotional price', example: 1050.00 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  promotionalPrice?: number;

  @ApiPropertyOptional({ description: 'Promotion start date' })
  @IsOptional()
  @IsDateString()
  promotionStartDate?: string;

  @ApiPropertyOptional({ description: 'Promotion end date' })
  @IsOptional()
  @IsDateString()
  promotionEndDate?: string;

  @ApiPropertyOptional({ description: 'Profit margin percentage', example: 33.33 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  profitMargin?: number;

  @ApiProperty({ description: 'VAT rate percentage', example: 23 })
  @IsNumber()
  @Min(0)
  @Max(100)
  vatRate: number;

  @ApiPropertyOptional({ description: 'VAT code', enum: VATCode })
  @IsOptional()
  @IsEnum(VATCode)
  vatCode?: VATCode;

  @ApiPropertyOptional({ description: 'Current stock', example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentStock?: number;

  @ApiPropertyOptional({ description: 'Minimum stock threshold', example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minStock?: number;

  @ApiPropertyOptional({ description: 'Maximum stock', example: 500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxStock?: number;

  @ApiPropertyOptional({ description: 'Reorder point', example: 20 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reorderPoint?: number;

  @ApiPropertyOptional({ description: 'Reorder quantity', example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reorderQuantity?: number;

  @ApiPropertyOptional({ description: 'Weight in kg', example: 1.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ description: 'Dimensions (LxWxH)', example: '30x20x5 cm' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  dimensions?: string;

  @ApiPropertyOptional({ description: 'Barcode/EAN', example: '1234567890123' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  barcode?: string;

  @ApiPropertyOptional({ description: 'Supplier reference code' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  supplierReference?: string;

  @ApiPropertyOptional({ description: 'Supplier ID' })
  @IsOptional()
  @IsInt()
  supplierId?: number;

  @ApiPropertyOptional({ description: 'Lead time in days', example: 7 })
  @IsOptional()
  @IsInt()
  @Min(0)
  leadTimeDays?: number;

  @ApiPropertyOptional({ description: 'Warranty period in months', example: 24 })
  @IsOptional()
  @IsInt()
  @Min(0)
  warrantyMonths?: number;

  @ApiPropertyOptional({ description: 'Product images' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];

  @ApiPropertyOptional({ description: 'Product variants' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];

  @ApiPropertyOptional({ description: 'Bundle items (if this is a bundle product)' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BundleItemDto)
  bundleItems?: BundleItemDto[];

  @ApiPropertyOptional({ description: 'Notes and observations' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Is featured product', default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Visible in catalog', default: true })
  @IsOptional()
  @IsBoolean()
  visibleInCatalog?: boolean;

  @ApiPropertyOptional({ description: 'Allow backorders', default: false })
  @IsOptional()
  @IsBoolean()
  allowBackorders?: boolean;

  @ApiPropertyOptional({ description: 'Track stock', default: true })
  @IsOptional()
  @IsBoolean()
  trackStock?: boolean;

  @ApiPropertyOptional({ description: 'Is taxable', default: true })
  @IsOptional()
  @IsBoolean()
  isTaxable?: boolean;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ description: 'Product code/SKU' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @ApiPropertyOptional({ description: 'Product name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'Detailed description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Product type', enum: ProductType })
  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;

  @ApiPropertyOptional({ description: 'Product category' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({ description: 'Product subcategory' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  subcategory?: string;

  @ApiPropertyOptional({ description: 'Unit of measure', enum: UnitOfMeasure })
  @IsOptional()
  @IsEnum(UnitOfMeasure)
  unit?: UnitOfMeasure;

  @ApiPropertyOptional({ description: 'Cost price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiPropertyOptional({ description: 'Sale price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @ApiPropertyOptional({ description: 'Promotional price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  promotionalPrice?: number;

  @ApiPropertyOptional({ description: 'Promotion start date' })
  @IsOptional()
  @IsDateString()
  promotionStartDate?: string;

  @ApiPropertyOptional({ description: 'Promotion end date' })
  @IsOptional()
  @IsDateString()
  promotionEndDate?: string;

  @ApiPropertyOptional({ description: 'Profit margin percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  profitMargin?: number;

  @ApiPropertyOptional({ description: 'VAT rate percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  vatRate?: number;

  @ApiPropertyOptional({ description: 'VAT code', enum: VATCode })
  @IsOptional()
  @IsEnum(VATCode)
  vatCode?: VATCode;

  @ApiPropertyOptional({ description: 'Current stock' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentStock?: number;

  @ApiPropertyOptional({ description: 'Minimum stock threshold' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minStock?: number;

  @ApiPropertyOptional({ description: 'Maximum stock' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxStock?: number;

  @ApiPropertyOptional({ description: 'Reorder point' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reorderPoint?: number;

  @ApiPropertyOptional({ description: 'Reorder quantity' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reorderQuantity?: number;

  @ApiPropertyOptional({ description: 'Weight in kg' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ description: 'Dimensions (LxWxH)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  dimensions?: string;

  @ApiPropertyOptional({ description: 'Barcode/EAN' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  barcode?: string;

  @ApiPropertyOptional({ description: 'Supplier reference code' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  supplierReference?: string;

  @ApiPropertyOptional({ description: 'Supplier ID' })
  @IsOptional()
  @IsInt()
  supplierId?: number;

  @ApiPropertyOptional({ description: 'Lead time in days' })
  @IsOptional()
  @IsInt()
  @Min(0)
  leadTimeDays?: number;

  @ApiPropertyOptional({ description: 'Warranty period in months' })
  @IsOptional()
  @IsInt()
  @Min(0)
  warrantyMonths?: number;

  @ApiPropertyOptional({ description: 'Product images' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];

  @ApiPropertyOptional({ description: 'Product variants' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];

  @ApiPropertyOptional({ description: 'Bundle items' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BundleItemDto)
  bundleItems?: BundleItemDto[];

  @ApiPropertyOptional({ description: 'Notes and observations' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Product status', enum: ProductStatus })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ description: 'Is featured product' })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Visible in catalog' })
  @IsOptional()
  @IsBoolean()
  visibleInCatalog?: boolean;

  @ApiPropertyOptional({ description: 'Allow backorders' })
  @IsOptional()
  @IsBoolean()
  allowBackorders?: boolean;

  @ApiPropertyOptional({ description: 'Track stock' })
  @IsOptional()
  @IsBoolean()
  trackStock?: boolean;

  @ApiPropertyOptional({ description: 'Is taxable' })
  @IsOptional()
  @IsBoolean()
  isTaxable?: boolean;
}

export class AdjustStockDto {
  @ApiProperty({ description: 'Quantity to add (positive) or subtract (negative)', example: -5 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Movement type', enum: StockMovementType })
  @IsEnum(StockMovementType)
  movementType: StockMovementType;

  @ApiPropertyOptional({ description: 'Reference document (e.g., PO number, invoice number)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reference?: string;

  @ApiPropertyOptional({ description: 'Movement notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Unit cost for this movement (for purchase/sale)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitCost?: number;
}

export class BulkPriceUpdateDto {
  @ApiProperty({ description: 'Product IDs to update' })
  @IsArray()
  @IsInt({ each: true })
  productIds: number[];

  @ApiPropertyOptional({ description: 'Percentage adjustment (e.g., 10 for +10%, -5 for -5%)' })
  @IsOptional()
  @IsNumber()
  percentageAdjustment?: number;

  @ApiPropertyOptional({ description: 'Fixed amount adjustment' })
  @IsOptional()
  @IsNumber()
  fixedAdjustment?: number;

  @ApiPropertyOptional({ description: 'New VAT rate' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  newVatRate?: number;
}

export class CalculatePriceDto {
  @ApiProperty({ description: 'Cost price', example: 800 })
  @IsNumber()
  @Min(0)
  costPrice: number;

  @ApiProperty({ description: 'Desired profit margin percentage', example: 33.33 })
  @IsNumber()
  @Min(0)
  @Max(100)
  profitMargin: number;

  @ApiPropertyOptional({ description: 'VAT rate percentage', example: 23 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  vatRate?: number;
}

export class ProductStatsDto {
  @ApiProperty({ description: 'Total products count' })
  totalProducts: number;

  @ApiProperty({ description: 'Active products' })
  activeProducts: number;

  @ApiProperty({ description: 'Out of stock products' })
  outOfStock: number;

  @ApiProperty({ description: 'Low stock products (below minimum)' })
  lowStock: number;

  @ApiProperty({ description: 'Total inventory value (at cost)' })
  totalInventoryValueCost: number;

  @ApiProperty({ description: 'Total inventory value (at sale price)' })
  totalInventoryValueSale: number;

  @ApiProperty({ description: 'Products by category' })
  byCategory: Array<{
    category: string;
    count: number;
    totalValue: number;
  }>;

  @ApiProperty({ description: 'Products by type' })
  byType: {
    product: { count: number; value: number };
    service: { count: number; value: number };
  };

  @ApiProperty({ description: 'Top products by value' })
  topProductsByValue: Array<{
    productId: number;
    productCode: string;
    productName: string;
    stock: number;
    value: number;
  }>;
}
