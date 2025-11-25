import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from '../../database/database.module';
import { NoticiasExternasController } from './noticias-externas.controller';
import { NoticiasExternasService } from './noticias-externas.service';

@Module({
    imports: [
        ConfigModule,
        ScheduleModule.forRoot(),
        DatabaseModule,
    ],
    controllers: [NoticiasExternasController],
    providers: [NoticiasExternasService],
    exports: [NoticiasExternasService]
})
export class NoticiasExternasModule {}
