import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class SwitchTenantDto {
  @ApiProperty({
    example: 2,
    description: 'ID do tenant de destino',
  })
  @IsInt()
  @IsNotEmpty({ message: 'Target tenant ID é obrigatório' })
  targetTenantId: number;
}
