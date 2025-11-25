import { Module } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { DatabaseModule } from '../../database/database.module';
import { EncryptionService } from '../../database/services/encryption.service';

@Module({
    imports: [DatabaseModule],
    controllers: [TenantsController],
    providers: [TenantsService, EncryptionService],
    exports: [TenantsService],
})
export class TenantsModule { }