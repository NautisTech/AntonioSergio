// src/modules/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TenantGroupService } from './tenant-group.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { DatabaseModule } from '../../database/database.module';
import { MailerModule } from '../mailer/mailer.module';

@Module({
    imports: [
        DatabaseModule,
        MailerModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('jwt.secret') || 'default-secret-change-me',
                signOptions: {
                    expiresIn:
                        typeof configService.get('jwt.expiresIn') === 'number'
                            ? configService.get('jwt.expiresIn')
                            : (configService.get('jwt.expiresIn') || 86400)
                }
            }),
            inject: [ConfigService]
        })
    ],
    controllers: [AuthController],
    providers: [AuthService, TenantGroupService, JwtStrategy],
    exports: [AuthService, TenantGroupService]
})
export class AuthModule { }
