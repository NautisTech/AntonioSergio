import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('jwt.secret'),
        });
    }

    async validate(payload: any) {
        const user = await this.authService.validateUser(
            payload.sub,
            payload.tenantId,
        );

        if (!user) {
            throw new UnauthorizedException();
        }

        return {
            userId: payload.sub,
            id: payload.sub,
            email: payload.email,
            firstName: payload.firstName,
            lastName: payload.lastName,
            fullName: payload.fullName,
            tenantId: payload.tenantId,
            tenantSlug: payload.tenantSlug,
            tenantGroupId: payload.tenantGroupId,
            availableTenants: payload.availableTenants,
            isAdmin: payload.isAdmin,
            companies: payload.companies,
            primaryCompany: payload.primaryCompany,
            permissions: payload.permissions,
        };
    }
}
