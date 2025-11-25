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
  ParseIntPipe,
  HttpCode,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery, ApiBody, ApiResponse } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
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

@ApiTags('Employees')
@ApiBearerAuth()
@Controller('employees')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  // ==================== EMPLOYEES ====================

  @Post()
  @RequirePermissions('employees.create')
  @ApiOperation({
    summary: 'Create new employee',
    description: 'Creates a new employee record with all basic information.',
  })
  @ApiBody({ type: CreateEmployeeDto })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  async create(@Request() req, @Body(ValidationPipe) dto: CreateEmployeeDto) {
    return this.employeesService.create(req.user.tenantId, dto);
  }

  @Get()
  @RequirePermissions('employees.view')
  @ApiOperation({
    summary: 'List all employees',
    description: 'Returns a paginated list of employees with filtering and search options.',
  })
  @ApiQuery({ name: 'employeeTypeId', required: false, type: Number })
  @ApiQuery({ name: 'companyId', required: false, type: Number })
  @ApiQuery({ name: 'departmentId', required: false, type: Number })
  @ApiQuery({ name: 'employmentStatus', required: false, enum: ['active', 'on_leave', 'terminated'] })
  @ApiQuery({ name: 'searchText', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 50 })
  @ApiResponse({
    status: 200,
    description: 'Employees retrieved successfully',
    schema: {
      properties: {
        data: { type: 'array', items: { type: 'object' } },
        total: { type: 'number' },
        page: { type: 'number' },
        pageSize: { type: 'number' },
      },
    },
  })
  async findAll(
    @Request() req,
    @Query('employeeTypeId', new ParseIntPipe({ optional: true })) employeeTypeId?: number,
    @Query('companyId', new ParseIntPipe({ optional: true })) companyId?: number,
    @Query('departmentId', new ParseIntPipe({ optional: true })) departmentId?: number,
    @Query('employmentStatus') employmentStatus?: string,
    @Query('searchText') searchText?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize?: number,
  ) {
    return this.employeesService.findAll(req.user.tenantId, {
      employeeTypeId,
      companyId,
      departmentId,
      employmentStatus,
      searchText,
      page,
      pageSize,
    });
  }

  @Get('types')
  @RequirePermissions('employees.view')
  @ApiOperation({
    summary: 'List employee types',
    description: 'Returns all available employee types.',
  })
  @ApiResponse({
    status: 200,
    description: 'Employee types retrieved successfully',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'number' },
          code: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async findAllEmployeeTypes(@Request() req) {
    return this.employeesService.findAllEmployeeTypes(req.user.tenantId);
  }

  @Get('statistics')
  @RequirePermissions('employees.view')
  @ApiOperation({
    summary: 'Get employee statistics',
    description: 'Returns statistics about employees including counts by status and average age.',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      properties: {
        totalEmployees: { type: 'number' },
        activeEmployees: { type: 'number' },
        onLeaveEmployees: { type: 'number' },
        terminatedEmployees: { type: 'number' },
        hiredThisMonth: { type: 'number' },
        averageAge: { type: 'number' },
      },
    },
  })
  async getStatistics(@Request() req) {
    return this.employeesService.getStatistics(req.user.tenantId);
  }

  @Get(':id')
  @RequirePermissions('employees.view')
  @ApiOperation({
    summary: 'Get employee by ID',
    description:
      'Returns detailed information about a specific employee including contacts, addresses, benefits, and documents.',
  })
  @ApiParam({ name: 'id', description: 'Employee ID', type: Number })
  @ApiResponse({ status: 200, description: 'Employee retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.employeesService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  @RequirePermissions('employees.update')
  @ApiOperation({
    summary: 'Update employee',
    description: 'Updates employee information. All fields are optional.',
  })
  @ApiParam({ name: 'id', description: 'Employee ID', type: Number })
  @ApiBody({ type: UpdateEmployeeDto })
  @ApiResponse({ status: 200, description: 'Employee updated successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions('employees.delete')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete employee (soft delete)',
    description: 'Soft deletes an employee. The employee record is preserved but marked as deleted.',
  })
  @ApiParam({ name: 'id', description: 'Employee ID', type: Number })
  @ApiResponse({ status: 204, description: 'Employee deleted successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    await this.employeesService.remove(req.user.tenantId, id);
  }

  // ==================== CONTACTS ====================

  @Get(':id/contacts')
  @RequirePermissions('employees.view')
  @ApiOperation({
    summary: 'List employee contacts',
    description: 'Returns all contacts for a specific employee.',
  })
  @ApiParam({ name: 'id', description: 'Employee ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Contacts retrieved successfully',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'number' },
          contactType: { type: 'string' },
          contactValue: { type: 'string' },
          isPrimary: { type: 'boolean' },
          isVerified: { type: 'boolean' },
          label: { type: 'string' },
          notes: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async findEmployeeContacts(@Request() req, @Param('id', ParseIntPipe) employeeId: number) {
    return this.employeesService.findEmployeeContacts(req.user.tenantId, employeeId);
  }

  @Post('contacts')
  @RequirePermissions('employees.create')
  @ApiOperation({
    summary: 'Create employee contact',
    description: 'Creates a new contact for an employee.',
  })
  @ApiBody({ type: CreateContactDto })
  @ApiResponse({ status: 201, description: 'Contact created successfully' })
  async createContact(@Request() req, @Body(ValidationPipe) dto: CreateContactDto) {
    return this.employeesService.createContact(req.user.tenantId, dto);
  }

  @Put('contacts/:id')
  @RequirePermissions('employees.update')
  @ApiOperation({
    summary: 'Update employee contact',
    description: 'Updates an existing contact.',
  })
  @ApiParam({ name: 'id', description: 'Contact ID', type: Number })
  @ApiBody({ type: UpdateContactDto })
  @ApiResponse({ status: 200, description: 'Contact updated successfully' })
  async updateContact(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateContactDto,
  ) {
    return this.employeesService.updateContact(req.user.tenantId, id, dto);
  }

  @Delete('contacts/:id')
  @RequirePermissions('employees.delete')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete employee contact',
    description: 'Soft deletes a contact.',
  })
  @ApiParam({ name: 'id', description: 'Contact ID', type: Number })
  @ApiResponse({ status: 204, description: 'Contact deleted successfully' })
  async removeContact(@Request() req, @Param('id', ParseIntPipe) id: number) {
    await this.employeesService.removeContact(req.user.tenantId, id);
  }

  // ==================== ADDRESSES ====================

  @Get(':id/addresses')
  @RequirePermissions('employees.view')
  @ApiOperation({
    summary: 'List employee addresses',
    description: 'Returns all addresses for a specific employee.',
  })
  @ApiParam({ name: 'id', description: 'Employee ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Addresses retrieved successfully',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'number' },
          addressType: { type: 'string' },
          isPrimary: { type: 'boolean' },
          label: { type: 'string' },
          streetLine1: { type: 'string' },
          streetLine2: { type: 'string' },
          postalCode: { type: 'string' },
          city: { type: 'string' },
          district: { type: 'string' },
          state: { type: 'string' },
          country: { type: 'string' },
          notes: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async findEmployeeAddresses(@Request() req, @Param('id', ParseIntPipe) employeeId: number) {
    return this.employeesService.findEmployeeAddresses(req.user.tenantId, employeeId);
  }

  @Post('addresses')
  @RequirePermissions('employees.create')
  @ApiOperation({
    summary: 'Create employee address',
    description: 'Creates a new address for an employee.',
  })
  @ApiBody({ type: CreateAddressDto })
  @ApiResponse({ status: 201, description: 'Address created successfully' })
  async createAddress(@Request() req, @Body(ValidationPipe) dto: CreateAddressDto) {
    return this.employeesService.createAddress(req.user.tenantId, dto);
  }

  @Put('addresses/:id')
  @RequirePermissions('employees.update')
  @ApiOperation({
    summary: 'Update employee address',
    description: 'Updates an existing address.',
  })
  @ApiParam({ name: 'id', description: 'Address ID', type: Number })
  @ApiBody({ type: UpdateAddressDto })
  @ApiResponse({ status: 200, description: 'Address updated successfully' })
  async updateAddress(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateAddressDto,
  ) {
    return this.employeesService.updateAddress(req.user.tenantId, id, dto);
  }

  @Delete('addresses/:id')
  @RequirePermissions('employees.delete')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete employee address',
    description: 'Soft deletes an address.',
  })
  @ApiParam({ name: 'id', description: 'Address ID', type: Number })
  @ApiResponse({ status: 204, description: 'Address deleted successfully' })
  async removeAddress(@Request() req, @Param('id', ParseIntPipe) id: number) {
    await this.employeesService.removeAddress(req.user.tenantId, id);
  }

  // ==================== BENEFITS ====================

  @Get(':id/benefits')
  @RequirePermissions('employees.view')
  @ApiOperation({
    summary: 'List employee benefits',
    description: 'Returns all benefits for a specific employee.',
  })
  @ApiParam({ name: 'id', description: 'Employee ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Benefits retrieved successfully',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'number' },
          employeeId: { type: 'number' },
          benefitType: { type: 'string' },
          provider: { type: 'string' },
          policyNumber: { type: 'string' },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          monthlyCost: { type: 'number' },
          employeeContribution: { type: 'number' },
          companyContribution: { type: 'number' },
          notes: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async findEmployeeBenefits(@Request() req, @Param('id', ParseIntPipe) employeeId: number) {
    return this.employeesService.findEmployeeBenefits(req.user.tenantId, employeeId);
  }

  @Post('benefits')
  @RequirePermissions('employees.create')
  @ApiOperation({
    summary: 'Create employee benefit',
    description: 'Creates a new benefit for an employee.',
  })
  @ApiBody({ type: CreateBenefitDto })
  @ApiResponse({ status: 201, description: 'Benefit created successfully' })
  async createBenefit(@Request() req, @Body(ValidationPipe) dto: CreateBenefitDto) {
    return this.employeesService.createBenefit(req.user.tenantId, dto);
  }

  @Put('benefits/:id')
  @RequirePermissions('employees.update')
  @ApiOperation({
    summary: 'Update employee benefit',
    description: 'Updates an existing benefit.',
  })
  @ApiParam({ name: 'id', description: 'Benefit ID', type: Number })
  @ApiBody({ type: UpdateBenefitDto })
  @ApiResponse({ status: 200, description: 'Benefit updated successfully' })
  async updateBenefit(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateBenefitDto,
  ) {
    return this.employeesService.updateBenefit(req.user.tenantId, id, dto);
  }

  @Delete('benefits/:id')
  @RequirePermissions('employees.delete')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete employee benefit',
    description: 'Soft deletes a benefit.',
  })
  @ApiParam({ name: 'id', description: 'Benefit ID', type: Number })
  @ApiResponse({ status: 204, description: 'Benefit deleted successfully' })
  async removeBenefit(@Request() req, @Param('id', ParseIntPipe) id: number) {
    await this.employeesService.removeBenefit(req.user.tenantId, id);
  }

  // ==================== DOCUMENTS ====================

  @Get(':id/documents')
  @RequirePermissions('employees.view')
  @ApiOperation({
    summary: 'List employee documents',
    description: 'Returns all documents for a specific employee.',
  })
  @ApiParam({ name: 'id', description: 'Employee ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Documents retrieved successfully',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'number' },
          documentType: { type: 'string' },
          documentNumber: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          filePath: { type: 'string' },
          fileName: { type: 'string' },
          fileSize: { type: 'number' },
          mimeType: { type: 'string' },
          issueDate: { type: 'string', format: 'date' },
          expiryDate: { type: 'string', format: 'date' },
          isConfidential: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async findEmployeeDocuments(@Request() req, @Param('id', ParseIntPipe) employeeId: number) {
    return this.employeesService.findEmployeeDocuments(req.user.tenantId, employeeId);
  }

  @Post('documents')
  @RequirePermissions('employees.create')
  @ApiOperation({
    summary: 'Create employee document',
    description: 'Creates a new document for an employee.',
  })
  @ApiBody({ type: CreateDocumentDto })
  @ApiResponse({ status: 201, description: 'Document created successfully' })
  async createDocument(@Request() req, @Body(ValidationPipe) dto: CreateDocumentDto) {
    return this.employeesService.createDocument(req.user.tenantId, dto);
  }

  @Put('documents/:id')
  @RequirePermissions('employees.update')
  @ApiOperation({
    summary: 'Update employee document',
    description: 'Updates an existing document.',
  })
  @ApiParam({ name: 'id', description: 'Document ID', type: Number })
  @ApiBody({ type: UpdateDocumentDto })
  @ApiResponse({ status: 200, description: 'Document updated successfully' })
  async updateDocument(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateDocumentDto,
  ) {
    return this.employeesService.updateDocument(req.user.tenantId, id, dto);
  }

  @Delete('documents/:id')
  @RequirePermissions('employees.delete')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete employee document',
    description: 'Soft deletes a document.',
  })
  @ApiParam({ name: 'id', description: 'Document ID', type: Number })
  @ApiResponse({ status: 204, description: 'Document deleted successfully' })
  async removeDocument(@Request() req, @Param('id', ParseIntPipe) id: number) {
    await this.employeesService.removeDocument(req.user.tenantId, id);
  }
}
