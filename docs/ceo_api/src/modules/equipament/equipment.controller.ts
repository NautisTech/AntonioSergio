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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { EquipmentService } from './equipment.service';
import { EquipmentMaintenanceService } from './equipment-maintenance.service';
import { EquipmentAssignmentService } from './equipment-assignment.service';
import { BrandsService } from './brands.service';
import { CategoriesService } from './categories.service';
import { ModelsService } from './models.service';
import {
  CreateEquipmentDto,
  UpdateEquipmentDto,
  EquipmentFilterDto,
  CreateMaintenanceDto,
  UpdateMaintenanceDto,
  CreateAssignmentDto,
  UpdateAssignmentDto,
  CreateBrandDto,
  UpdateBrandDto,
  CreateEquipmentCategoryDto,
  UpdateEquipmentCategoryDto,
  CreateModelDto,
  UpdateModelDto,
} from './dto';

/**
 * Equipment Management Controller
 * Comprehensive equipment, maintenance, and assignment management
 */
@ApiTags('Equipment')
@Controller('equipment')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EquipmentController {
  constructor(
    private readonly equipmentService: EquipmentService,
    private readonly maintenanceService: EquipmentMaintenanceService,
    private readonly assignmentService: EquipmentAssignmentService,
    private readonly brandsService: BrandsService,
    private readonly categoriesService: CategoriesService,
    private readonly modelsService: ModelsService,
  ) {}

  // ========================
  // Equipment CRUD
  // ========================

  @Get()
  @RequirePermissions('equipment.view')
  @ApiOperation({ summary: 'List equipment with filters' })
  @ApiQuery({ name: 'modelId', required: false, type: Number })
  @ApiQuery({ name: 'responsibleId', required: false, type: Number })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'location', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'active', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async listEquipment(
    @Request() req,
    @Query('modelId') modelId?: number,
    @Query('responsibleId') responsibleId?: number,
    @Query('userId') userId?: number,
    @Query('status') status?: string,
    @Query('location') location?: string,
    @Query('search') search?: string,
    @Query('active') active?: boolean,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.equipmentService.list(req.user.tenantId, {
      modelId,
      responsibleId,
      userId,
      status,
      location,
      search,
      active,
      page,
      pageSize,
    });
  }

  @Get('dashboard')
  @RequirePermissions('equipment.view')
  @ApiOperation({ summary: 'Get equipment dashboard statistics' })
  async getDashboardStats(@Request() req) {
    return this.equipmentService.getDashboardStatistics(req.user.tenantId);
  }

  @Get(':id')
  @RequirePermissions('equipment.view')
  @ApiOperation({ summary: 'Get equipment by ID' })
  @ApiParam({ name: 'id', description: 'Equipment ID' })
  async getEquipment(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.equipmentService.getById(id, req.user.tenantId);
  }

  @Post()
  @RequirePermissions('equipment.create')
  @ApiOperation({ summary: 'Create equipment' })
  async createEquipment(@Request() req, @Body() dto: CreateEquipmentDto) {
    return this.equipmentService.create(dto, req.user.tenantId, req.user.id);
  }

  @Put(':id')
  @RequirePermissions('equipment.update')
  @ApiOperation({ summary: 'Update equipment' })
  @ApiParam({ name: 'id', description: 'Equipment ID' })
  async updateEquipment(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEquipmentDto) {
    return this.equipmentService.update(id, dto, req.user.tenantId, req.user.id);
  }

  @Delete(':id')
  @RequirePermissions('equipment.delete')
  @ApiOperation({ summary: 'Delete equipment' })
  @ApiParam({ name: 'id', description: 'Equipment ID' })
  async deleteEquipment(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.equipmentService.delete(id, req.user.tenantId);
  }

  // ========================
  // Equipment Maintenance
  // ========================

  @Get(':id/maintenance')
  @RequirePermissions('equipment.view')
  @ApiOperation({ summary: 'Get equipment maintenance history' })
  @ApiParam({ name: 'id', description: 'Equipment ID' })
  async getEquipmentMaintenance(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.maintenanceService.getEquipmentMaintenanceHistory(id, req.user.tenantId);
  }

  @Get('maintenance/upcoming')
  @RequirePermissions('equipment.view')
  @ApiOperation({ summary: 'Get upcoming maintenances (next 30 days)' })
  async getUpcomingMaintenances(@Request() req) {
    return this.maintenanceService.getUpcomingMaintenances(req.user.tenantId);
  }

  @Get('maintenance/statistics')
  @RequirePermissions('equipment.view')
  @ApiOperation({ summary: 'Get maintenance statistics' })
  async getMaintenanceStatistics(@Request() req) {
    return this.maintenanceService.getMaintenanceStatistics(req.user.tenantId);
  }

  @Post('maintenance')
  @RequirePermissions('equipment.maintenance.create')
  @ApiOperation({ summary: 'Create maintenance record' })
  async createMaintenance(@Request() req, @Body() dto: CreateMaintenanceDto) {
    return this.maintenanceService.create(dto, req.user.tenantId, req.user.id);
  }

  @Put('maintenance/:id')
  @RequirePermissions('equipment.maintenance.update')
  @ApiOperation({ summary: 'Update maintenance record' })
  @ApiParam({ name: 'id', description: 'Maintenance ID' })
  async updateMaintenance(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMaintenanceDto) {
    return this.maintenanceService.update(id, dto, req.user.tenantId);
  }

  @Delete('maintenance/:id')
  @RequirePermissions('equipment.maintenance.delete')
  @ApiOperation({ summary: 'Delete maintenance record' })
  @ApiParam({ name: 'id', description: 'Maintenance ID' })
  async deleteMaintenance(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.maintenanceService.delete(id, req.user.tenantId);
  }

  // ========================
  // Equipment Assignments
  // ========================

  @Get(':id/assignments')
  @RequirePermissions('equipment.view')
  @ApiOperation({ summary: 'Get equipment assignment history' })
  @ApiParam({ name: 'id', description: 'Equipment ID' })
  async getEquipmentAssignments(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.assignmentService.getEquipmentAssignmentHistory(id, req.user.tenantId);
  }

  @Get(':id/current-assignment')
  @RequirePermissions('equipment.view')
  @ApiOperation({ summary: 'Get current equipment assignment' })
  @ApiParam({ name: 'id', description: 'Equipment ID' })
  async getCurrentAssignment(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.assignmentService.getCurrentAssignment(id, req.user.tenantId);
  }

  @Get('assignments/overdue')
  @RequirePermissions('equipment.view')
  @ApiOperation({ summary: 'Get overdue equipment returns' })
  async getOverdueReturns(@Request() req) {
    return this.assignmentService.getOverdueReturns(req.user.tenantId);
  }

  @Get('assignments/statistics')
  @RequirePermissions('equipment.view')
  @ApiOperation({ summary: 'Get assignment statistics' })
  async getAssignmentStatistics(@Request() req) {
    return this.assignmentService.getAssignmentStatistics(req.user.tenantId);
  }

  @Post('assignments')
  @RequirePermissions('equipment.assign')
  @ApiOperation({ summary: 'Create equipment assignment' })
  async createAssignment(@Request() req, @Body() dto: CreateAssignmentDto) {
    return this.assignmentService.create(dto, req.user.tenantId, req.user.id);
  }

  @Put('assignments/:id')
  @RequirePermissions('equipment.assign')
  @ApiOperation({ summary: 'Update assignment (mark as returned)' })
  @ApiParam({ name: 'id', description: 'Assignment ID' })
  async updateAssignment(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAssignmentDto) {
    return this.assignmentService.update(id, dto, req.user.tenantId);
  }

  @Delete('assignments/:id')
  @RequirePermissions('equipment.assign')
  @ApiOperation({ summary: 'Delete assignment record' })
  @ApiParam({ name: 'id', description: 'Assignment ID' })
  async deleteAssignment(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.assignmentService.delete(id, req.user.tenantId);
  }

  // ========================
  // Brands
  // ========================

  @Get('brands')
  @RequirePermissions('equipment.view')
  @ApiOperation({ summary: 'List equipment brands' })
  @ApiQuery({ name: 'active', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async listBrands(
    @Request() req,
    @Query('active') active?: boolean,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.brandsService.list(req.user.tenantId, { active, search, page, pageSize });
  }

  @Get('brands/statistics')
  @RequirePermissions('equipment.view')
  @ApiOperation({ summary: 'Get brands statistics' })
  async getBrandsStatistics(@Request() req) {
    return this.brandsService.getStatistics(req.user.tenantId);
  }

  @Get('brands/:id')
  @RequirePermissions('equipment.view')
  @ApiOperation({ summary: 'Get equipment brand by ID' })
  @ApiParam({ name: 'id', description: 'Brand ID' })
  async getBrand(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.brandsService.getById(id, req.user.tenantId);
  }

  @Post('brands')
  @RequirePermissions('equipment.manage')
  @ApiOperation({ summary: 'Create equipment brand' })
  async createBrand(@Request() req, @Body() dto: CreateBrandDto) {
    return this.brandsService.create(dto, req.user.tenantId);
  }

  @Put('brands/:id')
  @RequirePermissions('equipment.manage')
  @ApiOperation({ summary: 'Update equipment brand' })
  @ApiParam({ name: 'id', description: 'Brand ID' })
  async updateBrand(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBrandDto) {
    return this.brandsService.update(id, dto, req.user.tenantId);
  }

  @Delete('brands/:id')
  @RequirePermissions('equipment.manage')
  @ApiOperation({ summary: 'Delete equipment brand' })
  @ApiParam({ name: 'id', description: 'Brand ID' })
  async deleteBrand(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.brandsService.delete(id, req.user.tenantId);
  }

  // ========================
  // Categories
  // ========================

  @Get('categories')
  @RequirePermissions('equipment.view')
  @ApiOperation({ summary: 'List equipment categories' })
  @ApiQuery({ name: 'active', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async listCategories(
    @Request() req,
    @Query('active') active?: boolean,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.categoriesService.list(req.user.tenantId, { active, search, page, pageSize });
  }

  @Get('categories/statistics')
  @RequirePermissions('equipment.view')
  @ApiOperation({ summary: 'Get categories statistics' })
  async getCategoriesStatistics(@Request() req) {
    return this.categoriesService.getStatistics(req.user.tenantId);
  }

  @Get('categories/:id')
  @RequirePermissions('equipment.view')
  @ApiOperation({ summary: 'Get equipment category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async getCategory(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.getById(id, req.user.tenantId);
  }

  @Post('categories')
  @RequirePermissions('equipment.manage')
  @ApiOperation({ summary: 'Create equipment category' })
  async createCategory(@Request() req, @Body() dto: CreateEquipmentCategoryDto) {
    return this.categoriesService.create(dto, req.user.tenantId);
  }

  @Put('categories/:id')
  @RequirePermissions('equipment.manage')
  @ApiOperation({ summary: 'Update equipment category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async updateCategory(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEquipmentCategoryDto) {
    return this.categoriesService.update(id, dto, req.user.tenantId);
  }

  @Delete('categories/:id')
  @RequirePermissions('equipment.manage')
  @ApiOperation({ summary: 'Delete equipment category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async deleteCategory(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.delete(id, req.user.tenantId);
  }

  // ========================
  // Models
  // ========================

  @Get('models')
  @RequirePermissions('equipment.view')
  @ApiOperation({ summary: 'List equipment models' })
  @ApiQuery({ name: 'brandId', required: false, type: Number })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'active', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async listModels(
    @Request() req,
    @Query('brandId') brandId?: number,
    @Query('categoryId') categoryId?: number,
    @Query('active') active?: boolean,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.modelsService.list(req.user.tenantId, { brandId, categoryId, active, search, page, pageSize });
  }

  @Get('models/statistics')
  @RequirePermissions('equipment.view')
  @ApiOperation({ summary: 'Get models statistics' })
  async getModelsStatistics(@Request() req) {
    return this.modelsService.getStatistics(req.user.tenantId);
  }

  @Get('models/:id')
  @RequirePermissions('equipment.view')
  @ApiOperation({ summary: 'Get equipment model by ID' })
  @ApiParam({ name: 'id', description: 'Model ID' })
  async getModel(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.modelsService.getById(id, req.user.tenantId);
  }

  @Post('models')
  @RequirePermissions('equipment.manage')
  @ApiOperation({ summary: 'Create equipment model' })
  async createModel(@Request() req, @Body() dto: CreateModelDto) {
    return this.modelsService.create(dto, req.user.tenantId);
  }

  @Put('models/:id')
  @RequirePermissions('equipment.manage')
  @ApiOperation({ summary: 'Update equipment model' })
  @ApiParam({ name: 'id', description: 'Model ID' })
  async updateModel(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateModelDto) {
    return this.modelsService.update(id, dto, req.user.tenantId);
  }

  @Delete('models/:id')
  @RequirePermissions('equipment.manage')
  @ApiOperation({ summary: 'Delete equipment model' })
  @ApiParam({ name: 'id', description: 'Model ID' })
  async deleteModel(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.modelsService.delete(id, req.user.tenantId);
  }
}
