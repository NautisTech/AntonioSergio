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
import { ClientsService } from './clients.service';
import {
  CreateClientDto,
  UpdateClientDto,
  ClientStatsDto,
  BlockClientDto,
} from './dto/client.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Clients')
@ApiBearerAuth()
@Controller('clients')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  // ==================== CLIENTS CRUD ====================

  @Post()
  @RequirePermissions('clients.create')
  @ApiOperation({
    summary: 'Create new client',
    description:
      'Creates a new client record with all relevant information including business segment, credit limits, and payment terms.',
  })
  @ApiBody({ type: CreateClientDto })
  @ApiResponse({
    status: 201,
    description: 'Client created successfully',
    schema: {
      example: {
        id: 1,
        success: true,
        message: 'Client created successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data or duplicate client code' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async create(@Request() req, @Body(ValidationPipe) createClientDto: CreateClientDto) {
    return this.clientsService.create(req.user.tenantId, createClientDto);
  }

  @Get()
  @RequirePermissions('clients.view')
  @ApiOperation({
    summary: 'List all clients',
    description:
      'Returns a paginated list of clients with optional filtering by client type, status, company, and text search. Supports searching by client name, code, or tax ID.',
  })
  @ApiQuery({
    name: 'clientType',
    required: false,
    type: String,
    description: 'Filter by client type',
    enum: ['individual', 'corporate', 'government', 'reseller'],
    example: 'corporate',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by client status',
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
    description: 'Search in client name, code, or tax ID',
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
    description: 'List of clients retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: 1,
            code: 'CLI001',
            name: 'Acme Corp Client',
            taxId: '123456789',
            clientType: 'corporate',
            segment: 'Retail',
            status: 'active',
            rating: 4,
            creditLimit: 10000.0,
            paymentTerms: '30_days',
            companyId: 1,
            company_name: 'Acme Corporation',
            company_trade_name: 'Acme',
            company_tax_id: '987654321',
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
    @Query('clientType') clientType?: string,
    @Query('status') status?: string,
    @Query('companyId', new ParseIntPipe({ optional: true })) companyId?: number,
    @Query('searchText') searchText?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize?: number,
  ) {
    return this.clientsService.findAll(req.user.tenantId, {
      clientType,
      status,
      companyId,
      searchText,
      page,
      pageSize,
    });
  }

  @Get('statistics')
  @RequirePermissions('clients.view')
  @ApiOperation({
    summary: 'Get client statistics',
    description:
      'Returns statistical data about clients including total count, active clients, blocked clients, breakdown by type, and clients added this month.',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    type: ClientStatsDto,
    schema: {
      example: {
        totalClients: 150,
        activeClients: 135,
        blockedClients: 5,
        individualClients: 60,
        corporateClients: 90,
        clientsThisMonth: 12,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async getStatistics(@Request() req) {
    return this.clientsService.getStatistics(req.user.tenantId);
  }

  @Get(':id')
  @RequirePermissions('clients.view')
  @ApiOperation({
    summary: 'Get client by ID',
    description:
      'Returns detailed information about a specific client including all related contacts and addresses.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Client ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Client details retrieved successfully',
    schema: {
      example: {
        id: 1,
        code: 'CLI001',
        name: 'Acme Corp Client',
        taxId: '123456789',
        clientType: 'corporate',
        segment: 'Retail',
        status: 'active',
        rating: 4,
        creditLimit: 10000.0,
        paymentTerms: '30_days',
        notes: 'VIP client',
        companyId: 1,
        company_name: 'Acme Corporation',
        company_trade_name: 'Acme',
        company_tax_id: '987654321',
        company_logo: 'https://example.com/logo.png',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: null,
        contacts: [
          {
            id: 1,
            contactType: 'email',
            contactValue: 'contact@acme.com',
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
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.clientsService.findOne(req.user.tenantId, id);
  }

  @Get('company/:companyId')
  @RequirePermissions('clients.view')
  @ApiOperation({
    summary: 'Get client by company ID',
    description: 'Returns the client record associated with a specific company.',
  })
  @ApiParam({
    name: 'companyId',
    type: Number,
    description: 'Company ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Client retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Client not found for this company' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async findByCompanyId(@Request() req, @Param('companyId', ParseIntPipe) companyId: number) {
    return this.clientsService.findByCompanyId(req.user.tenantId, companyId);
  }

  @Put(':id')
  @RequirePermissions('clients.update')
  @ApiOperation({
    summary: 'Update client',
    description:
      'Updates client information. All fields are optional - only provided fields will be updated.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Client ID',
    example: 1,
  })
  @ApiBody({ type: UpdateClientDto })
  @ApiResponse({
    status: 200,
    description: 'Client updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Client updated successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data or duplicate client code' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateClientDto: UpdateClientDto,
  ) {
    return this.clientsService.update(req.user.tenantId, id, updateClientDto);
  }

  @Delete(':id')
  @RequirePermissions('clients.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete client',
    description:
      'Soft deletes a client. The client will be marked as deleted but data will be preserved in the database for audit purposes.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Client ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Client deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Client deleted successfully',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.clientsService.remove(req.user.tenantId, id);
  }

  @Patch(':id/block')
  @RequirePermissions('clients.block')
  @ApiOperation({
    summary: 'Block client',
    description:
      'Blocks a client and records the reason. The client status will be set to "blocked" and the reason will be added to the notes.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Client ID',
    example: 1,
  })
  @ApiBody({ type: BlockClientDto })
  @ApiResponse({
    status: 200,
    description: 'Client blocked successfully',
    schema: {
      example: {
        success: true,
        message: 'Client blocked successfully',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async block(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) blockClientDto: BlockClientDto,
  ) {
    return this.clientsService.block(req.user.tenantId, id, blockClientDto.reason);
  }

  @Patch(':id/unblock')
  @RequirePermissions('clients.block')
  @ApiOperation({
    summary: 'Unblock client',
    description: 'Unblocks a client by setting the status back to "active".',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Client ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Client unblocked successfully',
    schema: {
      example: {
        success: true,
        message: 'Client unblocked successfully',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async unblock(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.clientsService.unblock(req.user.tenantId, id);
  }

  // ==================== CONTACTS MANAGEMENT ====================

  @Get(':id/contacts')
  @RequirePermissions('clients.view')
  @ApiOperation({
    summary: 'Get client contacts',
    description:
      'Returns all contact information (emails, phones, etc.) associated with a specific client.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Client ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Client contacts retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          entityType: 'client',
          entityId: 1,
          contactType: 'email',
          contactValue: 'contact@client.com',
          label: 'Main Email',
          isPrimary: true,
          isActive: true,
          notes: 'Primary contact',
          createdAt: '2024-01-15T10:30:00Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async getClientContacts(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.clientsService.findClientContacts(req.user.tenantId, id);
  }

  @Post('contacts')
  @RequirePermissions('clients.update')
  @ApiOperation({
    summary: 'Add contact to client',
    description:
      'Adds a new contact (email, phone, mobile, fax, website, social media) to a client.',
  })
  @ApiBody({
    schema: {
      example: {
        clientId: 1,
        contactType: 'email',
        contactValue: 'sales@client.com',
        label: 'Sales Department',
        isPrimary: false,
        isActive: true,
        notes: 'Sales inquiries',
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
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async createContact(@Request() req, @Body() contactData: any) {
    return this.clientsService.createContact(
      req.user.tenantId,
      contactData.clientId,
      contactData,
    );
  }

  @Put('contacts/:id')
  @RequirePermissions('clients.update')
  @ApiOperation({
    summary: 'Update client contact',
    description: 'Updates an existing contact for a client.',
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
        contactValue: 'newemail@client.com',
        label: 'Updated Email',
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
    return this.clientsService.updateContact(req.user.tenantId, id, contactData);
  }

  @Delete('contacts/:id')
  @RequirePermissions('clients.update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete client contact',
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
    return this.clientsService.deleteContact(req.user.tenantId, id);
  }

  // ==================== ADDRESSES MANAGEMENT ====================

  @Get(':id/addresses')
  @RequirePermissions('clients.view')
  @ApiOperation({
    summary: 'Get client addresses',
    description:
      'Returns all addresses (billing, shipping, etc.) associated with a specific client.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Client ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Client addresses retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          entityType: 'client',
          entityId: 1,
          addressType: 'billing',
          street: 'Rua Principal',
          streetNumber: '100',
          floor: '2',
          apartment: 'A',
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
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async getClientAddresses(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.clientsService.findClientAddresses(req.user.tenantId, id);
  }

  @Post('addresses')
  @RequirePermissions('clients.update')
  @ApiOperation({
    summary: 'Add address to client',
    description: 'Adds a new address (billing, shipping, etc.) to a client.',
  })
  @ApiBody({
    schema: {
      example: {
        clientId: 1,
        addressType: 'shipping',
        street: 'Rua Secundária',
        streetNumber: '200',
        postalCode: '1100-001',
        city: 'Lisbon',
        region: 'Lisboa',
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
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async createAddress(@Request() req, @Body() addressData: any) {
    return this.clientsService.createAddress(
      req.user.tenantId,
      addressData.clientId,
      addressData,
    );
  }

  @Put('addresses/:id')
  @RequirePermissions('clients.update')
  @ApiOperation({
    summary: 'Update client address',
    description: 'Updates an existing address for a client.',
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
        city: 'Porto',
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
    return this.clientsService.updateAddress(req.user.tenantId, id, addressData);
  }

  @Delete('addresses/:id')
  @RequirePermissions('clients.update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete client address',
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
    return this.clientsService.deleteAddress(req.user.tenantId, id);
  }
}
