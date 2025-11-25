import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import * as sql from 'mssql';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  CreateContactDto,
  UpdateContactDto,
  CreateAddressDto,
  UpdateAddressDto,
  CreateBenefitDto,
  UpdateBenefitDto,
  CreateDocumentDto,
  UpdateDocumentDto,
} from './dto/employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private readonly databaseService: DatabaseService) {}

  // ==================== EMPLOYEE CRUD ====================

  async create(tenantId: number, dto: CreateEmployeeDto) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('number', sql.Int, dto.number || null)
      .input('employeeTypeId', sql.Int, dto.employeeTypeId || null)
      .input('companyId', sql.Int, dto.companyId || null)
      .input('departmentId', sql.Int, dto.departmentId || null)
      .input('managerId', sql.Int, dto.managerId || null)
      .input('fullName', sql.NVarChar, dto.fullName)
      .input('shortName', sql.NVarChar, dto.shortName || null)
      .input('jobTitle', sql.NVarChar, dto.jobTitle || null)
      .input('gender', sql.NVarChar, dto.gender)
      .input('birthDate', sql.Date, dto.birthDate)
      .input('birthplace', sql.NVarChar, dto.birthplace || null)
      .input('nationality', sql.NVarChar, dto.nationality || null)
      .input('maritalStatus', sql.NVarChar, dto.maritalStatus || null)
      .input('photoUrl', sql.NVarChar, dto.photoUrl || null)
      .input('hireDate', sql.Date, dto.hireDate || null)
      .input('employmentStatus', sql.NVarChar, dto.employmentStatus || 'active')
      .input('notes', sql.NVarChar, dto.notes || null)
      .query(`
        INSERT INTO [employee] (
          number, employee_type_id, company_id, department_id, manager_id,
          full_name, short_name, job_title, gender, birth_date,
          birthplace, nationality, marital_status, photo_url,
          hire_date, employment_status, notes, created_at
        )
        OUTPUT INSERTED.id
        VALUES (
          @number, @employeeTypeId, @companyId, @departmentId, @managerId,
          @fullName, @shortName, @jobTitle, @gender, @birthDate,
          @birthplace, @nationality, @maritalStatus, @photoUrl,
          @hireDate, @employmentStatus, @notes, GETDATE()
        )
      `);

    return {
      id: result.recordset[0].id,
      success: true,
      message: 'Employee created successfully',
    };
  }

  async findAll(
    tenantId: number,
    filters: {
      employeeTypeId?: number;
      companyId?: number;
      departmentId?: number;
      employmentStatus?: string;
      searchText?: string;
      page?: number;
      pageSize?: number;
    },
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 50;
    const offset = (page - 1) * pageSize;

    const whereClauses: string[] = ['e.deleted_at IS NULL'];
    const request = pool.request();

    if (filters.employeeTypeId !== undefined) {
      whereClauses.push('e.employee_type_id = @employeeTypeId');
      request.input('employeeTypeId', sql.Int, filters.employeeTypeId);
    }

    if (filters.companyId !== undefined) {
      whereClauses.push('e.company_id = @companyId');
      request.input('companyId', sql.Int, filters.companyId);
    }

    if (filters.departmentId !== undefined) {
      whereClauses.push('e.department_id = @departmentId');
      request.input('departmentId', sql.Int, filters.departmentId);
    }

    if (filters.employmentStatus) {
      whereClauses.push('e.employment_status = @employmentStatus');
      request.input('employmentStatus', sql.NVarChar, filters.employmentStatus);
    }

    if (filters.searchText) {
      whereClauses.push(
        "(e.full_name LIKE '%' + @searchText + '%' OR e.short_name LIKE '%' + @searchText + '%' OR CAST(e.number AS NVARCHAR) LIKE '%' + @searchText + '%')",
      );
      request.input('searchText', sql.NVarChar, filters.searchText);
    }

    const whereClause = whereClauses.join(' AND ');

    // Count total
    const countResult = await request.query(`
      SELECT COUNT(*) as total
      FROM [employee] e
      WHERE ${whereClause}
    `);

    // Get data
    request.input('offset', sql.Int, offset);
    request.input('pageSize', sql.Int, pageSize);

    const dataResult = await request.query(`
      SELECT
        e.id,
        e.number,
        e.full_name as fullName,
        e.short_name as shortName,
        e.job_title as jobTitle,
        e.gender,
        e.birth_date as birthDate,
        DATEDIFF(YEAR, e.birth_date, GETDATE()) as age,
        e.nationality,
        e.photo_url as photoUrl,
        e.hire_date as hireDate,
        e.employment_status as employmentStatus,
        et.name as employeeTypeName,
        c.name as companyName,
        d.name as departmentName,
        m.full_name as managerName,
        (SELECT COUNT(*) FROM [benefit] WHERE employee_id = e.id AND deleted_at IS NULL) as totalBenefits,
        (SELECT COUNT(*) FROM [document] WHERE entity_type = 'employee' AND entity_id = e.id AND deleted_at IS NULL) as totalDocuments,
        e.created_at as createdAt,
        e.updated_at as updatedAt
      FROM [employee] e
      LEFT JOIN [employee_type] et ON e.employee_type_id = et.id AND et.deleted_at IS NULL
      LEFT JOIN [company] c ON e.company_id = c.id AND c.deleted_at IS NULL
      LEFT JOIN [department] d ON e.department_id = d.id AND d.deleted_at IS NULL
      LEFT JOIN [employee] m ON e.manager_id = m.id AND m.deleted_at IS NULL
      WHERE ${whereClause}
      ORDER BY e.full_name
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
          e.*,
          et.name as employeeTypeName,
          c.name as companyName,
          d.name as departmentName,
          m.full_name as managerName
        FROM [employee] e
        LEFT JOIN [employee_type] et ON e.employee_type_id = et.id AND et.deleted_at IS NULL
        LEFT JOIN [company] c ON e.company_id = c.id AND c.deleted_at IS NULL
        LEFT JOIN [department] d ON e.department_id = d.id AND d.deleted_at IS NULL
        LEFT JOIN [employee] m ON e.manager_id = m.id AND m.deleted_at IS NULL
        WHERE e.id = @id AND e.deleted_at IS NULL
      `);

    if (!result.recordset[0]) {
      throw new NotFoundException('Employee not found');
    }

    // Get related data
    const contacts = await this.findEmployeeContacts(tenantId, id);
    const addresses = await this.findEmployeeAddresses(tenantId, id);
    const benefits = await this.findEmployeeBenefits(tenantId, id);
    const documents = await this.findEmployeeDocuments(tenantId, id);

    return {
      ...result.recordset[0],
      contacts,
      addresses,
      benefits,
      documents,
    };
  }

  async update(tenantId: number, id: number, dto: UpdateEmployeeDto) {
    await this.findOne(tenantId, id);
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const setClauses: string[] = [];
    const request = pool.request();
    request.input('id', sql.Int, id);

    if (dto.number !== undefined) {
      setClauses.push('number = @number');
      request.input('number', sql.Int, dto.number);
    }
    if (dto.employeeTypeId !== undefined) {
      setClauses.push('employee_type_id = @employeeTypeId');
      request.input('employeeTypeId', sql.Int, dto.employeeTypeId);
    }
    if (dto.companyId !== undefined) {
      setClauses.push('company_id = @companyId');
      request.input('companyId', sql.Int, dto.companyId);
    }
    if (dto.departmentId !== undefined) {
      setClauses.push('department_id = @departmentId');
      request.input('departmentId', sql.Int, dto.departmentId);
    }
    if (dto.managerId !== undefined) {
      setClauses.push('manager_id = @managerId');
      request.input('managerId', sql.Int, dto.managerId);
    }
    if (dto.fullName) {
      setClauses.push('full_name = @fullName');
      request.input('fullName', sql.NVarChar, dto.fullName);
    }
    if (dto.shortName !== undefined) {
      setClauses.push('short_name = @shortName');
      request.input('shortName', sql.NVarChar, dto.shortName);
    }
    if (dto.jobTitle !== undefined) {
      setClauses.push('job_title = @jobTitle');
      request.input('jobTitle', sql.NVarChar, dto.jobTitle);
    }
    if (dto.gender) {
      setClauses.push('gender = @gender');
      request.input('gender', sql.NVarChar, dto.gender);
    }
    if (dto.birthDate) {
      setClauses.push('birth_date = @birthDate');
      request.input('birthDate', sql.Date, dto.birthDate);
    }
    if (dto.birthplace !== undefined) {
      setClauses.push('birthplace = @birthplace');
      request.input('birthplace', sql.NVarChar, dto.birthplace);
    }
    if (dto.nationality !== undefined) {
      setClauses.push('nationality = @nationality');
      request.input('nationality', sql.NVarChar, dto.nationality);
    }
    if (dto.maritalStatus !== undefined) {
      setClauses.push('marital_status = @maritalStatus');
      request.input('maritalStatus', sql.NVarChar, dto.maritalStatus);
    }
    if (dto.photoUrl !== undefined) {
      setClauses.push('photo_url = @photoUrl');
      request.input('photoUrl', sql.NVarChar, dto.photoUrl);
    }
    if (dto.hireDate !== undefined) {
      setClauses.push('hire_date = @hireDate');
      request.input('hireDate', sql.Date, dto.hireDate);
    }
    if (dto.terminationDate !== undefined) {
      setClauses.push('termination_date = @terminationDate');
      request.input('terminationDate', sql.Date, dto.terminationDate);
    }
    if (dto.employmentStatus !== undefined) {
      setClauses.push('employment_status = @employmentStatus');
      request.input('employmentStatus', sql.NVarChar, dto.employmentStatus);
    }
    if (dto.notes !== undefined) {
      setClauses.push('notes = @notes');
      request.input('notes', sql.NVarChar, dto.notes);
    }

    if (setClauses.length > 0) {
      setClauses.push('updated_at = GETDATE()');
      await request.query(`
        UPDATE [employee]
        SET ${setClauses.join(', ')}
        WHERE id = @id
      `);
    }

    return { success: true, message: 'Employee updated successfully' };
  }

  async remove(tenantId: number, id: number) {
    await this.findOne(tenantId, id);
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        UPDATE [employee]
        SET deleted_at = GETDATE(), updated_at = GETDATE()
        WHERE id = @id
      `);

    return { success: true, message: 'Employee deleted successfully' };
  }

  // ==================== EMPLOYEE TYPES ====================

  async findAllEmployeeTypes(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().query(`
      SELECT
        id,
        code,
        name,
        description,
        created_at as createdAt,
        updated_at as updatedAt
      FROM [employee_type]
      WHERE deleted_at IS NULL
      ORDER BY name
    `);

    return result.recordset;
  }

  // ==================== STATISTICS ====================

  async getStatistics(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().query(`
      SELECT
        COUNT(*) as totalEmployees,
        SUM(CASE WHEN employment_status = 'active' THEN 1 ELSE 0 END) as activeEmployees,
        SUM(CASE WHEN employment_status = 'on_leave' THEN 1 ELSE 0 END) as onLeaveEmployees,
        SUM(CASE WHEN employment_status = 'terminated' THEN 1 ELSE 0 END) as terminatedEmployees,
        SUM(CASE WHEN YEAR(hire_date) = YEAR(GETDATE()) AND MONTH(hire_date) = MONTH(GETDATE()) THEN 1 ELSE 0 END) as hiredThisMonth,
        AVG(DATEDIFF(YEAR, birth_date, GETDATE())) as averageAge
      FROM [employee]
      WHERE deleted_at IS NULL
    `);

    return result.recordset[0];
  }

  // ==================== CONTACTS ====================

  async findEmployeeContacts(tenantId: number, employeeId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('employeeId', sql.Int, employeeId)
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
        WHERE entity_type = 'employee' AND entity_id = @employeeId AND deleted_at IS NULL
        ORDER BY is_primary DESC, contact_type, contact_value
      `);

    return result.recordset;
  }

  async createContact(tenantId: number, dto: CreateContactDto) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('employeeId', sql.Int, dto.employeeId)
      .input('contactType', sql.NVarChar, dto.contactType)
      .input('contactValue', sql.NVarChar, dto.contactValue)
      .input('isPrimary', sql.Bit, dto.isPrimary ? 1 : 0)
      .input('label', sql.NVarChar, dto.label || null)
      .input('notes', sql.NVarChar, dto.notes || null)
      .query(`
        INSERT INTO [contact] (
          entity_type, entity_id, contact_type, contact_value, is_primary, label, notes, created_at
        )
        OUTPUT INSERTED.id
        VALUES (
          'employee', @employeeId, @contactType, @contactValue, @isPrimary, @label, @notes, GETDATE()
        )
      `);

    return { id: result.recordset[0].id, success: true, message: 'Contact created successfully' };
  }

  async updateContact(tenantId: number, id: number, dto: UpdateContactDto) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const setClauses: string[] = [];
    const request = pool.request();
    request.input('id', sql.Int, id);

    if (dto.contactType) {
      setClauses.push('contact_type = @contactType');
      request.input('contactType', sql.NVarChar, dto.contactType);
    }
    if (dto.contactValue) {
      setClauses.push('contact_value = @contactValue');
      request.input('contactValue', sql.NVarChar, dto.contactValue);
    }
    if (dto.isPrimary !== undefined) {
      setClauses.push('is_primary = @isPrimary');
      request.input('isPrimary', sql.Bit, dto.isPrimary ? 1 : 0);
    }
    if (dto.label !== undefined) {
      setClauses.push('label = @label');
      request.input('label', sql.NVarChar, dto.label);
    }
    if (dto.notes !== undefined) {
      setClauses.push('notes = @notes');
      request.input('notes', sql.NVarChar, dto.notes);
    }

    if (setClauses.length > 0) {
      setClauses.push('updated_at = GETDATE()');
      await request.query(`
        UPDATE [contact]
        SET ${setClauses.join(', ')}
        WHERE id = @id AND entity_type = 'employee'
      `);
    }

    return { success: true, message: 'Contact updated successfully' };
  }

  async removeContact(tenantId: number, id: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        UPDATE [contact]
        SET deleted_at = GETDATE(), updated_at = GETDATE()
        WHERE id = @id AND entity_type = 'employee'
      `);

    return { success: true, message: 'Contact deleted successfully' };
  }

  // ==================== ADDRESSES ====================

  async findEmployeeAddresses(tenantId: number, employeeId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('employeeId', sql.Int, employeeId)
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
        WHERE entity_type = 'employee' AND entity_id = @employeeId AND deleted_at IS NULL
        ORDER BY is_primary DESC, address_type
      `);

    return result.recordset;
  }

  async createAddress(tenantId: number, dto: CreateAddressDto) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('employeeId', sql.Int, dto.employeeId)
      .input('addressType', sql.NVarChar, dto.addressType)
      .input('isPrimary', sql.Bit, dto.isPrimary ? 1 : 0)
      .input('label', sql.NVarChar, dto.label || null)
      .input('streetLine1', sql.NVarChar, dto.streetLine1)
      .input('streetLine2', sql.NVarChar, dto.streetLine2 || null)
      .input('postalCode', sql.NVarChar, dto.postalCode || null)
      .input('city', sql.NVarChar, dto.city || null)
      .input('district', sql.NVarChar, dto.district || null)
      .input('state', sql.NVarChar, dto.state || null)
      .input('country', sql.NVarChar, dto.country)
      .input('notes', sql.NVarChar, dto.notes || null)
      .query(`
        INSERT INTO [address] (
          entity_type, entity_id, address_type, is_primary, label,
          street_line1, street_line2, postal_code, city, district, state, country, notes, created_at
        )
        OUTPUT INSERTED.id
        VALUES (
          'employee', @employeeId, @addressType, @isPrimary, @label,
          @streetLine1, @streetLine2, @postalCode, @city, @district, @state, @country, @notes, GETDATE()
        )
      `);

    return { id: result.recordset[0].id, success: true, message: 'Address created successfully' };
  }

  async updateAddress(tenantId: number, id: number, dto: UpdateAddressDto) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const setClauses: string[] = [];
    const request = pool.request();
    request.input('id', sql.Int, id);

    if (dto.addressType) {
      setClauses.push('address_type = @addressType');
      request.input('addressType', sql.NVarChar, dto.addressType);
    }
    if (dto.isPrimary !== undefined) {
      setClauses.push('is_primary = @isPrimary');
      request.input('isPrimary', sql.Bit, dto.isPrimary ? 1 : 0);
    }
    if (dto.label !== undefined) {
      setClauses.push('label = @label');
      request.input('label', sql.NVarChar, dto.label);
    }
    if (dto.streetLine1) {
      setClauses.push('street_line1 = @streetLine1');
      request.input('streetLine1', sql.NVarChar, dto.streetLine1);
    }
    if (dto.streetLine2 !== undefined) {
      setClauses.push('street_line2 = @streetLine2');
      request.input('streetLine2', sql.NVarChar, dto.streetLine2);
    }
    if (dto.postalCode !== undefined) {
      setClauses.push('postal_code = @postalCode');
      request.input('postalCode', sql.NVarChar, dto.postalCode);
    }
    if (dto.city !== undefined) {
      setClauses.push('city = @city');
      request.input('city', sql.NVarChar, dto.city);
    }
    if (dto.district !== undefined) {
      setClauses.push('district = @district');
      request.input('district', sql.NVarChar, dto.district);
    }
    if (dto.state !== undefined) {
      setClauses.push('state = @state');
      request.input('state', sql.NVarChar, dto.state);
    }
    if (dto.country) {
      setClauses.push('country = @country');
      request.input('country', sql.NVarChar, dto.country);
    }
    if (dto.notes !== undefined) {
      setClauses.push('notes = @notes');
      request.input('notes', sql.NVarChar, dto.notes);
    }

    if (setClauses.length > 0) {
      setClauses.push('updated_at = GETDATE()');
      await request.query(`
        UPDATE [address]
        SET ${setClauses.join(', ')}
        WHERE id = @id AND entity_type = 'employee'
      `);
    }

    return { success: true, message: 'Address updated successfully' };
  }

  async removeAddress(tenantId: number, id: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        UPDATE [address]
        SET deleted_at = GETDATE(), updated_at = GETDATE()
        WHERE id = @id AND entity_type = 'employee'
      `);

    return { success: true, message: 'Address deleted successfully' };
  }

  // ==================== BENEFITS ====================

  async findEmployeeBenefits(tenantId: number, employeeId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('employeeId', sql.Int, employeeId)
      .query(`
        SELECT
          id,
          employee_id as employeeId,
          benefit_type as benefitType,
          provider,
          policy_number as policyNumber,
          start_date as startDate,
          end_date as endDate,
          monthly_cost as monthlyCost,
          employee_contribution as employeeContribution,
          company_contribution as companyContribution,
          notes,
          created_at as createdAt,
          updated_at as updatedAt
        FROM [benefit]
        WHERE employee_id = @employeeId AND deleted_at IS NULL
        ORDER BY start_date DESC
      `);

    return result.recordset;
  }

  async createBenefit(tenantId: number, dto: CreateBenefitDto) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('employeeId', sql.Int, dto.employeeId)
      .input('benefitType', sql.NVarChar, dto.benefitType)
      .input('provider', sql.NVarChar, dto.provider || null)
      .input('policyNumber', sql.NVarChar, dto.policyNumber || null)
      .input('startDate', sql.Date, dto.startDate)
      .input('endDate', sql.Date, dto.endDate || null)
      .input('monthlyCost', sql.Decimal(18, 2), dto.monthlyCost || null)
      .input('employeeContribution', sql.Decimal(18, 2), dto.employeeContribution || null)
      .input('companyContribution', sql.Decimal(18, 2), dto.companyContribution || null)
      .input('notes', sql.NVarChar, dto.notes || null)
      .query(`
        INSERT INTO [benefit] (
          employee_id, benefit_type, provider, policy_number, start_date, end_date,
          monthly_cost, employee_contribution, company_contribution, notes, created_at
        )
        OUTPUT INSERTED.id
        VALUES (
          @employeeId, @benefitType, @provider, @policyNumber, @startDate, @endDate,
          @monthlyCost, @employeeContribution, @companyContribution, @notes, GETDATE()
        )
      `);

    return { id: result.recordset[0].id, success: true, message: 'Benefit created successfully' };
  }

  async updateBenefit(tenantId: number, id: number, dto: UpdateBenefitDto) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const setClauses: string[] = [];
    const request = pool.request();
    request.input('id', sql.Int, id);

    if (dto.benefitType) {
      setClauses.push('benefit_type = @benefitType');
      request.input('benefitType', sql.NVarChar, dto.benefitType);
    }
    if (dto.provider !== undefined) {
      setClauses.push('provider = @provider');
      request.input('provider', sql.NVarChar, dto.provider);
    }
    if (dto.policyNumber !== undefined) {
      setClauses.push('policy_number = @policyNumber');
      request.input('policyNumber', sql.NVarChar, dto.policyNumber);
    }
    if (dto.startDate) {
      setClauses.push('start_date = @startDate');
      request.input('startDate', sql.Date, dto.startDate);
    }
    if (dto.endDate !== undefined) {
      setClauses.push('end_date = @endDate');
      request.input('endDate', sql.Date, dto.endDate);
    }
    if (dto.monthlyCost !== undefined) {
      setClauses.push('monthly_cost = @monthlyCost');
      request.input('monthlyCost', sql.Decimal(18, 2), dto.monthlyCost);
    }
    if (dto.employeeContribution !== undefined) {
      setClauses.push('employee_contribution = @employeeContribution');
      request.input('employeeContribution', sql.Decimal(18, 2), dto.employeeContribution);
    }
    if (dto.companyContribution !== undefined) {
      setClauses.push('company_contribution = @companyContribution');
      request.input('companyContribution', sql.Decimal(18, 2), dto.companyContribution);
    }
    if (dto.notes !== undefined) {
      setClauses.push('notes = @notes');
      request.input('notes', sql.NVarChar, dto.notes);
    }

    if (setClauses.length > 0) {
      setClauses.push('updated_at = GETDATE()');
      await request.query(`
        UPDATE [benefit]
        SET ${setClauses.join(', ')}
        WHERE id = @id
      `);
    }

    return { success: true, message: 'Benefit updated successfully' };
  }

  async removeBenefit(tenantId: number, id: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        UPDATE [benefit]
        SET deleted_at = GETDATE(), updated_at = GETDATE()
        WHERE id = @id
      `);

    return { success: true, message: 'Benefit deleted successfully' };
  }

  // ==================== DOCUMENTS ====================

  async findEmployeeDocuments(tenantId: number, employeeId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('employeeId', sql.Int, employeeId)
      .query(`
        SELECT
          id,
          document_type as documentType,
          document_number as documentNumber,
          title,
          description,
          file_path as filePath,
          file_name as fileName,
          file_size as fileSize,
          mime_type as mimeType,
          issue_date as issueDate,
          expiry_date as expiryDate,
          is_confidential as isConfidential,
          created_at as createdAt,
          updated_at as updatedAt
        FROM [document]
        WHERE entity_type = 'employee' AND entity_id = @employeeId AND deleted_at IS NULL
        ORDER BY created_at DESC
      `);

    return result.recordset;
  }

  async createDocument(tenantId: number, dto: CreateDocumentDto) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('employeeId', sql.Int, dto.employeeId)
      .input('documentType', sql.NVarChar, dto.documentType)
      .input('documentNumber', sql.NVarChar, dto.documentNumber || null)
      .input('title', sql.NVarChar, dto.title)
      .input('description', sql.NVarChar, dto.description || null)
      .input('filePath', sql.NVarChar, dto.filePath)
      .input('fileName', sql.NVarChar, dto.fileName)
      .input('fileSize', sql.BigInt, dto.fileSize || null)
      .input('mimeType', sql.NVarChar, dto.mimeType || null)
      .input('issueDate', sql.Date, dto.issueDate || null)
      .input('expiryDate', sql.Date, dto.expiryDate || null)
      .input('isConfidential', sql.Bit, dto.isConfidential ? 1 : 0)
      .query(`
        INSERT INTO [document] (
          entity_type, entity_id, document_type, document_number, title, description,
          file_path, file_name, file_size, mime_type, issue_date, expiry_date, is_confidential, created_at
        )
        OUTPUT INSERTED.id
        VALUES (
          'employee', @employeeId, @documentType, @documentNumber, @title, @description,
          @filePath, @fileName, @fileSize, @mimeType, @issueDate, @expiryDate, @isConfidential, GETDATE()
        )
      `);

    return { id: result.recordset[0].id, success: true, message: 'Document created successfully' };
  }

  async updateDocument(tenantId: number, id: number, dto: UpdateDocumentDto) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const setClauses: string[] = [];
    const request = pool.request();
    request.input('id', sql.Int, id);

    if (dto.documentType) {
      setClauses.push('document_type = @documentType');
      request.input('documentType', sql.NVarChar, dto.documentType);
    }
    if (dto.documentNumber !== undefined) {
      setClauses.push('document_number = @documentNumber');
      request.input('documentNumber', sql.NVarChar, dto.documentNumber);
    }
    if (dto.title) {
      setClauses.push('title = @title');
      request.input('title', sql.NVarChar, dto.title);
    }
    if (dto.description !== undefined) {
      setClauses.push('description = @description');
      request.input('description', sql.NVarChar, dto.description);
    }
    if (dto.filePath) {
      setClauses.push('file_path = @filePath');
      request.input('filePath', sql.NVarChar, dto.filePath);
    }
    if (dto.fileName) {
      setClauses.push('file_name = @fileName');
      request.input('fileName', sql.NVarChar, dto.fileName);
    }
    if (dto.fileSize !== undefined) {
      setClauses.push('file_size = @fileSize');
      request.input('fileSize', sql.BigInt, dto.fileSize);
    }
    if (dto.mimeType !== undefined) {
      setClauses.push('mime_type = @mimeType');
      request.input('mimeType', sql.NVarChar, dto.mimeType);
    }
    if (dto.issueDate !== undefined) {
      setClauses.push('issue_date = @issueDate');
      request.input('issueDate', sql.Date, dto.issueDate);
    }
    if (dto.expiryDate !== undefined) {
      setClauses.push('expiry_date = @expiryDate');
      request.input('expiryDate', sql.Date, dto.expiryDate);
    }
    if (dto.isConfidential !== undefined) {
      setClauses.push('is_confidential = @isConfidential');
      request.input('isConfidential', sql.Bit, dto.isConfidential ? 1 : 0);
    }

    if (setClauses.length > 0) {
      setClauses.push('updated_at = GETDATE()');
      await request.query(`
        UPDATE [document]
        SET ${setClauses.join(', ')}
        WHERE id = @id AND entity_type = 'employee'
      `);
    }

    return { success: true, message: 'Document updated successfully' };
  }

  async removeDocument(tenantId: number, id: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        UPDATE [document]
        SET deleted_at = GETDATE(), updated_at = GETDATE()
        WHERE id = @id AND entity_type = 'employee'
      `);

    return { success: true, message: 'Document deleted successfully' };
  }
}
