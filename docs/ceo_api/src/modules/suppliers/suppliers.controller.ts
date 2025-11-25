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
import { SuppliersService } from './suppliers.service';
import {
  CreateSupplierDto,
  UpdateSupplierDto,
  SupplierStatsDto,
  BlockSupplierDto,
} from './dto/supplier.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Suppliers')
@ApiBearerAuth()
@Controller('suppliers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  // ==================== SUPPLIERS CRUD ====================

  @Post()
  @RequirePermissions('suppliers.create')
  @ApiOperation({
    summary: 'Create new supplier',
    description:
      'Creates a new supplier record with all relevant information including supplier type, payment terms, and ratings.',
  })
  @ApiBody({ type: CreateSupplierDto })
  @ApiResponse({
    status: 201,
    description: 'Supplier created successfully',
    schema: {
      example: {
        id: 1,
        success: true,
        message: 'Supplier created successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data or duplicate supplier code' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async create(@Request() req, @Body(ValidationPipe) createSupplierDto: CreateSupplierDto) {
    return this.suppliersService.create(req.user.tenantId, createSupplierDto);
  }

  @Get()
  @RequirePermissions('suppliers.view')
  @ApiOperation({
    summary: 'List all suppliers',
    description:
      'Returns a paginated list of suppliers with optional filtering by supplier type, status, company, and text search. Supports searching by supplier name, code, or tax ID.',
  })
  @ApiQuery({
    name: 'supplierType',
    required: false,
    type: String,
    description: 'Filter by supplier type',
    enum: ['manufacturer', 'distributor', 'wholesaler', 'service_provider'],
    example: 'distributor',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by supplier status',
    enum: ['active', 'inactive', 'blocked', 'pending'],
    example: 'active',
  })
  @ApiQuery({
    name: 'companyId',
    required: false,
    type: Number,
    description: 'Filter by associated company ID',
    example: 1,
  })
  @ApiQuery({
    name: 'searchText',
    required: false,
    type: String,
    description: 'Search in supplier name, code, or tax ID',
    example: 'Tech',
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
    description: 'List of suppliers retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: 1,
            code: 'SUP001',
            name: 'Tech Supplies Ltd',
            taxId: '987654321',
            supplierType: 'distributor',
            paymentTerms: '30_days',
            rating: 4,
            status: 'active',
            companyId: 1,
            company_name: 'Tech Company',
            company_trade_name: 'TechCo',
            company_tax_id: '123456789',
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
    @Query('supplierType') supplierType?: string,
    @Query('status') status?: string,
    @Query('companyId', new ParseIntPipe({ optional: true })) companyId?: number,
    @Query('searchText') searchText?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize?: number,
  ) {
    return this.suppliersService.findAll(req.user.tenantId, {
      supplierType,
      status,
      companyId,
      searchText,
      page,
      pageSize,
    });
  }

  @Get('statistics')
  @RequirePermissions('suppliers.view')
  @ApiOperation({
    summary: 'Get supplier statistics',
    description:
      'Returns statistical data about suppliers including total count, active suppliers, blocked suppliers, breakdown by type, and suppliers added this month.',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    type: SupplierStatsDto,
    schema: {
      example: {
        totalSuppliers: 120,
        activeSuppliers: 110,
        blockedSuppliers: 3,
        manufacturers: 45,
        distributors: 75,
        suppliersThisMonth: 8,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async getStatistics(@Request() req) {
    return this.suppliersService.getStatistics(req.user.tenantId);
  }

  @Get(':id')
  @RequirePermissions('suppliers.view')
  @ApiOperation({
    summary: 'Get supplier by ID',
    description:
      'Returns detailed information about a specific supplier including all related contacts and addresses.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Supplier ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Supplier details retrieved successfully',
    schema: {
      example: {
        id: 1,
        code: 'SUP001',
        name: 'Tech Supplies Ltd',
        taxId: '987654321',
        supplierType: 'distributor',
        paymentTerms: '30_days',
        rating: 4,
        status: 'active',
        notes: 'Reliable supplier',
        companyId: 1,
        company_name: 'Tech Company',
        company_trade_name: 'TechCo',
        company_tax_id: '123456789',
        company_logo: 'https://example.com/logo.png',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: null,
        contacts: [
          {
            id: 1,
            contactType: 'email',
            contactValue: 'sales@techsupplies.com',
            label: 'Sales Department',
            isPrimary: true,
          },
        ],
        addresses: [
          {
            id: 1,
            addressType: 'headquarters',
            street: 'Tech Street',
            city: 'Lisbon',
            country: 'Portugal',
            isPrimary: true,
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.suppliersService.findOne(req.user.tenantId, id);
  }

  @Get('company/:companyId')
  @RequirePermissions('suppliers.view')
  @ApiOperation({
    summary: 'Get supplier by company ID',
    description: 'Returns the supplier record associated with a specific company.',
  })
  @ApiParam({
    name: 'companyId',
    type: Number,
    description: 'Company ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Supplier retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Supplier not found for this company' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async findByCompanyId(@Request() req, @Param('companyId', ParseIntPipe) companyId: number) {
    return this.suppliersService.findByCompanyId(req.user.tenantId, companyId);
  }

  @Put(':id')
  @RequirePermissions('suppliers.update')
  @ApiOperation({
    summary: 'Update supplier',
    description:
      'Updates supplier information. All fields are optional - only provided fields will be updated.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Supplier ID',
    example: 1,
  })
  @ApiBody({ type: UpdateSupplierDto })
  @ApiResponse({
    status: 200,
    description: 'Supplier updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Supplier updated successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data or duplicate supplier code' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(req.user.tenantId, id, updateSupplierDto);
  }

  @Delete(':id')
  @RequirePermissions('suppliers.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete supplier',
    description:
      'Soft deletes a supplier. The supplier will be marked as deleted but data will be preserved in the database for audit purposes.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Supplier ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Supplier deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Supplier deleted successfully',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.suppliersService.remove(req.user.tenantId, id);
  }

  @Patch(':id/block')
  @RequirePermissions('suppliers.block')
  @ApiOperation({
    summary: 'Block supplier',
    description:
      'Blocks a supplier and records the reason. The supplier status will be set to "blocked" and the reason will be added to the notes.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Supplier ID',
    example: 1,
  })
  @ApiBody({ type: BlockSupplierDto })
  @ApiResponse({
    status: 200,
    description: 'Supplier blocked successfully',
    schema: {
      example: {
        success: true,
        message: 'Supplier blocked successfully',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async block(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) blockSupplierDto: BlockSupplierDto,
  ) {
    return this.suppliersService.block(req.user.tenantId, id, blockSupplierDto.reason);
  }

  @Patch(':id/unblock')
  @RequirePermissions('suppliers.block')
  @ApiOperation({
    summary: 'Unblock supplier',
    description: 'Unblocks a supplier by setting the status back to "active".',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Supplier ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Supplier unblocked successfully',
    schema: {
      example: {
        success: true,
        message: 'Supplier unblocked successfully',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async unblock(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.suppliersService.unblock(req.user.tenantId, id);
  }

  // ==================== CONTACTS MANAGEMENT ====================

  @Get(':id/contacts')
  @RequirePermissions('suppliers.view')
  @ApiOperation({
    summary: 'Get supplier contacts',
    description:
      'Returns all contact information (emails, phones, etc.) associated with a specific supplier.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Supplier ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Supplier contacts retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          entityType: 'supplier',
          entityId: 1,
          contactType: 'email',
          contactValue: 'sales@supplier.com',
          label: 'Sales Department',
          isPrimary: true,
          isActive: true,
          notes: 'Main contact',
          createdAt: '2024-01-15T10:30:00Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async getSupplierContacts(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.suppliersService.findSupplierContacts(req.user.tenantId, id);
  }

  @Post('contacts')
  @RequirePermissions('suppliers.update')
  @ApiOperation({
    summary: 'Add contact to supplier',
    description:
      'Adds a new contact (email, phone, mobile, fax, website, social media) to a supplier.',
  })
  @ApiBody({
    schema: {
      example: {
        supplierId: 1,
        contactType: 'email',
        contactValue: 'orders@supplier.com',
        label: 'Orders Department',
        isPrimary: false,
        isActive: true,
        notes: 'For purchase orders',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Contact added successfully',
    schema: {
      example: {
        id: 2,
        success: true,
        message: 'Contact added successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async createContact(@Request() req, @Body() contactData: any) {
    return this.suppliersService.createContact(
      req.user.tenantId,
      contactData.supplierId,
      contactData,
    );
  }

  @Put('contacts/:id')
  @RequirePermissions('suppliers.update')
  @ApiOperation({
    summary: 'Update supplier contact',
    description: 'Updates an existing contact for a supplier.',
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
        contactValue: 'newemail@supplier.com',
        label: 'Updated Contact',
        isPrimary: true,
        isActive: true,
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
    return this.suppliersService.updateContact(req.user.tenantId, id, contactData);
  }

  @Delete('contacts/:id')
  @RequirePermissions('suppliers.update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete supplier contact',
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
    return this.suppliersService.deleteContact(req.user.tenantId, id);
  }

  // ==================== ADDRESSES MANAGEMENT ====================

  @Get(':id/addresses')
  @RequirePermissions('suppliers.view')
  @ApiOperation({
    summary: 'Get supplier addresses',
    description:
      'Returns all addresses (headquarters, warehouse, etc.) associated with a specific supplier.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Supplier ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Supplier addresses retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          entityType: 'supplier',
          entityId: 1,
          addressType: 'headquarters',
          street: 'Supplier Street',
          streetNumber: '100',
          postalCode: '1000-001',
          city: 'Lisbon',
          region: 'Lisboa',
          country: 'Portugal',
          isPrimary: true,
          isActive: true,
          createdAt: '2024-01-15T10:30:00Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async getSupplierAddresses(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.suppliersService.findSupplierAddresses(req.user.tenantId, id);
  }

  @Post('addresses')
  @RequirePermissions('suppliers.update')
  @ApiOperation({
    summary: 'Add address to supplier',
    description: 'Adds a new address (headquarters, warehouse, branch, etc.) to a supplier.',
  })
  @ApiBody({
    schema: {
      example: {
        supplierId: 1,
        addressType: 'warehouse',
        street: 'Warehouse Street',
        streetNumber: '200',
        postalCode: '1100-001',
        city: 'Porto',
        region: 'Porto',
        country: 'Portugal',
        isPrimary: false,
        isActive: true,
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
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async createAddress(@Request() req, @Body() addressData: any) {
    return this.suppliersService.createAddress(
      req.user.tenantId,
      addressData.supplierId,
      addressData,
    );
  }

  @Put('addresses/:id')
  @RequirePermissions('suppliers.update')
  @ApiOperation({
    summary: 'Update supplier address',
    description: 'Updates an existing address for a supplier.',
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
        street: 'Updated Street',
        streetNumber: '300',
        city: 'Coimbra',
        isPrimary: true,
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
    return this.suppliersService.updateAddress(req.user.tenantId, id, addressData);
  }

  @Delete('addresses/:id')
  @RequirePermissions('suppliers.update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete supplier address',
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
    return this.suppliersService.deleteAddress(req.user.tenantId, id);
  }
}
