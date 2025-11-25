import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../../database/database.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private readonly databaseService: DatabaseService) {}

  // ==================== SUPPLIERS CRUD ====================

  /**
   * Create a new supplier
   */
  async create(tenantId: number, dto: CreateSupplierDto) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if code already exists
    const existing = await pool
      .request()
      .input('code', sql.NVarChar, dto.code)
      .query(`SELECT id FROM [supplier] WHERE code = @code AND deleted_at IS NULL`);

    if (existing.recordset.length > 0) {
      throw new BadRequestException('A supplier with this code already exists');
    }

    // If companyId is provided, verify it exists
    if (dto.companyId) {
      const companyCheck = await pool
        .request()
        .input('companyId', sql.Int, dto.companyId)
        .query(`SELECT id FROM [company] WHERE id = @companyId AND deleted_at IS NULL`);

      if (companyCheck.recordset.length === 0) {
        throw new NotFoundException('Company not found');
      }
    }

    const result = await pool
      .request()
      .input('code', sql.NVarChar, dto.code)
      .input('name', sql.NVarChar, dto.name)
      .input('taxId', sql.NVarChar, dto.taxId || null)
      .input('supplierType', sql.NVarChar, dto.supplierType || null)
      .input('paymentTerms', sql.NVarChar, dto.paymentTerms || null)
      .input('rating', sql.Int, dto.rating || null)
      .input('status', sql.NVarChar, dto.status || 'active')
      .input('notes', sql.NVarChar, dto.notes || null)
      .input('companyId', sql.Int, dto.companyId || null)
      .query(`
        INSERT INTO [supplier] (
          code, name, tax_id, supplier_type, payment_terms, rating,
          status, notes, company_id, created_at
        )
        OUTPUT INSERTED.id
        VALUES (
          @code, @name, @taxId, @supplierType, @paymentTerms, @rating,
          @status, @notes, @companyId, GETDATE()
        )
      `);

    return {
      id: result.recordset[0].id,
      success: true,
      message: 'Supplier created successfully',
    };
  }

  /**
   * Find all suppliers with optional filtering and pagination
   */
  async findAll(
    tenantId: number,
    filters: {
      supplierType?: string;
      status?: string;
      searchText?: string;
      companyId?: number;
      page?: number;
      pageSize?: number;
    } = {},
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    let whereClause = 'WHERE s.deleted_at IS NULL';
    const conditions: string[] = [];

    if (filters.supplierType) {
      conditions.push('s.supplier_type = @supplierType');
    }

    if (filters.status) {
      conditions.push('s.status = @status');
    }

    if (filters.companyId) {
      conditions.push('s.company_id = @companyId');
    }

    if (filters.searchText) {
      conditions.push('(s.name LIKE @searchText OR s.code LIKE @searchText OR s.tax_id LIKE @searchText)');
    }

    if (conditions.length > 0) {
      whereClause += ' AND ' + conditions.join(' AND ');
    }

    // Without pagination
    if (!filters.page || !filters.pageSize) {
      const request = pool.request();

      if (filters.supplierType) request.input('supplierType', sql.NVarChar, filters.supplierType);
      if (filters.status) request.input('status', sql.NVarChar, filters.status);
      if (filters.companyId) request.input('companyId', sql.Int, filters.companyId);
      if (filters.searchText)
        request.input('searchText', sql.NVarChar, `%${filters.searchText}%`);

      const result = await request.query(`
        SELECT
          s.*,
          co.name as company_name,
          co.trade_name as company_trade_name,
          co.tax_id as company_tax_id
        FROM [supplier] s
        LEFT JOIN [company] co ON s.company_id = co.id AND co.deleted_at IS NULL
        ${whereClause}
        ORDER BY s.name ASC
      `);

      return result.recordset;
    }

    // With pagination
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const offset = (page - 1) * pageSize;

    const countRequest = pool.request();
    if (filters.supplierType) countRequest.input('supplierType', sql.NVarChar, filters.supplierType);
    if (filters.status) countRequest.input('status', sql.NVarChar, filters.status);
    if (filters.companyId) countRequest.input('companyId', sql.Int, filters.companyId);
    if (filters.searchText)
      countRequest.input('searchText', sql.NVarChar, `%${filters.searchText}%`);

    const countResult = await countRequest.query(`
      SELECT COUNT(*) as total FROM [supplier] s ${whereClause}
    `);

    const dataRequest = pool.request();
    if (filters.supplierType) dataRequest.input('supplierType', sql.NVarChar, filters.supplierType);
    if (filters.status) dataRequest.input('status', sql.NVarChar, filters.status);
    if (filters.companyId) dataRequest.input('companyId', sql.Int, filters.companyId);
    if (filters.searchText)
      dataRequest.input('searchText', sql.NVarChar, `%${filters.searchText}%`);

    dataRequest.input('offset', sql.Int, offset);
    dataRequest.input('pageSize', sql.Int, pageSize);

    const dataResult = await dataRequest.query(`
      SELECT
        s.*,
        co.name as company_name,
        co.trade_name as company_trade_name,
        co.tax_id as company_tax_id
      FROM [supplier] s
      LEFT JOIN [company] co ON s.company_id = co.id AND co.deleted_at IS NULL
      ${whereClause}
      ORDER BY s.name ASC
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
   * Find a supplier by ID with all related data
   */
  async findOne(tenantId: number, id: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('id', sql.Int, id).query(`
      SELECT
        s.*,
        co.name as company_name,
        co.trade_name as company_trade_name,
        co.tax_id as company_tax_id,
        co.logo_url as company_logo
      FROM [supplier] s
      LEFT JOIN [company] co ON s.company_id = co.id AND co.deleted_at IS NULL
      WHERE s.id = @id AND s.deleted_at IS NULL
    `);

    if (result.recordset.length === 0) {
      throw new NotFoundException('Supplier not found');
    }

    const supplier = result.recordset[0];

    // Get contacts
    const contacts = await this.findSupplierContacts(tenantId, id);

    // Get addresses
    const addresses = await this.findSupplierAddresses(tenantId, id);

    return {
      ...supplier,
      contacts,
      addresses,
    };
  }

  /**
   * Find supplier by company ID
   */
  async findByCompanyId(tenantId: number, companyId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('companyId', sql.Int, companyId).query(`
      SELECT
        s.*,
        co.name as company_name,
        co.trade_name as company_trade_name,
        co.tax_id as company_tax_id
      FROM [supplier] s
      LEFT JOIN [company] co ON s.company_id = co.id AND co.deleted_at IS NULL
      WHERE s.company_id = @companyId AND s.deleted_at IS NULL
    `);

    if (result.recordset.length === 0) {
      throw new NotFoundException('Supplier not found for this company');
    }

    return result.recordset[0];
  }

  /**
   * Update a supplier
   */
  async update(tenantId: number, id: number, dto: UpdateSupplierDto) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if supplier exists
    const existing = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`SELECT id FROM [supplier] WHERE id = @id AND deleted_at IS NULL`);

    if (existing.recordset.length === 0) {
      throw new NotFoundException('Supplier not found');
    }

    // If updating code, check for duplicates
    if (dto.code) {
      const duplicate = await pool
        .request()
        .input('code', sql.NVarChar, dto.code)
        .input('id', sql.Int, id)
        .query(
          `SELECT id FROM [supplier] WHERE code = @code AND id != @id AND deleted_at IS NULL`,
        );

      if (duplicate.recordset.length > 0) {
        throw new BadRequestException('A supplier with this code already exists');
      }
    }

    // If updating companyId, verify it exists
    if (dto.companyId) {
      const companyCheck = await pool
        .request()
        .input('companyId', sql.Int, dto.companyId)
        .query(`SELECT id FROM [company] WHERE id = @companyId AND deleted_at IS NULL`);

      if (companyCheck.recordset.length === 0) {
        throw new NotFoundException('Company not found');
      }
    }

    // Build dynamic update query
    const updates: string[] = [];
    const request = pool.request();

    if (dto.code !== undefined) {
      updates.push('code = @code');
      request.input('code', sql.NVarChar, dto.code);
    }
    if (dto.name !== undefined) {
      updates.push('name = @name');
      request.input('name', sql.NVarChar, dto.name);
    }
    if (dto.taxId !== undefined) {
      updates.push('tax_id = @taxId');
      request.input('taxId', sql.NVarChar, dto.taxId);
    }
    if (dto.supplierType !== undefined) {
      updates.push('supplier_type = @supplierType');
      request.input('supplierType', sql.NVarChar, dto.supplierType);
    }
    if (dto.paymentTerms !== undefined) {
      updates.push('payment_terms = @paymentTerms');
      request.input('paymentTerms', sql.NVarChar, dto.paymentTerms);
    }
    if (dto.rating !== undefined) {
      updates.push('rating = @rating');
      request.input('rating', sql.Int, dto.rating);
    }
    if (dto.status !== undefined) {
      updates.push('status = @status');
      request.input('status', sql.NVarChar, dto.status);
    }
    if (dto.notes !== undefined) {
      updates.push('notes = @notes');
      request.input('notes', sql.NVarChar, dto.notes);
    }
    if (dto.companyId !== undefined) {
      updates.push('company_id = @companyId');
      request.input('companyId', sql.Int, dto.companyId);
    }

    if (updates.length === 0) {
      throw new BadRequestException('No fields to update');
    }

    updates.push('updated_at = GETDATE()');

    request.input('id', sql.Int, id);

    await request.query(`
      UPDATE [supplier]
      SET ${updates.join(', ')}
      WHERE id = @id
    `);

    return {
      success: true,
      message: 'Supplier updated successfully',
    };
  }

  /**
   * Soft delete a supplier
   */
  async remove(tenantId: number, id: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('id', sql.Int, id).query(`
      UPDATE [supplier]
      SET deleted_at = GETDATE()
      WHERE id = @id AND deleted_at IS NULL
    `);

    if (result.rowsAffected[0] === 0) {
      throw new NotFoundException('Supplier not found');
    }

    return {
      success: true,
      message: 'Supplier deleted successfully',
    };
  }

  /**
   * Block a supplier
   */
  async block(tenantId: number, id: number, reason: string) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Get current notes
    const supplierResult = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`SELECT notes FROM [supplier] WHERE id = @id AND deleted_at IS NULL`);

    if (supplierResult.recordset.length === 0) {
      throw new NotFoundException('Supplier not found');
    }

    const currentNotes = supplierResult.recordset[0].notes || '';
    const blockNote = `[BLOCKED ${new Date().toISOString()}]: ${reason}`;
    const updatedNotes = currentNotes
      ? `${currentNotes}\n\n${blockNote}`
      : blockNote;

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('notes', sql.NVarChar, updatedNotes)
      .query(`
        UPDATE [supplier]
        SET status = 'blocked',
            notes = @notes,
            updated_at = GETDATE()
        WHERE id = @id AND deleted_at IS NULL
      `);

    return {
      success: true,
      message: 'Supplier blocked successfully',
    };
  }

  /**
   * Unblock a supplier
   */
  async unblock(tenantId: number, id: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('id', sql.Int, id).query(`
      UPDATE [supplier]
      SET status = 'active',
          updated_at = GETDATE()
      WHERE id = @id AND deleted_at IS NULL
    `);

    if (result.rowsAffected[0] === 0) {
      throw new NotFoundException('Supplier not found');
    }

    return {
      success: true,
      message: 'Supplier unblocked successfully',
    };
  }

  /**
   * Get supplier statistics
   */
  async getStatistics(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().query(`
      SELECT
        COUNT(*) as totalSuppliers,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeSuppliers,
        SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blockedSuppliers,
        SUM(CASE WHEN supplier_type = 'manufacturer' THEN 1 ELSE 0 END) as manufacturers,
        SUM(CASE WHEN supplier_type = 'distributor' THEN 1 ELSE 0 END) as distributors,
        SUM(CASE WHEN MONTH(created_at) = MONTH(GETDATE()) AND YEAR(created_at) = YEAR(GETDATE()) THEN 1 ELSE 0 END) as suppliersThisMonth
      FROM [supplier]
      WHERE deleted_at IS NULL
    `);

    return result.recordset[0];
  }

  // ==================== CONTACTS MANAGEMENT ====================

  /**
   * Find all contacts for a supplier
   */
  async findSupplierContacts(tenantId: number, supplierId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('supplierId', sql.Int, supplierId).query(`
      SELECT *
      FROM [contact]
      WHERE entity_type = 'supplier'
        AND entity_id = @supplierId
        AND deleted_at IS NULL
      ORDER BY is_primary DESC, contact_type ASC
    `);

    return result.recordset;
  }

  /**
   * Create a contact for a supplier
   */
  async createContact(tenantId: number, supplierId: number, contactData: any) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Verify supplier exists
    const supplierCheck = await pool
      .request()
      .input('supplierId', sql.Int, supplierId)
      .query(`SELECT id FROM [supplier] WHERE id = @supplierId AND deleted_at IS NULL`);

    if (supplierCheck.recordset.length === 0) {
      throw new NotFoundException('Supplier not found');
    }

    const result = await pool
      .request()
      .input('entityType', sql.NVarChar, 'supplier')
      .input('entityId', sql.Int, supplierId)
      .input('contactType', sql.NVarChar, contactData.contactType)
      .input('contactValue', sql.NVarChar, contactData.contactValue)
      .input('label', sql.NVarChar, contactData.label || null)
      .input('isPrimary', sql.Bit, contactData.isPrimary ? 1 : 0)
      .input('isActive', sql.Bit, contactData.isActive !== false ? 1 : 0)
      .input('notes', sql.NVarChar, contactData.notes || null)
      .query(`
        INSERT INTO [contact] (
          entity_type, entity_id, contact_type, contact_value,
          label, is_primary, is_active, notes, created_at
        )
        OUTPUT INSERTED.id
        VALUES (
          @entityType, @entityId, @contactType, @contactValue,
          @label, @isPrimary, @isActive, @notes, GETDATE()
        )
      `);

    return {
      id: result.recordset[0].id,
      success: true,
      message: 'Contact added successfully',
    };
  }

  /**
   * Update a contact
   */
  async updateContact(tenantId: number, contactId: number, contactData: any) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const updates: string[] = [];
    const request = pool.request();

    if (contactData.contactType !== undefined) {
      updates.push('contact_type = @contactType');
      request.input('contactType', sql.NVarChar, contactData.contactType);
    }
    if (contactData.contactValue !== undefined) {
      updates.push('contact_value = @contactValue');
      request.input('contactValue', sql.NVarChar, contactData.contactValue);
    }
    if (contactData.label !== undefined) {
      updates.push('label = @label');
      request.input('label', sql.NVarChar, contactData.label);
    }
    if (contactData.isPrimary !== undefined) {
      updates.push('is_primary = @isPrimary');
      request.input('isPrimary', sql.Bit, contactData.isPrimary ? 1 : 0);
    }
    if (contactData.isActive !== undefined) {
      updates.push('is_active = @isActive');
      request.input('isActive', sql.Bit, contactData.isActive ? 1 : 0);
    }
    if (contactData.notes !== undefined) {
      updates.push('notes = @notes');
      request.input('notes', sql.NVarChar, contactData.notes);
    }

    if (updates.length === 0) {
      throw new BadRequestException('No fields to update');
    }

    updates.push('updated_at = GETDATE()');

    request.input('contactId', sql.Int, contactId);

    const result = await request.query(`
      UPDATE [contact]
      SET ${updates.join(', ')}
      WHERE id = @contactId AND deleted_at IS NULL
    `);

    if (result.rowsAffected[0] === 0) {
      throw new NotFoundException('Contact not found');
    }

    return {
      success: true,
      message: 'Contact updated successfully',
    };
  }

  /**
   * Delete a contact
   */
  async deleteContact(tenantId: number, contactId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('contactId', sql.Int, contactId).query(`
      UPDATE [contact]
      SET deleted_at = GETDATE()
      WHERE id = @contactId AND deleted_at IS NULL
    `);

    if (result.rowsAffected[0] === 0) {
      throw new NotFoundException('Contact not found');
    }

    return {
      success: true,
      message: 'Contact deleted successfully',
    };
  }

  // ==================== ADDRESSES MANAGEMENT ====================

  /**
   * Find all addresses for a supplier
   */
  async findSupplierAddresses(tenantId: number, supplierId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('supplierId', sql.Int, supplierId).query(`
      SELECT *
      FROM [address]
      WHERE entity_type = 'supplier'
        AND entity_id = @supplierId
        AND deleted_at IS NULL
      ORDER BY is_primary DESC, address_type ASC
    `);

    return result.recordset;
  }

  /**
   * Create an address for a supplier
   */
  async createAddress(tenantId: number, supplierId: number, addressData: any) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Verify supplier exists
    const supplierCheck = await pool
      .request()
      .input('supplierId', sql.Int, supplierId)
      .query(`SELECT id FROM [supplier] WHERE id = @supplierId AND deleted_at IS NULL`);

    if (supplierCheck.recordset.length === 0) {
      throw new NotFoundException('Supplier not found');
    }

    const result = await pool
      .request()
      .input('entityType', sql.NVarChar, 'supplier')
      .input('entityId', sql.Int, supplierId)
      .input('addressType', sql.NVarChar, addressData.addressType)
      .input('street', sql.NVarChar, addressData.street || null)
      .input('streetNumber', sql.NVarChar, addressData.streetNumber || null)
      .input('floor', sql.NVarChar, addressData.floor || null)
      .input('apartment', sql.NVarChar, addressData.apartment || null)
      .input('postalCode', sql.NVarChar, addressData.postalCode || null)
      .input('city', sql.NVarChar, addressData.city || null)
      .input('region', sql.NVarChar, addressData.region || null)
      .input('country', sql.NVarChar, addressData.country || null)
      .input('isPrimary', sql.Bit, addressData.isPrimary ? 1 : 0)
      .input('isActive', sql.Bit, addressData.isActive !== false ? 1 : 0)
      .input('notes', sql.NVarChar, addressData.notes || null)
      .query(`
        INSERT INTO [address] (
          entity_type, entity_id, address_type, street, street_number,
          floor, apartment, postal_code, city, region, country,
          is_primary, is_active, notes, created_at
        )
        OUTPUT INSERTED.id
        VALUES (
          @entityType, @entityId, @addressType, @street, @streetNumber,
          @floor, @apartment, @postalCode, @city, @region, @country,
          @isPrimary, @isActive, @notes, GETDATE()
        )
      `);

    return {
      id: result.recordset[0].id,
      success: true,
      message: 'Address added successfully',
    };
  }

  /**
   * Update an address
   */
  async updateAddress(tenantId: number, addressId: number, addressData: any) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const updates: string[] = [];
    const request = pool.request();

    if (addressData.addressType !== undefined) {
      updates.push('address_type = @addressType');
      request.input('addressType', sql.NVarChar, addressData.addressType);
    }
    if (addressData.street !== undefined) {
      updates.push('street = @street');
      request.input('street', sql.NVarChar, addressData.street);
    }
    if (addressData.streetNumber !== undefined) {
      updates.push('street_number = @streetNumber');
      request.input('streetNumber', sql.NVarChar, addressData.streetNumber);
    }
    if (addressData.floor !== undefined) {
      updates.push('floor = @floor');
      request.input('floor', sql.NVarChar, addressData.floor);
    }
    if (addressData.apartment !== undefined) {
      updates.push('apartment = @apartment');
      request.input('apartment', sql.NVarChar, addressData.apartment);
    }
    if (addressData.postalCode !== undefined) {
      updates.push('postal_code = @postalCode');
      request.input('postalCode', sql.NVarChar, addressData.postalCode);
    }
    if (addressData.city !== undefined) {
      updates.push('city = @city');
      request.input('city', sql.NVarChar, addressData.city);
    }
    if (addressData.region !== undefined) {
      updates.push('region = @region');
      request.input('region', sql.NVarChar, addressData.region);
    }
    if (addressData.country !== undefined) {
      updates.push('country = @country');
      request.input('country', sql.NVarChar, addressData.country);
    }
    if (addressData.isPrimary !== undefined) {
      updates.push('is_primary = @isPrimary');
      request.input('isPrimary', sql.Bit, addressData.isPrimary ? 1 : 0);
    }
    if (addressData.isActive !== undefined) {
      updates.push('is_active = @isActive');
      request.input('isActive', sql.Bit, addressData.isActive ? 1 : 0);
    }
    if (addressData.notes !== undefined) {
      updates.push('notes = @notes');
      request.input('notes', sql.NVarChar, addressData.notes);
    }

    if (updates.length === 0) {
      throw new BadRequestException('No fields to update');
    }

    updates.push('updated_at = GETDATE()');

    request.input('addressId', sql.Int, addressId);

    const result = await request.query(`
      UPDATE [address]
      SET ${updates.join(', ')}
      WHERE id = @addressId AND deleted_at IS NULL
    `);

    if (result.rowsAffected[0] === 0) {
      throw new NotFoundException('Address not found');
    }

    return {
      success: true,
      message: 'Address updated successfully',
    };
  }

  /**
   * Delete an address
   */
  async deleteAddress(tenantId: number, addressId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('addressId', sql.Int, addressId).query(`
      UPDATE [address]
      SET deleted_at = GETDATE()
      WHERE id = @addressId AND deleted_at IS NULL
    `);

    if (result.rowsAffected[0] === 0) {
      throw new NotFoundException('Address not found');
    }

    return {
      success: true,
      message: 'Address deleted successfully',
    };
  }
}
