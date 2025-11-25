import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import * as sql from 'mssql';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly databaseService: DatabaseService) {}

  // ==================== COMPANY CRUD ====================

  async create(tenantId: number, dto: CreateCompanyDto) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if code already exists
    const existing = await pool
      .request()
      .input('code', sql.NVarChar, dto.code)
      .query(`SELECT id FROM [company] WHERE code = @code AND deleted_at IS NULL`);

    if (existing.recordset.length > 0) {
      throw new BadRequestException('A company with this code already exists');
    }

    const result = await pool
      .request()
      .input('code', sql.NVarChar, dto.code)
      .input('name', sql.NVarChar, dto.name)
      .input('tradeName', sql.NVarChar, dto.tradeName || null)
      .input('legalName', sql.NVarChar, dto.legalName || null)
      .input('taxId', sql.NVarChar, dto.taxId || null)
      .input('logoUrl', sql.NVarChar, dto.logoUrl || null)
      .input('color', sql.NVarChar, dto.color || null)
      .input('companyType', sql.NVarChar, dto.companyType || null)
      .input('legalNature', sql.NVarChar, dto.legalNature || null)
      .input('shareCapital', sql.Decimal(15, 2), dto.shareCapital || null)
      .input('registrationNumber', sql.NVarChar, dto.registrationNumber || null)
      .input('incorporationDate', sql.Date, dto.incorporationDate || null)
      .input('segment', sql.NVarChar, dto.segment || null)
      .input('industrySector', sql.NVarChar, dto.industrySector || null)
      .input('caeCode', sql.NVarChar, dto.caeCode || null)
      .input('clientNumber', sql.NVarChar, dto.clientNumber || null)
      .input('supplierNumber', sql.NVarChar, dto.supplierNumber || null)
      .input('paymentTerms', sql.NVarChar, dto.paymentTerms || null)
      .input('preferredPaymentMethod', sql.NVarChar, dto.preferredPaymentMethod || null)
      .input('creditLimit', sql.Decimal(15, 2), dto.creditLimit || null)
      .input('commercialDiscount', sql.Decimal(5, 2), dto.commercialDiscount || null)
      .input('rating', sql.Int, dto.rating || null)
      .input('status', sql.NVarChar, dto.status || 'active')
      .input('notes', sql.NVarChar, dto.notes || null)
      .input('externalRef', sql.NVarChar, dto.externalRef || null)
      .input('phcId', sql.NVarChar, dto.phcId || null)
      .query(`
        INSERT INTO [company] (
          code, name, trade_name, legal_name, tax_id, logo_url, color,
          company_type, legal_nature, share_capital, registration_number, incorporation_date,
          segment, industry_sector, cae_code, client_number, supplier_number,
          payment_terms, preferred_payment_method, credit_limit, commercial_discount,
          rating, status, notes, external_ref, phc_id, created_at
        )
        OUTPUT INSERTED.id
        VALUES (
          @code, @name, @tradeName, @legalName, @taxId, @logoUrl, @color,
          @companyType, @legalNature, @shareCapital, @registrationNumber, @incorporationDate,
          @segment, @industrySector, @caeCode, @clientNumber, @supplierNumber,
          @paymentTerms, @preferredPaymentMethod, @creditLimit, @commercialDiscount,
          @rating, @status, @notes, @externalRef, @phcId, GETDATE()
        )
      `);

    return {
      id: result.recordset[0].id,
      success: true,
      message: 'Company created successfully',
    };
  }

  async findAll(
    tenantId: number,
    filters: {
      companyType?: string;
      status?: string;
      searchText?: string;
      page?: number;
      pageSize?: number;
    },
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 50;
    const offset = (page - 1) * pageSize;

    const whereClauses: string[] = ['deleted_at IS NULL'];
    const request = pool.request();

    if (filters.companyType) {
      whereClauses.push('company_type = @companyType');
      request.input('companyType', sql.NVarChar, filters.companyType);
    }

    if (filters.status) {
      whereClauses.push('status = @status');
      request.input('status', sql.NVarChar, filters.status);
    }

    if (filters.searchText) {
      whereClauses.push(
        "(name LIKE '%' + @searchText + '%' OR trade_name LIKE '%' + @searchText + '%' OR code LIKE '%' + @searchText + '%' OR tax_id LIKE '%' + @searchText + '%')",
      );
      request.input('searchText', sql.NVarChar, filters.searchText);
    }

    const whereClause = whereClauses.join(' AND ');

    // Count total
    const countResult = await request.query(`
      SELECT COUNT(*) as total
      FROM [company]
      WHERE ${whereClause}
    `);

    // Get data
    request.input('offset', sql.Int, offset);
    request.input('pageSize', sql.Int, pageSize);

    const dataResult = await request.query(`
      SELECT
        id,
        code,
        name,
        trade_name as tradeName,
        legal_name as legalName,
        tax_id as taxId,
        logo_url as logoUrl,
        color,
        company_type as companyType,
        legal_nature as legalNature,
        share_capital as shareCapital,
        client_number as clientNumber,
        supplier_number as supplierNumber,
        segment,
        industry_sector as industrySector,
        rating,
        status,
        created_at as createdAt,
        updated_at as updatedAt
      FROM [company]
      WHERE ${whereClause}
      ORDER BY name
      OFFSET @offset ROWS
      FETCH NEXT @pageSize ROWS ONLY
    `);

    return {
      data: dataResult.recordset,
      total: countResult.recordset[0].total,
      page,
      pageSize,
    };
  }

  async findOne(tenantId: number, id: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        SELECT
          id,
          code,
          name,
          trade_name as tradeName,
          legal_name as legalName,
          tax_id as taxId,
          logo_url as logoUrl,
          color,
          company_type as companyType,
          legal_nature as legalNature,
          share_capital as shareCapital,
          registration_number as registrationNumber,
          incorporation_date as incorporationDate,
          segment,
          industry_sector as industrySector,
          cae_code as caeCode,
          client_number as clientNumber,
          supplier_number as supplierNumber,
          payment_terms as paymentTerms,
          preferred_payment_method as preferredPaymentMethod,
          credit_limit as creditLimit,
          commercial_discount as commercialDiscount,
          rating,
          status,
          notes,
          external_ref as externalRef,
          phc_id as phcId,
          phc_synced as phcSynced,
          last_sync_at as lastSyncAt,
          created_at as createdAt,
          updated_at as updatedAt,
          created_by as createdBy,
          updated_by as updatedBy
        FROM [company]
        WHERE id = @id AND deleted_at IS NULL
      `);

    if (!result.recordset[0]) {
      throw new NotFoundException('Company not found');
    }

    // Get related data
    const contacts = await this.findCompanyContacts(tenantId, id);
    const addresses = await this.findCompanyAddresses(tenantId, id);

    return {
      ...result.recordset[0],
      contacts,
      addresses,
    };
  }

  async update(tenantId: number, id: number, dto: UpdateCompanyDto) {
    await this.findOne(tenantId, id);
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const setClauses: string[] = [];
    const request = pool.request();
    request.input('id', sql.Int, id);

    if (dto.code) {
      // Check if new code already exists
      const existing = await pool
        .request()
        .input('code', sql.NVarChar, dto.code)
        .input('id', sql.Int, id)
        .query(`SELECT id FROM [company] WHERE code = @code AND id != @id AND deleted_at IS NULL`);

      if (existing.recordset.length > 0) {
        throw new BadRequestException('A company with this code already exists');
      }

      setClauses.push('code = @code');
      request.input('code', sql.NVarChar, dto.code);
    }
    if (dto.name) {
      setClauses.push('name = @name');
      request.input('name', sql.NVarChar, dto.name);
    }
    if (dto.tradeName !== undefined) {
      setClauses.push('trade_name = @tradeName');
      request.input('tradeName', sql.NVarChar, dto.tradeName);
    }
    if (dto.legalName !== undefined) {
      setClauses.push('legal_name = @legalName');
      request.input('legalName', sql.NVarChar, dto.legalName);
    }
    if (dto.taxId !== undefined) {
      setClauses.push('tax_id = @taxId');
      request.input('taxId', sql.NVarChar, dto.taxId);
    }
    if (dto.logoUrl !== undefined) {
      setClauses.push('logo_url = @logoUrl');
      request.input('logoUrl', sql.NVarChar, dto.logoUrl);
    }
    if (dto.color !== undefined) {
      setClauses.push('color = @color');
      request.input('color', sql.NVarChar, dto.color);
    }
    if (dto.companyType !== undefined) {
      setClauses.push('company_type = @companyType');
      request.input('companyType', sql.NVarChar, dto.companyType);
    }
    if (dto.legalNature !== undefined) {
      setClauses.push('legal_nature = @legalNature');
      request.input('legalNature', sql.NVarChar, dto.legalNature);
    }
    if (dto.shareCapital !== undefined) {
      setClauses.push('share_capital = @shareCapital');
      request.input('shareCapital', sql.Decimal(15, 2), dto.shareCapital);
    }
    if (dto.registrationNumber !== undefined) {
      setClauses.push('registration_number = @registrationNumber');
      request.input('registrationNumber', sql.NVarChar, dto.registrationNumber);
    }
    if (dto.incorporationDate !== undefined) {
      setClauses.push('incorporation_date = @incorporationDate');
      request.input('incorporationDate', sql.Date, dto.incorporationDate);
    }
    if (dto.segment !== undefined) {
      setClauses.push('segment = @segment');
      request.input('segment', sql.NVarChar, dto.segment);
    }
    if (dto.industrySector !== undefined) {
      setClauses.push('industry_sector = @industrySector');
      request.input('industrySector', sql.NVarChar, dto.industrySector);
    }
    if (dto.caeCode !== undefined) {
      setClauses.push('cae_code = @caeCode');
      request.input('caeCode', sql.NVarChar, dto.caeCode);
    }
    if (dto.clientNumber !== undefined) {
      setClauses.push('client_number = @clientNumber');
      request.input('clientNumber', sql.NVarChar, dto.clientNumber);
    }
    if (dto.supplierNumber !== undefined) {
      setClauses.push('supplier_number = @supplierNumber');
      request.input('supplierNumber', sql.NVarChar, dto.supplierNumber);
    }
    if (dto.paymentTerms !== undefined) {
      setClauses.push('payment_terms = @paymentTerms');
      request.input('paymentTerms', sql.NVarChar, dto.paymentTerms);
    }
    if (dto.preferredPaymentMethod !== undefined) {
      setClauses.push('preferred_payment_method = @preferredPaymentMethod');
      request.input('preferredPaymentMethod', sql.NVarChar, dto.preferredPaymentMethod);
    }
    if (dto.creditLimit !== undefined) {
      setClauses.push('credit_limit = @creditLimit');
      request.input('creditLimit', sql.Decimal(15, 2), dto.creditLimit);
    }
    if (dto.commercialDiscount !== undefined) {
      setClauses.push('commercial_discount = @commercialDiscount');
      request.input('commercialDiscount', sql.Decimal(5, 2), dto.commercialDiscount);
    }
    if (dto.rating !== undefined) {
      setClauses.push('rating = @rating');
      request.input('rating', sql.Int, dto.rating);
    }
    if (dto.status !== undefined) {
      setClauses.push('status = @status');
      request.input('status', sql.NVarChar, dto.status);
    }
    if (dto.notes !== undefined) {
      setClauses.push('notes = @notes');
      request.input('notes', sql.NVarChar, dto.notes);
    }
    if (dto.externalRef !== undefined) {
      setClauses.push('external_ref = @externalRef');
      request.input('externalRef', sql.NVarChar, dto.externalRef);
    }
    if (dto.phcId !== undefined) {
      setClauses.push('phc_id = @phcId');
      request.input('phcId', sql.NVarChar, dto.phcId);
    }

    if (setClauses.length > 0) {
      setClauses.push('updated_at = GETDATE()');
      await request.query(`
        UPDATE [company]
        SET ${setClauses.join(', ')}
        WHERE id = @id
      `);
    }

    return { success: true, message: 'Company updated successfully' };
  }

  async remove(tenantId: number, id: number) {
    await this.findOne(tenantId, id);
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        UPDATE [company]
        SET deleted_at = GETDATE(), updated_at = GETDATE()
        WHERE id = @id
      `);

    return { success: true, message: 'Company deleted successfully' };
  }

  // ==================== STATISTICS ====================

  async getStatistics(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().query(`
      SELECT
        COUNT(*) as totalCompanies,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeCompanies,
        SUM(CASE WHEN company_type = 'client' THEN 1 ELSE 0 END) as clients,
        SUM(CASE WHEN company_type = 'supplier' THEN 1 ELSE 0 END) as suppliers,
        SUM(CASE WHEN company_type = 'partner' THEN 1 ELSE 0 END) as partners,
        SUM(CASE WHEN YEAR(created_at) = YEAR(GETDATE()) AND MONTH(created_at) = MONTH(GETDATE()) THEN 1 ELSE 0 END) as companiesThisMonth
      FROM [company]
      WHERE deleted_at IS NULL
    `);

    return result.recordset[0];
  }

  // ==================== CONTACTS (Polymorphic) ====================

  async findCompanyContacts(tenantId: number, companyId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('companyId', sql.Int, companyId)
      .query(`
        SELECT
          id,
          contact_type as contactType,
          contact_value as contactValue,
          is_primary as isPrimary,
          is_verified as isVerified,
          label,
          notes,
          created_at as createdAt,
          updated_at as updatedAt
        FROM [contact]
        WHERE entity_type = 'company' AND entity_id = @companyId AND deleted_at IS NULL
        ORDER BY is_primary DESC, contact_type, contact_value
      `);

    return result.recordset;
  }

  async createContact(
    tenantId: number,
    companyId: number,
    contactData: {
      contactType: string;
      contactValue: string;
      isPrimary?: boolean;
      label?: string;
      notes?: string;
    },
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('companyId', sql.Int, companyId)
      .input('contactType', sql.NVarChar, contactData.contactType)
      .input('contactValue', sql.NVarChar, contactData.contactValue)
      .input('isPrimary', sql.Bit, contactData.isPrimary ? 1 : 0)
      .input('label', sql.NVarChar, contactData.label || null)
      .input('notes', sql.NVarChar, contactData.notes || null)
      .query(`
        INSERT INTO [contact] (
          entity_type, entity_id, contact_type, contact_value, is_primary, label, notes, created_at
        )
        OUTPUT INSERTED.id
        VALUES (
          'company', @companyId, @contactType, @contactValue, @isPrimary, @label, @notes, GETDATE()
        )
      `);

    return { id: result.recordset[0].id, success: true };
  }

  async updateContact(
    tenantId: number,
    id: number,
    contactData: {
      contactType?: string;
      contactValue?: string;
      isPrimary?: boolean;
      label?: string;
      notes?: string;
    },
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const setClauses: string[] = [];
    const request = pool.request();
    request.input('id', sql.Int, id);

    if (contactData.contactType) {
      setClauses.push('contact_type = @contactType');
      request.input('contactType', sql.NVarChar, contactData.contactType);
    }
    if (contactData.contactValue) {
      setClauses.push('contact_value = @contactValue');
      request.input('contactValue', sql.NVarChar, contactData.contactValue);
    }
    if (contactData.isPrimary !== undefined) {
      setClauses.push('is_primary = @isPrimary');
      request.input('isPrimary', sql.Bit, contactData.isPrimary ? 1 : 0);
    }
    if (contactData.label !== undefined) {
      setClauses.push('label = @label');
      request.input('label', sql.NVarChar, contactData.label);
    }
    if (contactData.notes !== undefined) {
      setClauses.push('notes = @notes');
      request.input('notes', sql.NVarChar, contactData.notes);
    }

    if (setClauses.length > 0) {
      setClauses.push('updated_at = GETDATE()');
      await request.query(`
        UPDATE [contact]
        SET ${setClauses.join(', ')}
        WHERE id = @id AND entity_type = 'company'
      `);
    }

    return { success: true, message: 'Contact updated successfully' };
  }

  async deleteContact(tenantId: number, id: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        UPDATE [contact]
        SET deleted_at = GETDATE(), updated_at = GETDATE()
        WHERE id = @id AND entity_type = 'company'
      `);

    return { success: true, message: 'Contact deleted successfully' };
  }

  // ==================== ADDRESSES (Polymorphic) ====================

  async findCompanyAddresses(tenantId: number, companyId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('companyId', sql.Int, companyId)
      .query(`
        SELECT
          id,
          address_type as addressType,
          is_primary as isPrimary,
          label,
          street_line1 as streetLine1,
          street_line2 as streetLine2,
          postal_code as postalCode,
          city,
          district,
          state,
          country,
          notes,
          created_at as createdAt,
          updated_at as updatedAt
        FROM [address]
        WHERE entity_type = 'company' AND entity_id = @companyId AND deleted_at IS NULL
        ORDER BY is_primary DESC, address_type
      `);

    return result.recordset;
  }

  async createAddress(
    tenantId: number,
    companyId: number,
    addressData: {
      addressType: string;
      streetLine1: string;
      streetLine2?: string;
      postalCode?: string;
      city?: string;
      district?: string;
      state?: string;
      country: string;
      isPrimary?: boolean;
      label?: string;
      notes?: string;
    },
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('companyId', sql.Int, companyId)
      .input('addressType', sql.NVarChar, addressData.addressType)
      .input('isPrimary', sql.Bit, addressData.isPrimary ? 1 : 0)
      .input('label', sql.NVarChar, addressData.label || null)
      .input('streetLine1', sql.NVarChar, addressData.streetLine1)
      .input('streetLine2', sql.NVarChar, addressData.streetLine2 || null)
      .input('postalCode', sql.NVarChar, addressData.postalCode || null)
      .input('city', sql.NVarChar, addressData.city || null)
      .input('district', sql.NVarChar, addressData.district || null)
      .input('state', sql.NVarChar, addressData.state || null)
      .input('country', sql.NVarChar, addressData.country)
      .input('notes', sql.NVarChar, addressData.notes || null)
      .query(`
        INSERT INTO [address] (
          entity_type, entity_id, address_type, is_primary, label,
          street_line1, street_line2, postal_code, city, district, state, country, notes, created_at
        )
        OUTPUT INSERTED.id
        VALUES (
          'company', @companyId, @addressType, @isPrimary, @label,
          @streetLine1, @streetLine2, @postalCode, @city, @district, @state, @country, @notes, GETDATE()
        )
      `);

    return { id: result.recordset[0].id, success: true };
  }

  async updateAddress(
    tenantId: number,
    id: number,
    addressData: {
      addressType?: string;
      isPrimary?: boolean;
      label?: string;
      streetLine1?: string;
      streetLine2?: string;
      postalCode?: string;
      city?: string;
      district?: string;
      state?: string;
      country?: string;
      notes?: string;
    },
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const setClauses: string[] = [];
    const request = pool.request();
    request.input('id', sql.Int, id);

    if (addressData.addressType) {
      setClauses.push('address_type = @addressType');
      request.input('addressType', sql.NVarChar, addressData.addressType);
    }
    if (addressData.isPrimary !== undefined) {
      setClauses.push('is_primary = @isPrimary');
      request.input('isPrimary', sql.Bit, addressData.isPrimary ? 1 : 0);
    }
    if (addressData.label !== undefined) {
      setClauses.push('label = @label');
      request.input('label', sql.NVarChar, addressData.label);
    }
    if (addressData.streetLine1) {
      setClauses.push('street_line1 = @streetLine1');
      request.input('streetLine1', sql.NVarChar, addressData.streetLine1);
    }
    if (addressData.streetLine2 !== undefined) {
      setClauses.push('street_line2 = @streetLine2');
      request.input('streetLine2', sql.NVarChar, addressData.streetLine2);
    }
    if (addressData.postalCode !== undefined) {
      setClauses.push('postal_code = @postalCode');
      request.input('postalCode', sql.NVarChar, addressData.postalCode);
    }
    if (addressData.city !== undefined) {
      setClauses.push('city = @city');
      request.input('city', sql.NVarChar, addressData.city);
    }
    if (addressData.district !== undefined) {
      setClauses.push('district = @district');
      request.input('district', sql.NVarChar, addressData.district);
    }
    if (addressData.state !== undefined) {
      setClauses.push('state = @state');
      request.input('state', sql.NVarChar, addressData.state);
    }
    if (addressData.country) {
      setClauses.push('country = @country');
      request.input('country', sql.NVarChar, addressData.country);
    }
    if (addressData.notes !== undefined) {
      setClauses.push('notes = @notes');
      request.input('notes', sql.NVarChar, addressData.notes);
    }

    if (setClauses.length > 0) {
      setClauses.push('updated_at = GETDATE()');
      await request.query(`
        UPDATE [address]
        SET ${setClauses.join(', ')}
        WHERE id = @id AND entity_type = 'company'
      `);
    }

    return { success: true, message: 'Address updated successfully' };
  }

  async deleteAddress(tenantId: number, id: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        UPDATE [address]
        SET deleted_at = GETDATE(), updated_at = GETDATE()
        WHERE id = @id AND entity_type = 'company'
      `);

    return { success: true, message: 'Address deleted successfully' };
  }
}
