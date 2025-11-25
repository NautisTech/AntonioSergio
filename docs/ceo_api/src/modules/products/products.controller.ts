import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  AdjustStockDto,
  BulkPriceUpdateDto,
  CalculatePriceDto,
  ProductType,
  ProductStatus,
} from './dto/product.dto';

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ========================
  // General CRUD Operations
  // ========================

  @Get()
  @RequirePermissions('products.view')
  @ApiOperation({ summary: 'List all products with filtering and pagination' })
  @ApiQuery({ name: 'type', required: false, enum: ProductType, description: 'Filter by type' })
  @ApiQuery({ name: 'category', required: false, type: String, description: 'Filter by category' })
  @ApiQuery({ name: 'subcategory', required: false, type: String, description: 'Filter by subcategory' })
  @ApiQuery({ name: 'status', required: false, enum: ProductStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'active', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'isFeatured', required: false, type: Boolean, description: 'Filter featured products' })
  @ApiQuery({ name: 'visibleInCatalog', required: false, type: Boolean, description: 'Filter by catalog visibility' })
  @ApiQuery({ name: 'lowStock', required: false, type: Boolean, description: 'Show only low stock products' })
  @ApiQuery({ name: 'outOfStock', required: false, type: Boolean, description: 'Show only out of stock products' })
  @ApiQuery({ name: 'supplierId', required: false, type: Number, description: 'Filter by supplier ID' })
  @ApiQuery({ name: 'minPrice', required: false, type: Number, description: 'Minimum price' })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number, description: 'Maximum price' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by code, name or barcode' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Page size', example: 20 })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async findAll(
    @Request() req,
    @Query('type') type?: ProductType,
    @Query('category') category?: string,
    @Query('subcategory') subcategory?: string,
    @Query('status') status?: ProductStatus,
    @Query('active') active?: boolean,
    @Query('isFeatured') isFeatured?: boolean,
    @Query('visibleInCatalog') visibleInCatalog?: boolean,
    @Query('lowStock') lowStock?: boolean,
    @Query('outOfStock') outOfStock?: boolean,
    @Query('supplierId') supplierId?: number,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.productsService.findAll(req.user.tenantId, {
      type,
      category,
      subcategory,
      status,
      active,
      isFeatured,
      visibleInCatalog,
      lowStock,
      outOfStock,
      supplierId,
      minPrice,
      maxPrice,
      search,
      page,
      pageSize,
    });
  }

  @Get('stats')
  @RequirePermissions('products.view')
  @ApiOperation({ summary: 'Get product statistics (inventory value, categories, top products)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(@Request() req) {
    return this.productsService.getStats(req.user.tenantId);
  }

  @Get('categories')
  @RequirePermissions('products.view')
  @ApiOperation({ summary: 'Get list of available product categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  async getCategories(@Request() req) {
    return this.productsService.getCategories(req.user.tenantId);
  }

  @Get('low-stock')
  @RequirePermissions('products.view_stock')
  @ApiOperation({ summary: 'Get products with stock below minimum threshold' })
  @ApiResponse({ status: 200, description: 'Low stock products retrieved successfully' })
  async getLowStock(@Request() req) {
    return this.productsService.getLowStock(req.user.tenantId);
  }

  @Get('reorder-needed')
  @RequirePermissions('products.view_stock')
  @ApiOperation({ summary: 'Get products that have reached reorder point' })
  @ApiResponse({ status: 200, description: 'Reorder list retrieved successfully' })
  async getReorderNeeded(@Request() req) {
    return this.productsService.getReorderNeeded(req.user.tenantId);
  }

  @Get('code/:code')
  @RequirePermissions('products.view')
  @ApiOperation({ summary: 'Get product by code/SKU' })
  @ApiParam({ name: 'code', description: 'Product code', example: 'PRD-001' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findByCode(@Request() req, @Param('code') code: string) {
    return this.productsService.findByCode(req.user.tenantId, code);
  }

  @Get('barcode/:barcode')
  @RequirePermissions('products.view')
  @ApiOperation({ summary: 'Get product by barcode/EAN' })
  @ApiParam({ name: 'barcode', description: 'Product barcode', example: '1234567890123' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findByBarcode(@Request() req, @Param('barcode') barcode: string) {
    return this.productsService.findByBarcode(req.user.tenantId, barcode);
  }

  @Get(':id')
  @RequirePermissions('products.view')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findById(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.productsService.findById(req.user.tenantId, id);
  }

  @Post()
  @RequirePermissions('products.create')
  @ApiOperation({ summary: 'Create new product' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or duplicate code/barcode' })
  async create(@Request() req, @Body(ValidationPipe) dto: CreateProductDto) {
    return this.productsService.create(req.user.tenantId, dto, req.user.id);
  }

  @Put(':id')
  @RequirePermissions('products.update')
  @ApiOperation({ summary: 'Update product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 400, description: 'Invalid input or duplicate code/barcode' })
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateProductDto,
  ) {
    return this.productsService.update(req.user.tenantId, id, dto, req.user.id);
  }

  @Delete(':id')
  @RequirePermissions('products.delete')
  @ApiOperation({ summary: 'Delete product (soft delete)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async delete(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.productsService.delete(req.user.tenantId, id, req.user.id);
  }

  // ========================
  // Stock Operations
  // ========================

  @Patch(':id/stock')
  @RequirePermissions('products.manage_stock')
  @ApiOperation({ summary: 'Adjust product stock (add or subtract quantity)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiBody({ type: AdjustStockDto })
  @ApiResponse({ status: 200, description: 'Stock adjusted successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient stock or invalid quantity' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async adjustStock(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: AdjustStockDto,
  ) {
    return this.productsService.adjustStock(req.user.tenantId, id, dto, req.user.id);
  }

  // ========================
  // Bulk Operations
  // ========================

  @Post('bulk/price-update')
  @RequirePermissions('products.bulk_update')
  @ApiOperation({ summary: 'Bulk update prices for multiple products' })
  @ApiBody({ type: BulkPriceUpdateDto })
  @ApiResponse({ status: 200, description: 'Prices updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async bulkPriceUpdate(
    @Request() req,
    @Body(ValidationPipe) dto: BulkPriceUpdateDto,
  ) {
    return this.productsService.bulkPriceUpdate(req.user.tenantId, dto, req.user.id);
  }

  // ========================
  // Utilities
  // ========================

  @Post('calculate-price')
  @RequirePermissions('products.view')
  @ApiOperation({ summary: 'Calculate sale price based on cost and profit margin' })
  @ApiBody({ type: CalculatePriceDto })
  @ApiResponse({
    status: 200,
    description: 'Price calculated successfully',
    schema: {
      type: 'object',
      properties: {
        costPrice: { type: 'number', example: 800 },
        profitMargin: { type: 'number', example: 33.33 },
        vatRate: { type: 'number', example: 23 },
        salePriceBeforeVAT: { type: 'number', example: 1200 },
        salePriceWithVAT: { type: 'number', example: 1476 },
        profit: { type: 'number', example: 400 },
        vatAmount: { type: 'number', example: 276 },
      },
    },
  })
  async calculatePrice(@Body(ValidationPipe) dto: CalculatePriceDto) {
    return this.productsService.calculatePrice(dto);
  }
}
