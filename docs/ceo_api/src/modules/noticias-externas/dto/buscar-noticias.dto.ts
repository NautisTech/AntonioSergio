import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class BuscarNoticiasDto {
    @ApiPropertyOptional({ description: 'Categoria de notícias', enum: ['general', 'world', 'nation', 'business', 'technology', 'entertainment', 'sports', 'science', 'health', 'portugal', 'espanha', 'europa_uk', 'europa_de', 'europa_fr'] })
    @IsOptional()
    @IsIn(['general', 'world', 'nation', 'business', 'technology', 'entertainment', 'sports', 'science', 'health', 'portugal', 'espanha', 'europa_uk', 'europa_de', 'europa_fr'])
    categoria?: string;

    @ApiPropertyOptional({ description: 'Palavras-chave para pesquisa' })
    @IsOptional()
    @IsString()
    keywords?: string;

    @ApiPropertyOptional({ description: 'Código do idioma (pt, en, etc)', default: 'pt' })
    @IsOptional()
    @IsString()
    idioma?: string;

    @ApiPropertyOptional({ description: 'Código do país (pt, br, us, etc)', default: 'pt' })
    @IsOptional()
    @IsString()
    pais?: string;

    @ApiPropertyOptional({ description: 'Número máximo de resultados', default: 10 })
    @IsOptional()
    max?: number;
}
