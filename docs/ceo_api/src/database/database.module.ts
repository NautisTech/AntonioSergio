import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { EncryptionService } from './services/encryption.service';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [DatabaseService, EncryptionService],
    exports: [DatabaseService, EncryptionService],
})
export class DatabaseModule { }