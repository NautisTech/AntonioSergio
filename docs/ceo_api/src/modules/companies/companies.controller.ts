import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  ValidationPipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import {
  CreateCompanyDto,
  UpdateCompanyDto,
  CompanyStatsDto,
} from './dto/company.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Companies')
@ApiBearerAuth()
@Controller('companies')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  // ==================== COMPANIES CRUD ====================

  @Post()
  @RequirePermissions('companies.create')
  @ApiOperation({
    summary: 'Create new company',
    description:
      'Creates a new company record with all relevant information including legal details, commercial terms, and integration data.',
  })
  @ApiBody({ type: CreateCompanyDto })
  @ApiResponse({
    status: 201,
    description: 'Company created successfully',
    schema: {
      example: {
        id: 1,
        success: true,
        message: 'Company created successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data or duplicate company code' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async create(@Request() req, @Body(ValidationPipe) createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(req.user.tenantId, createCompanyDto);
  }

  @Get()
  @RequirePermissions('companies.view')
  @ApiOperation({
    summary: 'List all companies',
    description:
      'Returns a paginated list of companies with optional filtering by company type, status, and text search. Supports searching by company name, code, or tax ID.',
  })
  @ApiQuery({
    name: 'companyType',
    required: false,
    type: String,
    description: 'Filter by company type',
    enum: ['client', 'supplier', 'partner', 'internal'],
    example: 'client',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by company status',
    enum: ['active', 'inactive', 'pending', 'suspended'],
    example: 'active',
  })
  @ApiQuery({
    name: 'searchText',
    required: false,
    type: String,
    description: 'Search in company name, code, or tax ID',
    example: 'Acme',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'List of companies retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: 1,
            code: 'COMP001',
            name: 'Acme Corporation',
            tradeName: 'Acme',
            taxId: '123456789',
            companyType: 'client',
            status: 'active',
            creditLimit: 10000.0,
            rating: 4,
            createdAt: '2024-01-15T10:30:00Z',
          },
        ],
        total: 50,
        page: 1,
        pageSize: 20,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async findAll(
    @Request() req,
    @Query('companyType') companyType?: string,
    @Query('status') status?: string,
    @Query('searchText') searchText?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize?: number,
  ) {
    return this.companiesService.findAll(req.user.tenantId, {
      companyType,
      status,
      searchText,
      page,
      pageSize,
    });
  }

  @Get('statistics')
  @RequirePermissions('companies.view')
  @ApiOperation({
    summary: 'Get company statistics',
    description:
      'Returns statistical data about companies including total count, active companies, breakdown by type (clients, suppliers, partners), and companies added this month.',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    type: CompanyStatsDto,
    schema: {
      example: {
        totalCompanies: 150,
        activeCompanies: 135,
        clients: 80,
        suppliers: 45,
        partners: 25,
        companiesThisMonth: 8,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async getStatistics(@Request() req) {
    return this.companiesService.getStatistics(req.user.tenantId);
  }

  @Get(':id')
  @RequirePermissions('companies.view')
  @ApiOperation({
    summary: 'Get company by ID',
    description:
      'Returns detailed information about a specific company including all related contacts and addresses.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Company ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Company details retrieved successfully',
    schema: {
      example: {
        id: 1,
        code: 'COMP001',
        name: 'Acme Corporation',
        tradeName: 'Acme',
        legalName: 'Acme Corporation, LDA',
        taxId: '123456789',
        logoUrl: 'https://example.com/logo.png',
        color: '#FF5733',
        companyType: 'client',
        legalNature: 'LDA',
        shareCapital: 50000.0,
        registrationNumber: '1234/567890',
        incorporationDate: '2010-05-15',
        segment: 'Technology',
        industrySector: 'Retail',
        caeCode: '47190',
        clientNumber: 'CLI001',
        supplierNumber: null,
        paymentTerms: '30_days',
        preferredPaymentMethod: 'bank_transfer',
        creditLimit: 10000.0,
        commercialDiscount: 5.5,
        rating: 4,
        status: 'active',
        notes: 'Important client',
        externalRef: 'EXT123',
        phcId: 'PHC456',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: null,
        contacts: [
          {
            id: 1,
            contactType: 'email',
            contactValue: 'info@acme.com',
            label: 'Main Email',
            isPrimary: true,
          },
        ],
        addresses: [
          {
            id: 1,
            addressType: 'billing',
            street: '123 Main St',
            city: 'Lisbon',
            country: 'Portugal',
            isPrimary: true,
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.companiesService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  @RequirePermissions('companies.update')
  @ApiOperation({
    summary: 'Update company',
    description:
      'Updates company information. All fields are optional - only provided fields will be updated.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Company ID',
    example: 1,
  })
  @ApiBody({ type: UpdateCompanyDto })
  @ApiResponse({
    status: 200,
    description: 'Company updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Company updated successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data or duplicate company code' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateCompanyDto: UpdateCompanyDto,
  ) {
    return this.companiesService.update(req.user.tenantId, id, updateCompanyDto);
  }

  @Delete(':id')
  @RequirePermissions('companies.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete company',
    description:
      'Soft deletes a company. The company will be marked as deleted but data will be preserved in the database for audit purposes.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Company ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Company deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Company deleted successfully',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.companiesService.remove(req.user.tenantId, id);
  }

  // ==================== CONTACTS MANAGEMENT ====================

  @Get(':id/contacts')
  @RequirePermissions('companies.view')
  @ApiOperation({
    summary: 'Get company contacts',
    description:
      'Returns all contact information (emails, phones, etc.) associated with a specific company.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Company ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Company contacts retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          entityType: 'company',
          entityId: 1,
          contactType: 'email',
          contactValue: 'info@acme.com',
          label: 'Main Email',
          isPrimary: true,
          isActive: true,
          notes: 'General inquiries',
          createdAt: '2024-01-15T10:30:00Z',
        },
        {
          id: 2,
          entityType: 'company',
          entityId: 1,
          contactType: 'phone',
          contactValue: '+351 21 123 4567',
          label: 'Main Phone',
          isPrimary: true,
          isActive: true,
          notes: null,
          createdAt: '2024-01-15T10:30:00Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async getCompanyContacts(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.companiesService.findCompanyContacts(req.user.tenantId, id);
  }

  @Post('contacts')
  @RequirePermissions('companies.update')
  @ApiOperation({
    summary: 'Add contact to company',
    description:
      'Adds a new contact (email, phone, mobile, fax, website, social media) to a company.',
  })
  @ApiBody({
    schema: {
      example: {
        companyId: 1,
        contactType: 'email',
        contactValue: 'sales@acme.com',
        label: 'Sales Department',
        isPrimary: false,
        isActive: true,
        notes: 'Sales inquiries only',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Contact added successfully',
    schema: {
      example: {
        id: 3,
        success: true,
        message: 'Contact added successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async createContact(@Request() req, @Body() contactData: any) {
    return this.companiesService.createContact(
      req.user.tenantId,
      contactData.companyId,
      contactData,
    );
  }

  @Put('contacts/:id')
  @RequirePermissions('companies.update')
  @ApiOperation({
    summary: 'Update company contact',
    description: 'Updates an existing contact for a company.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Contact ID',
    example: 1,
  })
  @ApiBody({
    schema: {
      example: {
        contactValue: 'newemail@acme.com',
        label: 'Updated Email',
        isPrimary: true,
        isActive: true,
        notes: 'Updated contact information',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Contact updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Contact updated successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async updateContact(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() contactData: any,
  ) {
    return this.companiesService.updateContact(req.user.tenantId, id, contactData);
  }

  @Delete('contacts/:id')
  @RequirePermissions('companies.update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete company contact',
    description:
      'Soft deletes a contact. The contact will be marked as deleted but preserved in the database.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Contact ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Contact deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Contact deleted successfully',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async deleteContact(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.companiesService.deleteContact(req.user.tenantId, id);
  }

  // ==================== ADDRESSES MANAGEMENT ====================

  @Get(':id/addresses')
  @RequirePermissions('companies.view')
  @ApiOperation({
    summary: 'Get company addresses',
    description:
      'Returns all addresses (billing, shipping, headquarters, etc.) associated with a specific company.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Company ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Company addresses retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          entityType: 'company',
          entityId: 1,
          addressType: 'billing',
          street: '123 Main St',
          streetNumber: '456',
          floor: '3',
          apartment: 'A',
          postalCode: '1000-001',
          city: 'Lisbon',
          region: 'Lisboa',
          country: 'Portugal',
          isPrimary: true,
          isActive: true,
          notes: 'Main office',
          createdAt: '2024-01-15T10:30:00Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async getCompanyAddresses(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.companiesService.findCompanyAddresses(req.user.tenantId, id);
  }

  @Post('addresses')
  @RequirePermissions('companies.update')
  @ApiOperation({
    summary: 'Add address to company',
    description:
      'Adds a new address (billing, shipping, headquarters, branch, warehouse) to a company.',
  })
  @ApiBody({
    schema: {
      example: {
        companyId: 1,
        addressType: 'shipping',
        street: 'Rua da Prata',
        streetNumber: '100',
        floor: '2',
        apartment: 'B',
        postalCode: '1100-420',
        city: 'Lisbon',
        region: 'Lisboa',
        country: 'Portugal',
        isPrimary: false,
        isActive: true,
        notes: 'Warehouse location',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Address added successfully',
    schema: {
      example: {
        id: 2,
        success: true,
        message: 'Address added successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async createAddress(@Request() req, @Body() addressData: any) {
    return this.companiesService.createAddress(
      req.user.tenantId,
      addressData.companyId,
      addressData,
    );
  }

  @Put('addresses/:id')
  @RequirePermissions('companies.update')
  @ApiOperation({
    summary: 'Update company address',
    description: 'Updates an existing address for a company.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Address ID',
    example: 1,
  })
  @ApiBody({
    schema: {
      example: {
        street: 'Updated Street Name',
        streetNumber: '789',
        postalCode: '1200-001',
        city: 'Porto',
        isPrimary: true,
        notes: 'Updated address',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Address updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Address updated successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async updateAddress(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() addressData: any,
  ) {
    return this.companiesService.updateAddress(req.user.tenantId, id, addressData);
  }

  @Delete('addresses/:id')
  @RequirePermissions('companies.update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete company address',
    description:
      'Soft deletes an address. The address will be marked as deleted but preserved in the database.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Address ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Address deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Address deleted successfully',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Address not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async deleteAddress(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.companiesService.deleteAddress(req.user.tenantId, id);
  }
}
