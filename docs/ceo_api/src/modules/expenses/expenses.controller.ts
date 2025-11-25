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
  ParseIntPipe,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import {
  CreateExpenseClaimDto,
  UpdateExpenseClaimDto,
  ApproveClaimDto,
  RejectClaimDto,
  MarkAsPaidDto,
  ExpenseClaimFilterDto,
  CreateExpenseItemDto,
  UpdateExpenseItemDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryFilterDto,
  ExpenseClaimStatus,
} from './dto';

/**
 * Expenses Controller
 * Manages expense claims, items, and categories
 */
@ApiTags('Expenses')
@Controller('expenses')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  // ========================
  // Expense Claims - CRUD
  // ========================

  @Get('claims')
  @RequirePermissions('expenses.list')
  @ApiOperation({ summary: 'List expense claims with filters and pagination' })
  @ApiQuery({ name: 'employeeId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ExpenseClaimStatus })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'fromDate', required: false, type: String })
  @ApiQuery({ name: 'toDate', required: false, type: String })
  @ApiQuery({ name: 'minAmount', required: false, type: Number })
  @ApiQuery({ name: 'maxAmount', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async listClaims(@Request() req, @Query() filters: ExpenseClaimFilterDto) {
    return this.expensesService.listClaims(req.user.tenantId, filters);
  }

  @Get('claims/statistics')
  @RequirePermissions('expenses.list')
  @ApiOperation({ summary: 'Get expense statistics' })
  @ApiQuery({ name: 'employeeId', required: false, type: Number })
  @ApiQuery({ name: 'fromDate', required: false, type: String })
  @ApiQuery({ name: 'toDate', required: false, type: String })
  async getStatistics(
    @Request() req,
    @Query('employeeId', new ParseIntPipe({ optional: true })) employeeId?: number,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.expensesService.getStatistics(req.user.tenantId, {
      employeeId,
      fromDate,
      toDate,
    });
  }

  @Get('claims/:id')
  @RequirePermissions('expenses.list')
  @ApiOperation({ summary: 'Get expense claim by ID' })
  @ApiParam({ name: 'id', description: 'Expense claim ID' })
  async getClaimById(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.expensesService.getClaimById(req.user.tenantId, id);
  }

  @Post('claims')
  @RequirePermissions('expenses.create')
  @ApiOperation({ summary: 'Create expense claim' })
  @ApiBody({ type: CreateExpenseClaimDto })
  async createClaim(
    @Request() req,
    @Body(ValidationPipe) dto: CreateExpenseClaimDto,
  ) {
    return this.expensesService.createClaim(
      req.user.tenantId,
      dto,
      req.user.id,
    );
  }

  @Put('claims/:id')
  @RequirePermissions('expenses.update')
  @ApiOperation({ summary: 'Update expense claim' })
  @ApiParam({ name: 'id', description: 'Expense claim ID' })
  @ApiBody({ type: UpdateExpenseClaimDto })
  async updateClaim(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateExpenseClaimDto,
  ) {
    return this.expensesService.updateClaim(
      req.user.tenantId,
      id,
      dto,
      req.user.id,
    );
  }

  @Delete('claims/:id')
  @RequirePermissions('expenses.delete')
  @ApiOperation({ summary: 'Delete expense claim' })
  @ApiParam({ name: 'id', description: 'Expense claim ID' })
  async deleteClaim(@Request() req, @Param('id', ParseIntPipe) id: number) {
    await this.expensesService.deleteClaim(req.user.tenantId, id);
    return { success: true, message: 'Expense claim deleted successfully' };
  }

  // ========================
  // Expense Claims - Actions
  // ========================

  @Post('claims/:id/submit')
  @RequirePermissions('expenses.submit')
  @ApiOperation({ summary: 'Submit expense claim for approval' })
  @ApiParam({ name: 'id', description: 'Expense claim ID' })
  async submitClaim(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.expensesService.submitClaim(
      req.user.tenantId,
      id,
      req.user.id,
    );
  }

  @Post('claims/:id/approve')
  @RequirePermissions('expenses.approve')
  @ApiOperation({ summary: 'Approve expense claim' })
  @ApiParam({ name: 'id', description: 'Expense claim ID' })
  @ApiBody({ type: ApproveClaimDto })
  async approveClaim(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: ApproveClaimDto,
  ) {
    return this.expensesService.approveClaim(
      req.user.tenantId,
      id,
      req.user.id,
      dto,
    );
  }

  @Post('claims/:id/reject')
  @RequirePermissions('expenses.approve')
  @ApiOperation({ summary: 'Reject expense claim' })
  @ApiParam({ name: 'id', description: 'Expense claim ID' })
  @ApiBody({ type: RejectClaimDto })
  async rejectClaim(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: RejectClaimDto,
  ) {
    return this.expensesService.rejectClaim(
      req.user.tenantId,
      id,
      req.user.id,
      dto,
    );
  }

  @Post('claims/:id/paid')
  @RequirePermissions('expenses.pay')
  @ApiOperation({ summary: 'Mark expense claim as paid' })
  @ApiParam({ name: 'id', description: 'Expense claim ID' })
  @ApiBody({ type: MarkAsPaidDto })
  async markAsPaid(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: MarkAsPaidDto,
  ) {
    return this.expensesService.markAsPaid(
      req.user.tenantId,
      id,
      req.user.id,
      dto.paymentReference,
    );
  }

  // ========================
  // Expense Items
  // ========================

  @Get('claims/:claimId/items')
  @RequirePermissions('expenses.list')
  @ApiOperation({ summary: 'Get expense items for a claim' })
  @ApiParam({ name: 'claimId', description: 'Expense claim ID' })
  async getClaimItems(
    @Request() req,
    @Param('claimId', ParseIntPipe) claimId: number,
  ) {
    return this.expensesService.getClaimItems(req.user.tenantId, claimId);
  }

  @Post('claims/:claimId/items')
  @RequirePermissions('expenses.update')
  @ApiOperation({ summary: 'Add item to expense claim' })
  @ApiParam({ name: 'claimId', description: 'Expense claim ID' })
  @ApiBody({ type: CreateExpenseItemDto })
  async addClaimItem(
    @Request() req,
    @Param('claimId', ParseIntPipe) claimId: number,
    @Body(ValidationPipe) dto: CreateExpenseItemDto,
  ) {
    return this.expensesService.addClaimItem(
      req.user.tenantId,
      claimId,
      dto,
      req.user.id,
    );
  }

  @Put('claims/:claimId/items/:itemId')
  @RequirePermissions('expenses.update')
  @ApiOperation({ summary: 'Update expense item' })
  @ApiParam({ name: 'claimId', description: 'Expense claim ID' })
  @ApiParam({ name: 'itemId', description: 'Expense item ID' })
  @ApiBody({ type: UpdateExpenseItemDto })
  async updateClaimItem(
    @Request() req,
    @Param('claimId', ParseIntPipe) claimId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body(ValidationPipe) dto: UpdateExpenseItemDto,
  ) {
    return this.expensesService.updateClaimItem(
      req.user.tenantId,
      claimId,
      itemId,
      dto,
      req.user.id,
    );
  }

  @Delete('claims/:claimId/items/:itemId')
  @RequirePermissions('expenses.update')
  @ApiOperation({ summary: 'Delete expense item' })
  @ApiParam({ name: 'claimId', description: 'Expense claim ID' })
  @ApiParam({ name: 'itemId', description: 'Expense item ID' })
  async deleteClaimItem(
    @Request() req,
    @Param('claimId', ParseIntPipe) claimId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    await this.expensesService.deleteClaimItem(
      req.user.tenantId,
      claimId,
      itemId,
    );
    return { success: true, message: 'Expense item deleted successfully' };
  }

  // ========================
  // Expense Categories
  // ========================

  @Get('categories')
  @RequirePermissions('expenses.list')
  @ApiOperation({ summary: 'List expense categories' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  async listCategories(
    @Request() req,
    @Query() filters: CategoryFilterDto,
  ) {
    return this.expensesService.listCategories(
      req.user.tenantId,
      filters.activeOnly,
    );
  }

  @Get('categories/:id')
  @RequirePermissions('expenses.list')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async getCategoryById(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.expensesService.getCategoryById(req.user.tenantId, id);
  }

  @Post('categories')
  @RequirePermissions('expenses.manage')
  @ApiOperation({ summary: 'Create expense category' })
  @ApiBody({ type: CreateCategoryDto })
  async createCategory(
    @Request() req,
    @Body(ValidationPipe) dto: CreateCategoryDto,
  ) {
    return this.expensesService.createCategory(req.user.tenantId, dto);
  }

  @Put('categories/:id')
  @RequirePermissions('expenses.manage')
  @ApiOperation({ summary: 'Update expense category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiBody({ type: UpdateCategoryDto })
  async updateCategory(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateCategoryDto,
  ) {
    return this.expensesService.updateCategory(req.user.tenantId, id, dto);
  }

  @Delete('categories/:id')
  @RequirePermissions('expenses.manage')
  @ApiOperation({ summary: 'Delete expense category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async deleteCategory(@Request() req, @Param('id', ParseIntPipe) id: number) {
    await this.expensesService.deleteCategory(req.user.tenantId, id);
    return { success: true, message: 'Expense category deleted successfully' };
  }
}
