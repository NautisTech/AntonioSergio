import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../../database/database.service';
import {
  CreateProductDto,
  UpdateProductDto,
  AdjustStockDto,
  BulkPriceUpdateDto,
  CalculatePriceDto,
  ProductStatsDto,
  ProductType,
  ProductStatus,
  StockMovementType,
} from './dto/product.dto';

/**
 * Products Service
 *
 * NOTE: Currently using 'produtos' table (Portuguese schema).
 * In future schema migration, will use 'product' table (English schema v2.0).
 *
 * SECURITY FIXES:
 * - Fixed SQL injection vulnerabilities (lines 19, 23, 43 in old code)
 * - All queries now use parameterized inputs
 */
@Injectable()
export class ProductsService {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * List all products with filtering and pagination
   *
   * SECURITY FIX: Replaced string concatenation with parameterized queries
   */
  async findAll(tenantId: number, filters: any = {}) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Build WHERE clause with parameterized queries (FIX SQL INJECTION)
    const conditions: string[] = ['p.id > 0'];
    const request = pool.request();

    if (filters.type) {
      conditions.push('p.type = @type');
      request.input('type', sql.NVarChar, filters.type);
    }

    if (filters.category) {
      conditions.push('p.categoria = @category');
      request.input('category', sql.NVarChar, filters.category);
    }

    if (filters.subcategory) {
      conditions.push('p.subcategoria = @subcategory');
      request.input('subcategory', sql.NVarChar, filters.subcategory);
    }

    if (filters.status) {
      conditions.push('p.status = @status');
      request.input('status', sql.NVarChar, filters.status);
    }

    if (filters.active !== undefined) {
      conditions.push('p.ativo = @active');
      request.input('active', sql.Bit, filters.active ? 1 : 0);
    }

    if (filters.isFeatured !== undefined) {
      conditions.push('p.destaque = @isFeatured');
      request.input('isFeatured', sql.Bit, filters.isFeatured ? 1 : 0);
    }

    if (filters.visibleInCatalog !== undefined) {
      conditions.push('p.visivel_catalogo = @visibleInCatalog');
      request.input('visibleInCatalog', sql.Bit, filters.visibleInCatalog ? 1 : 0);
    }

    if (filters.lowStock) {
      conditions.push('p.stock_atual <= p.stock_minimo');
    }

    if (filters.outOfStock) {
      conditions.push('p.stock_atual <= 0');
    }

    if (filters.supplierId) {
      conditions.push('p.fornecedor_id = @supplierId');
      request.input('supplierId', sql.Int, filters.supplierId);
    }

    if (filters.minPrice) {
      conditions.push('p.preco_venda >= @minPrice');
      request.input('minPrice', sql.Decimal(15, 2), filters.minPrice);
    }

    if (filters.maxPrice) {
      conditions.push('p.preco_venda <= @maxPrice');
      request.input('maxPrice', sql.Decimal(15, 2), filters.maxPrice);
    }

    // FIX SQL INJECTION: Use parameterized LIKE queries
    if (filters.search) {
      conditions.push('(p.codigo LIKE @search OR p.name LIKE @search OR p.codigo_barras LIKE @search)');
      request.input('search', sql.NVarChar, `%${filters.search}%`);
    }

    const whereClause = conditions.join(' AND ');

    // Without pagination
    if (!filters.page || !filters.pageSize) {
      const result = await request.query(`
        SELECT
          p.*,
          f.name as fornecedor_name
        FROM produtos p
        LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
        WHERE ${whereClause}
        ORDER BY p.name
      `);

      return result.recordset;
    }

    // With pagination
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const offset = (page - 1) * pageSize;

    const countRequest = pool.request();
    // Re-add parameters for count query
    if (filters.type) countRequest.input('type', sql.NVarChar, filters.type);
    if (filters.category) countRequest.input('category', sql.NVarChar, filters.category);
    if (filters.subcategory) countRequest.input('subcategory', sql.NVarChar, filters.subcategory);
    if (filters.status) countRequest.input('status', sql.NVarChar, filters.status);
    if (filters.active !== undefined) countRequest.input('active', sql.Bit, filters.active ? 1 : 0);
    if (filters.isFeatured !== undefined) countRequest.input('isFeatured', sql.Bit, filters.isFeatured ? 1 : 0);
    if (filters.visibleInCatalog !== undefined) countRequest.input('visibleInCatalog', sql.Bit, filters.visibleInCatalog ? 1 : 0);
    if (filters.supplierId) countRequest.input('supplierId', sql.Int, filters.supplierId);
    if (filters.minPrice) countRequest.input('minPrice', sql.Decimal(15, 2), filters.minPrice);
    if (filters.maxPrice) countRequest.input('maxPrice', sql.Decimal(15, 2), filters.maxPrice);
    if (filters.search) countRequest.input('search', sql.NVarChar, `%${filters.search}%`);

    const countResult = await countRequest.query(`
      SELECT COUNT(*) as total FROM produtos p WHERE ${whereClause}
    `);

    request.input('offset', sql.Int, offset);
    request.input('pageSize', sql.Int, pageSize);

    const dataResult = await request.query(`
      SELECT
        p.*,
        f.name as fornecedor_name
      FROM produtos p
      LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
      WHERE ${whereClause}
      ORDER BY p.name
      OFFSET @offset ROWS
      FETCH NEXT @pageSize ROWS ONLY
    `);

    return {
      data: dataResult.recordset,
      total: countResult.recordset[0].total,
      page,
      pageSize,
      totalPages: Math.ceil(countResult.recordset[0].total / pageSize),
    };
  }

  /**
   * Get product by ID
   */
  async findById(tenantId: number, id: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT
          p.*,
          f.name as fornecedor_name,
          f.email as fornecedor_email,
          f.telefone as fornecedor_telefone
        FROM produtos p
        LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
        WHERE p.id = @id
      `);

    if (result.recordset.length === 0) {
      throw new NotFoundException('Product not found');
    }

    return result.recordset[0];
  }

  /**
   * Get product by code
   */
  async findByCode(tenantId: number, code: string) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request()
      .input('code', sql.NVarChar, code)
      .query(`
        SELECT
          p.*,
          f.name as fornecedor_name
        FROM produtos p
        LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
        WHERE p.codigo = @code
      `);

    if (result.recordset.length === 0) {
      throw new NotFoundException('Product not found');
    }

    return result.recordset[0];
  }

  /**
   * Get product by barcode
   */
  async findByBarcode(tenantId: number, barcode: string) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request()
      .input('barcode', sql.NVarChar, barcode)
      .query(`
        SELECT
          p.*,
          f.name as fornecedor_name
        FROM produtos p
        LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
        WHERE p.codigo_barras = @barcode
      `);

    if (result.recordset.length === 0) {
      throw new NotFoundException('Product not found');
    }

    return result.recordset[0];
  }

  /**
   * Create new product
   */
  async create(tenantId: number, dto: CreateProductDto, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if code already exists
    const codeCheck = await pool.request()
      .input('code', sql.NVarChar, dto.code)
      .query('SELECT id FROM produtos WHERE codigo = @code');

    if (codeCheck.recordset.length > 0) {
      throw new BadRequestException('Product code already exists');
    }

    // Check if barcode already exists (if provided)
    if (dto.barcode) {
      const barcodeCheck = await pool.request()
        .input('barcode', sql.NVarChar, dto.barcode)
        .query('SELECT id FROM produtos WHERE codigo_barras = @barcode');

      if (barcodeCheck.recordset.length > 0) {
        throw new BadRequestException('Barcode already exists');
      }
    }

    const result = await pool.request()
      .input('code', sql.NVarChar, dto.code)
      .input('name', sql.NVarChar, dto.name)
      .input('description', sql.NVarChar, dto.description || null)
      .input('type', sql.NVarChar, dto.type)
      .input('category', sql.NVarChar, dto.category || null)
      .input('subcategory', sql.NVarChar, dto.subcategory || null)
      .input('unit', sql.NVarChar, dto.unit)
      .input('costPrice', sql.Decimal(15, 2), dto.costPrice || null)
      .input('salePrice', sql.Decimal(15, 2), dto.salePrice)
      .input('promotionalPrice', sql.Decimal(15, 2), dto.promotionalPrice || null)
      .input('promotionStartDate', sql.DateTime2, dto.promotionStartDate || null)
      .input('promotionEndDate', sql.DateTime2, dto.promotionEndDate || null)
      .input('profitMargin', sql.Decimal(5, 2), dto.profitMargin || null)
      .input('vatRate', sql.Decimal(5, 2), dto.vatRate)
      .input('vatCode', sql.NVarChar, dto.vatCode || null)
      .input('currentStock', sql.Decimal(10, 2), dto.currentStock || 0)
      .input('minStock', sql.Decimal(10, 2), dto.minStock || null)
      .input('maxStock', sql.Decimal(10, 2), dto.maxStock || null)
      .input('reorderPoint', sql.Decimal(10, 2), dto.reorderPoint || null)
      .input('reorderQuantity', sql.Decimal(10, 2), dto.reorderQuantity || null)
      .input('weight', sql.Decimal(10, 3), dto.weight || null)
      .input('dimensions', sql.NVarChar, dto.dimensions || null)
      .input('barcode', sql.NVarChar, dto.barcode || null)
      .input('supplierReference', sql.NVarChar, dto.supplierReference || null)
      .input('supplierId', sql.Int, dto.supplierId || null)
      .input('leadTimeDays', sql.Int, dto.leadTimeDays || null)
      .input('warrantyMonths', sql.Int, dto.warrantyMonths || null)
      .input('notes', sql.NVarChar, dto.notes || null)
      .input('isFeatured', sql.Bit, dto.isFeatured ? 1 : 0)
      .input('visibleInCatalog', sql.Bit, dto.visibleInCatalog !== undefined ? (dto.visibleInCatalog ? 1 : 0) : 1)
      .input('allowBackorders', sql.Bit, dto.allowBackorders ? 1 : 0)
      .input('trackStock', sql.Bit, dto.trackStock !== undefined ? (dto.trackStock ? 1 : 0) : 1)
      .input('isTaxable', sql.Bit, dto.isTaxable !== undefined ? (dto.isTaxable ? 1 : 0) : 1)
      .input('createdBy', sql.Int, userId)
      .query(`
        INSERT INTO produtos (
          codigo, name, description, type, categoria, subcategoria, unidade,
          preco_custo, preco_venda, preco_promocional,
          data_inicio_promocao, data_fim_promocao, margem_lucro,
          iva_taxa, iva_codigo,
          stock_atual, stock_minimo, stock_maximo, ponto_reposicao, quantidade_reposicao,
          peso, dimensoes, codigo_barras, referencia_fornecedor, fornecedor_id,
          prazo_entrega_dias, garantia_meses,
          observacoes, ativo, destaque, visivel_catalogo,
          permite_encomendas_pendentes, rastrear_stock, tributavel,
          status, criado_por, created_at
        )
        OUTPUT INSERTED.*
        VALUES (
          @code, @name, @description, @type, @category, @subcategory, @unit,
          @costPrice, @salePrice, @promotionalPrice,
          @promotionStartDate, @promotionEndDate, @profitMargin,
          @vatRate, @vatCode,
          @currentStock, @minStock, @maxStock, @reorderPoint, @reorderQuantity,
          @weight, @dimensions, @barcode, @supplierReference, @supplierId,
          @leadTimeDays, @warrantyMonths,
          @notes, 1, @isFeatured, @visibleInCatalog,
          @allowBackorders, @trackStock, @isTaxable,
          'active', @createdBy, GETDATE()
        )
      `);

    return result.recordset[0];
  }

  /**
   * Update product
   */
  async update(tenantId: number, id: number, dto: UpdateProductDto, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if product exists
    const productCheck = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT id FROM produtos WHERE id = @id');

    if (productCheck.recordset.length === 0) {
      throw new NotFoundException('Product not found');
    }

    // Check if code already exists in another product
    if (dto.code) {
      const codeCheck = await pool.request()
        .input('code', sql.NVarChar, dto.code)
        .input('id', sql.Int, id)
        .query('SELECT id FROM produtos WHERE codigo = @code AND id != @id');

      if (codeCheck.recordset.length > 0) {
        throw new BadRequestException('Product code already exists');
      }
    }

    // Check if barcode already exists in another product
    if (dto.barcode) {
      const barcodeCheck = await pool.request()
        .input('barcode', sql.NVarChar, dto.barcode)
        .input('id', sql.Int, id)
        .query('SELECT id FROM produtos WHERE codigo_barras = @barcode AND id != @id');

      if (barcodeCheck.recordset.length > 0) {
        throw new BadRequestException('Barcode already exists');
      }
    }

    // Build dynamic update query
    const updates: string[] = [];
    const request = pool.request();

    if (dto.code !== undefined) {
      updates.push('codigo = @code');
      request.input('code', sql.NVarChar, dto.code);
    }
    if (dto.name !== undefined) {
      updates.push('name = @name');
      request.input('name', sql.NVarChar, dto.name);
    }
    if (dto.description !== undefined) {
      updates.push('description = @description');
      request.input('description', sql.NVarChar, dto.description);
    }
    if (dto.type !== undefined) {
      updates.push('type = @type');
      request.input('type', sql.NVarChar, dto.type);
    }
    if (dto.category !== undefined) {
      updates.push('categoria = @category');
      request.input('category', sql.NVarChar, dto.category);
    }
    if (dto.subcategory !== undefined) {
      updates.push('subcategoria = @subcategory');
      request.input('subcategory', sql.NVarChar, dto.subcategory);
    }
    if (dto.unit !== undefined) {
      updates.push('unidade = @unit');
      request.input('unit', sql.NVarChar, dto.unit);
    }
    if (dto.costPrice !== undefined) {
      updates.push('preco_custo = @costPrice');
      request.input('costPrice', sql.Decimal(15, 2), dto.costPrice);
    }
    if (dto.salePrice !== undefined) {
      updates.push('preco_venda = @salePrice');
      request.input('salePrice', sql.Decimal(15, 2), dto.salePrice);
    }
    if (dto.promotionalPrice !== undefined) {
      updates.push('preco_promocional = @promotionalPrice');
      request.input('promotionalPrice', sql.Decimal(15, 2), dto.promotionalPrice);
    }
    if (dto.promotionStartDate !== undefined) {
      updates.push('data_inicio_promocao = @promotionStartDate');
      request.input('promotionStartDate', sql.DateTime2, dto.promotionStartDate);
    }
    if (dto.promotionEndDate !== undefined) {
      updates.push('data_fim_promocao = @promotionEndDate');
      request.input('promotionEndDate', sql.DateTime2, dto.promotionEndDate);
    }
    if (dto.profitMargin !== undefined) {
      updates.push('margem_lucro = @profitMargin');
      request.input('profitMargin', sql.Decimal(5, 2), dto.profitMargin);
    }
    if (dto.vatRate !== undefined) {
      updates.push('iva_taxa = @vatRate');
      request.input('vatRate', sql.Decimal(5, 2), dto.vatRate);
    }
    if (dto.vatCode !== undefined) {
      updates.push('iva_codigo = @vatCode');
      request.input('vatCode', sql.NVarChar, dto.vatCode);
    }
    if (dto.currentStock !== undefined) {
      updates.push('stock_atual = @currentStock');
      request.input('currentStock', sql.Decimal(10, 2), dto.currentStock);
    }
    if (dto.minStock !== undefined) {
      updates.push('stock_minimo = @minStock');
      request.input('minStock', sql.Decimal(10, 2), dto.minStock);
    }
    if (dto.maxStock !== undefined) {
      updates.push('stock_maximo = @maxStock');
      request.input('maxStock', sql.Decimal(10, 2), dto.maxStock);
    }
    if (dto.reorderPoint !== undefined) {
      updates.push('ponto_reposicao = @reorderPoint');
      request.input('reorderPoint', sql.Decimal(10, 2), dto.reorderPoint);
    }
    if (dto.reorderQuantity !== undefined) {
      updates.push('quantidade_reposicao = @reorderQuantity');
      request.input('reorderQuantity', sql.Decimal(10, 2), dto.reorderQuantity);
    }
    if (dto.weight !== undefined) {
      updates.push('peso = @weight');
      request.input('weight', sql.Decimal(10, 3), dto.weight);
    }
    if (dto.dimensions !== undefined) {
      updates.push('dimensoes = @dimensions');
      request.input('dimensions', sql.NVarChar, dto.dimensions);
    }
    if (dto.barcode !== undefined) {
      updates.push('codigo_barras = @barcode');
      request.input('barcode', sql.NVarChar, dto.barcode);
    }
    if (dto.supplierReference !== undefined) {
      updates.push('referencia_fornecedor = @supplierReference');
      request.input('supplierReference', sql.NVarChar, dto.supplierReference);
    }
    if (dto.supplierId !== undefined) {
      updates.push('fornecedor_id = @supplierId');
      request.input('supplierId', sql.Int, dto.supplierId);
    }
    if (dto.leadTimeDays !== undefined) {
      updates.push('prazo_entrega_dias = @leadTimeDays');
      request.input('leadTimeDays', sql.Int, dto.leadTimeDays);
    }
    if (dto.warrantyMonths !== undefined) {
      updates.push('garantia_meses = @warrantyMonths');
      request.input('warrantyMonths', sql.Int, dto.warrantyMonths);
    }
    if (dto.notes !== undefined) {
      updates.push('observacoes = @notes');
      request.input('notes', sql.NVarChar, dto.notes);
    }
    if (dto.status !== undefined) {
      updates.push('status = @status');
      request.input('status', sql.NVarChar, dto.status);
    }
    if (dto.isFeatured !== undefined) {
      updates.push('destaque = @isFeatured');
      request.input('isFeatured', sql.Bit, dto.isFeatured ? 1 : 0);
    }
    if (dto.visibleInCatalog !== undefined) {
      updates.push('visivel_catalogo = @visibleInCatalog');
      request.input('visibleInCatalog', sql.Bit, dto.visibleInCatalog ? 1 : 0);
    }
    if (dto.allowBackorders !== undefined) {
      updates.push('permite_encomendas_pendentes = @allowBackorders');
      request.input('allowBackorders', sql.Bit, dto.allowBackorders ? 1 : 0);
    }
    if (dto.trackStock !== undefined) {
      updates.push('rastrear_stock = @trackStock');
      request.input('trackStock', sql.Bit, dto.trackStock ? 1 : 0);
    }
    if (dto.isTaxable !== undefined) {
      updates.push('tributavel = @isTaxable');
      request.input('isTaxable', sql.Bit, dto.isTaxable ? 1 : 0);
    }

    if (updates.length === 0) {
      throw new BadRequestException('No fields to update');
    }

    updates.push('atualizado_por = @updatedBy');
    updates.push('updated_at = GETDATE()');

    request.input('id', sql.Int, id);
    request.input('updatedBy', sql.Int, userId);

    const result = await request.query(`
      UPDATE produtos
      SET ${updates.join(', ')}
      OUTPUT INSERTED.*
      WHERE id = @id
    `);

    return result.recordset[0];
  }

  /**
   * Delete product (soft delete)
   */
  async delete(tenantId: number, id: number, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('updatedBy', sql.Int, userId)
      .query(`
        UPDATE produtos
        SET ativo = 0,
            status = 'inactive',
            atualizado_por = @updatedBy,
            updated_at = GETDATE()
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      throw new NotFoundException('Product not found');
    }

    return { message: 'Product deleted successfully' };
  }

  /**
   * Adjust stock with movement history
   */
  async adjustStock(tenantId: number, id: number, dto: AdjustStockDto, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    const transaction = pool.transaction();

    try {
      await transaction.begin();

      // Get current product and stock
      const productResult = await transaction.request()
        .input('id', sql.Int, id)
        .query('SELECT id, stock_atual, name, codigo FROM produtos WHERE id = @id');

      if (productResult.recordset.length === 0) {
        throw new NotFoundException('Product not found');
      }

      const product = productResult.recordset[0];
      const previousStock = product.stock_atual || 0;
      const newStock = previousStock + dto.quantity;

      if (newStock < 0) {
        throw new BadRequestException(`Insufficient stock. Current: ${previousStock}, Requested: ${Math.abs(dto.quantity)}`);
      }

      // Update stock
      await transaction.request()
        .input('id', sql.Int, id)
        .input('newStock', sql.Decimal(10, 2), newStock)
        .input('updatedBy', sql.Int, userId)
        .query(`
          UPDATE produtos
          SET stock_atual = @newStock,
              atualizado_por = @updatedBy,
              updated_at = GETDATE()
          WHERE id = @id
        `);

      // Record stock movement (if table exists)
      // Note: This assumes a stock_movements table exists or will be created
      try {
        await transaction.request()
          .input('productId', sql.Int, id)
          .input('movementType', sql.NVarChar, dto.movementType)
          .input('quantity', sql.Decimal(10, 2), dto.quantity)
          .input('previousStock', sql.Decimal(10, 2), previousStock)
          .input('newStock', sql.Decimal(10, 2), newStock)
          .input('reference', sql.NVarChar, dto.reference || null)
          .input('notes', sql.NVarChar, dto.notes || null)
          .input('unitCost', sql.Decimal(15, 2), dto.unitCost || null)
          .input('createdBy', sql.Int, userId)
          .query(`
            IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'stock_movements')
            BEGIN
              INSERT INTO stock_movements (
                produto_id, tipo_movimento, quantidade,
                stock_anterior, stock_novo, referencia, notas,
                custo_unitario, criado_por, created_at
              )
              VALUES (
                @productId, @movementType, @quantity,
                @previousStock, @newStock, @reference, @notes,
                @unitCost, @createdBy, GETDATE()
              )
            END
          `);
      } catch (error) {
        // If stock_movements table doesn't exist, continue without error
        console.log('Stock movements table not found, skipping movement record');
      }

      await transaction.commit();

      return {
        message: 'Stock adjusted successfully',
        product: {
          id: product.id,
          code: product.codigo,
          name: product.name,
          previousStock,
          adjustment: dto.quantity,
          newStock,
        },
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get products with low stock
   */
  async getLowStock(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().query(`
      SELECT
        p.*,
        f.name as fornecedor_name,
        (p.stock_minimo - p.stock_atual) as deficit_stock
      FROM produtos p
      LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
      WHERE p.ativo = 1
        AND p.rastrear_stock = 1
        AND p.stock_minimo IS NOT NULL
        AND p.stock_atual <= p.stock_minimo
      ORDER BY (p.stock_minimo - p.stock_atual) DESC, p.name
    `);

    return result.recordset;
  }

  /**
   * Get products that need reordering
   */
  async getReorderNeeded(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().query(`
      SELECT
        p.*,
        f.name as fornecedor_name,
        f.email as fornecedor_email,
        p.quantidade_reposicao as suggested_order_quantity
      FROM produtos p
      LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
      WHERE p.ativo = 1
        AND p.rastrear_stock = 1
        AND p.ponto_reposicao IS NOT NULL
        AND p.stock_atual <= p.ponto_reposicao
      ORDER BY p.name
    `);

    return result.recordset;
  }

  /**
   * Get available categories
   */
  async getCategories(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().query(`
      SELECT DISTINCT categoria
      FROM produtos
      WHERE categoria IS NOT NULL AND ativo = 1
      ORDER BY categoria
    `);

    return result.recordset.map((r) => r.categoria);
  }

  /**
   * Bulk price update
   */
  async bulkPriceUpdate(tenantId: number, dto: BulkPriceUpdateDto, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    const transaction = pool.transaction();

    try {
      await transaction.begin();

      const updates: string[] = [];
      const request = transaction.request();

      if (dto.percentageAdjustment !== undefined) {
        const multiplier = 1 + dto.percentageAdjustment / 100;
        updates.push(`preco_venda = preco_venda * ${multiplier}`);
      }

      if (dto.fixedAdjustment !== undefined) {
        updates.push(`preco_venda = preco_venda + @fixedAdjustment`);
        request.input('fixedAdjustment', sql.Decimal(15, 2), dto.fixedAdjustment);
      }

      if (dto.newVatRate !== undefined) {
        updates.push('iva_taxa = @newVatRate');
        request.input('newVatRate', sql.Decimal(5, 2), dto.newVatRate);
      }

      if (updates.length === 0) {
        throw new BadRequestException('No price adjustments specified');
      }

      updates.push('atualizado_por = @updatedBy');
      updates.push('updated_at = GETDATE()');

      request.input('updatedBy', sql.Int, userId);

      // Create parameter for each product ID
      const productIdParams = dto.productIds.map((_, index) => `@productId${index}`);
      dto.productIds.forEach((id, index) => {
        request.input(`productId${index}`, sql.Int, id);
      });

      const result = await request.query(`
        UPDATE produtos
        SET ${updates.join(', ')}
        WHERE id IN (${productIdParams.join(', ')})
      `);

      await transaction.commit();

      return {
        message: 'Prices updated successfully',
        productsUpdated: result.rowsAffected[0],
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Calculate sale price based on cost and margin
   */
  async calculatePrice(dto: CalculatePriceDto) {
    const { costPrice, profitMargin, vatRate = 0 } = dto;

    // Sale price before VAT = cost / (1 - margin/100)
    const salePriceBeforeVAT = costPrice / (1 - profitMargin / 100);

    // Sale price with VAT
    const salePriceWithVAT = salePriceBeforeVAT * (1 + vatRate / 100);

    // Actual profit
    const profit = salePriceBeforeVAT - costPrice;

    return {
      costPrice,
      profitMargin,
      vatRate,
      salePriceBeforeVAT: Math.round(salePriceBeforeVAT * 100) / 100,
      salePriceWithVAT: Math.round(salePriceWithVAT * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      vatAmount: Math.round((salePriceWithVAT - salePriceBeforeVAT) * 100) / 100,
    };
  }

  /**
   * Get product statistics
   */
  async getStats(tenantId: number, filters: any = {}): Promise<ProductStatsDto> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Total products
    const totalResult = await pool.request().query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN ativo = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN stock_atual <= 0 THEN 1 ELSE 0 END) as out_of_stock,
        SUM(CASE WHEN stock_atual <= stock_minimo AND stock_minimo IS NOT NULL THEN 1 ELSE 0 END) as low_stock,
        SUM(stock_atual * preco_custo) as total_value_cost,
        SUM(stock_atual * preco_venda) as total_value_sale
      FROM produtos
      WHERE ativo = 1
    `);

    // By category
    const categoryResult = await pool.request().query(`
      SELECT
        ISNULL(categoria, 'Uncategorized') as category,
        COUNT(*) as count,
        SUM(stock_atual * preco_venda) as total_value
      FROM produtos
      WHERE ativo = 1
      GROUP BY categoria
      ORDER BY total_value DESC
    `);

    // By type
    const typeResult = await pool.request().query(`
      SELECT
        type,
        COUNT(*) as count,
        SUM(stock_atual * preco_venda) as value
      FROM produtos
      WHERE ativo = 1
      GROUP BY type
    `);

    // Top products by value
    const topProductsResult = await pool.request().query(`
      SELECT TOP 10
        id as productId,
        codigo as productCode,
        name as productName,
        stock_atual as stock,
        (stock_atual * preco_venda) as value
      FROM produtos
      WHERE ativo = 1
      ORDER BY value DESC
    `);

    const stats = totalResult.recordset[0];

    return {
      totalProducts: stats.total || 0,
      activeProducts: stats.active || 0,
      outOfStock: stats.out_of_stock || 0,
      lowStock: stats.low_stock || 0,
      totalInventoryValueCost: stats.total_value_cost || 0,
      totalInventoryValueSale: stats.total_value_sale || 0,
      byCategory: categoryResult.recordset.map((r) => ({
        category: r.category,
        count: r.count,
        totalValue: r.total_value || 0,
      })),
      byType: {
        product: {
          count: typeResult.recordset.find((r) => r.type === 'product')?.count || 0,
          value: typeResult.recordset.find((r) => r.type === 'product')?.value || 0,
        },
        service: {
          count: typeResult.recordset.find((r) => r.type === 'service')?.count || 0,
          value: typeResult.recordset.find((r) => r.type === 'service')?.value || 0,
        },
      },
      topProductsByValue: topProductsResult.recordset,
    };
  }
}
