import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';

// Controllers
import { EquipmentController } from './equipment.controller';

// Services
import { EquipmentService } from './equipment.service';
import { EquipmentMaintenanceService } from './equipment-maintenance.service';
import { EquipmentAssignmentService } from './equipment-assignment.service';
import { BrandsService } from './brands.service';
import { CategoriesService } from './categories.service';
import { ModelsService } from './models.service';

/**
 * Equipment Module
 * Comprehensive equipment management with maintenance tracking and assignment history
 */
@Module({
  imports: [DatabaseModule],
  controllers: [EquipmentController],
  providers: [
    // Core services
    EquipmentService,
    EquipmentMaintenanceService,
    EquipmentAssignmentService,
    // Supporting services
    BrandsService,
    CategoriesService,
    ModelsService,
  ],
  exports: [
    EquipmentService,
    EquipmentMaintenanceService,
    EquipmentAssignmentService,
    BrandsService,
    CategoriesService,
    ModelsService,
  ],
})
export class EquipamentModule { }
