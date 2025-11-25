import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    Delete,
    UseGuards,
    Get,
    Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Enable2FADto, Verify2FADto, Disable2FADto } from './dto/two-factor.dto';
import { SendVerificationEmailDto, VerifyEmailDto } from './dto/email-verification.dto';
import { ForgotPasswordDto, ResetPasswordDto, ChangeOwnPasswordDto } from './dto/password-reset.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SwitchTenantDto } from './dto/switch-tenant.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
    ) { }

    @Post('login')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login with email/username and password' })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('refresh')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh JWT token' })
    async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.authService.refreshToken(refreshTokenDto.refreshToken);
    }

    // NextAuth compatibility endpoint
    @Get('session')
    @Public()
    @ApiOperation({ summary: 'Get current session information' })
    async getSession(@Request() req) {
        if (!req.user) {
            return {
                user: null,
                authenticated: false
            };
        }

        return {
            user: {
                id: req.user.id,
                email: req.user.email,
                name: req.user.name,
                tenantId: req.user.tenantId,
            },
            authenticated: true
        };
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get logged-in user profile' })
    async getProfile(@Request() req) {
        return {
            user: req.user,
        };
    }

    @Get('me/modules')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get user modules and permissions' })
    async getModules(@Request() req) {
        return this.authService.getUserModules(req.user.id, req.user.tenantId);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Logout user' })
    async logout(@Request() req) {
        // Can implement token blacklist logic here if needed
        return {
            message: 'Logout successful',
        };
    }

    // ================================================================================
    // 2FA ENDPOINTS
    // ================================================================================

    @Post('2fa/setup')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Generate secret and QR code for 2FA setup' })
    async setup2FA(@Request() req) {
        return this.authService.generate2FASetup(req.user.tenantId, req.user.id);
    }

    @Post('2fa/enable')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Enable 2FA after verifying the first code' })
    async enable2FA(@Request() req, @Body() dto: Enable2FADto) {
        return this.authService.enable2FA(req.user.tenantId, req.user.id, dto.token);
    }

    @Post('2fa/verify')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Verify 2FA code during login' })
    async verify2FA(@Body() dto: Verify2FADto) {
        return this.authService.verify2FALogin(dto.email, dto.tenantSlug, dto.token);
    }

    @Post('2fa/disable')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Disable 2FA' })
    async disable2FA(@Request() req, @Body() dto: Disable2FADto) {
        return this.authService.disable2FA(req.user.tenantId, req.user.id, dto.password);
    }

    @Get('2fa/status')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Check 2FA status' })
    async get2FAStatus(@Request() req) {
        return this.authService.get2FAStatus(req.user.tenantId, req.user.id);
    }

    // ================================================================================
    // EMAIL VERIFICATION ENDPOINTS
    // ================================================================================

    @Post('email/send-verification')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Send verification email' })
    async sendVerificationEmail(@Body() dto: SendVerificationEmailDto) {
        return this.authService.sendVerificationEmail(dto.email, dto.tenantSlug);
    }

    @Post('email/verify')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Verify email using token' })
    async verifyEmail(@Body() dto: VerifyEmailDto) {
        return this.authService.verifyEmail(dto.token, dto.email, dto.tenantSlug);
    }

    // ================================================================================
    // PASSWORD RESET ENDPOINTS
    // ================================================================================

    @Post('password/forgot')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Request password reset' })
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.forgotPassword(dto.email, dto.tenantSlug);
    }

    @Post('password/reset')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Reset password using token' })
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto.token, dto.email, dto.tenantSlug, dto.newPassword);
    }

    @Post('password/change')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Change logged-in user password' })
    async changePassword(@Request() req, @Body() dto: ChangeOwnPasswordDto) {
        return this.authService.changePassword(
            req.user.tenantId,
            req.user.id,
            dto.currentPassword,
            dto.newPassword,
        );
    }

    // ================================================================================
    // ACCOUNT MANAGEMENT ENDPOINTS
    // ================================================================================

    @Delete('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Deactivate user account' })
    async deactivateAccount(@Request() req) {
        return this.authService.deactivateAccount(req.user.tenantId, req.user.id);
    }

    // ================================================================================
    // TENANT SWITCHING ENDPOINTS
    // ================================================================================

    @Post('switch-tenant')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Switch tenant (multi-company)' })
    async switchTenant(@Request() req, @Body() dto: SwitchTenantDto) {
        const ipAddress = req.ip || req.connection?.remoteAddress;
        const userAgent = req.headers['user-agent'];

        return this.authService.switchTenant(
            req.user.email,
            req.user.tenantId,
            dto.targetTenantId,
            ipAddress,
            userAgent,
        );
    }

    @Get('available-tenants')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'List available tenants for user' })
    async getAvailableTenants(@Request() req) {
        return this.authService.getAvailableTenants(req.user.email);
    }
}
