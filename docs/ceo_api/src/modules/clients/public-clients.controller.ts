import {
  Controller,
  Post,
  Body,
  Query,
  ParseIntPipe,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { VerifyClientDto } from './dto/public-clients.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Public - Clients')
@Controller('public/clients')
export class PublicClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Public()
  @Post('verify')
  @ApiOperation({
    summary: 'Verify client by code or email (public endpoint)',
    description:
      'Verifies if a client exists by checking client code or email. First checks contact table for email associated with client, then checks user table for email associated with client.',
  })
  @ApiQuery({ name: 'tenantId', required: true, type: Number, description: 'Tenant ID' })
  @ApiBody({ type: VerifyClientDto })
  @ApiResponse({
    status: 200,
    description: 'Client verification result',
    schema: {
      example: {
        success: true,
        clientId: 5,
        clientCode: 'CLI005',
        clientName: 'ACME Corporation',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Client not found',
    schema: {
      example: {
        success: false,
        message: 'Client not found',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - must provide clientCode or email' })
  async verifyClient(
    @Query('tenantId', ParseIntPipe) tenantId: number,
    @Body() dto: VerifyClientDto,
  ) {
    if (!dto.clientCode && !dto.email) {
      throw new BadRequestException('Must provide either clientCode or email');
    }

    const result = await this.clientsService.verifyClient(tenantId, dto);

    if (!result.success) {
      throw new NotFoundException(result);
    }

    return result;
  }
}
