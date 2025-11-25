import { Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { NoticiasExternasService } from './noticias-externas.service';
import { BuscarNoticiasDto } from './dto/buscar-noticias.dto';

@ApiTags('Notícias Externas')
@Controller('noticias-externas')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class NoticiasExternasController {
    constructor(private readonly noticiasExternasService: NoticiasExternasService) {}

    @Get()
    @RequirePermissions('news.list')
    @ApiOperation({ summary: 'Listar notícias da base de dados local' })
    async listarNoticias(@Query() params: BuscarNoticiasDto, @Request() req) {
        const tenantId = req.user.tenantId;
        return this.noticiasExternasService.listarNoticiasBD(tenantId, params);
    }

    @Post('buscar-manual')
    @RequirePermissions('news.create')
    @ApiOperation({ summary: 'Forçar busca manual de notícias (admin)' })
    async buscarManual(@Query('categoria') categoria: string, @Request() req) {
        const tenantId = req.user.tenantId;
        return this.noticiasExternasService.buscarManual(tenantId, categoria);
    }

    @Get('stats')
    @RequirePermissions('news.view')
    @ApiOperation({ summary: 'Estatísticas das notícias' })
    async getStats(@Request() req) {
        const tenantId = req.user.tenantId;
        return this.noticiasExternasService.getStats(tenantId);
    }
}
