import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';

export interface ImageVariants {
    original: string;
    large: string;
    medium: string;
    small: string;
    thumbnail: string;
}

export interface ImageProcessingResult {
    variants: ImageVariants;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
}

@Injectable()
export class ImageProcessorService {
    private readonly logger = new Logger(ImageProcessorService.name);

    // Configurações de tamanhos
    private readonly sizes = {
        thumbnail: { width: 150, height: 150, quality: 80 },
        small: { width: 400, height: 400, quality: 85 },
        medium: { width: 800, height: 800, quality: 90 },
        large: { width: 1920, height: 1920, quality: 90 },
    };

    /**
     * Verifica se o ficheiro é uma imagem
     */
    isImage(mimeType: string): boolean {
        return mimeType.startsWith('image/');
    }

    /**
     * Processa imagem e gera todas as variantes
     */
    async processImage(
        inputPath: string,
        outputDir: string,
        baseName: string,
    ): Promise<ImageProcessingResult> {

        // Criar diretório de output se não existir
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const variants: ImageVariants = {
            original: '',
            large: '',
            medium: '',
            small: '',
            thumbnail: '',
        };

        let totalCompressedSize = 0;
        const originalSize = fs.statSync(inputPath).size;

        try {
            // Carregar metadados da imagem
            const metadata = await sharp(inputPath).metadata();
            const originalWidth = metadata.width || 0;
            const originalHeight = metadata.height || 0;

            // 1. Original otimizado (apenas recomprimir)
            const originalOutput = path.join(outputDir, `${baseName}_original.jpg`);
            await sharp(inputPath)
                .jpeg({ quality: 92, progressive: true })
                .toFile(originalOutput);

            variants.original = originalOutput;
            totalCompressedSize += fs.statSync(originalOutput).size;

            // 2. Large (se imagem for maior que o tamanho large)
            if (originalWidth > this.sizes.large.width) {
                const largeOutput = path.join(outputDir, `${baseName}_large.jpg`);
                await sharp(inputPath)
                    .resize(this.sizes.large.width, this.sizes.large.height, {
                        fit: 'inside',
                        withoutEnlargement: true,
                    })
                    .jpeg({ quality: this.sizes.large.quality, progressive: true })
                    .toFile(largeOutput);

                variants.large = largeOutput;
                totalCompressedSize += fs.statSync(largeOutput).size;
            } else {
                variants.large = originalOutput; // Usar original se for menor
            }

            // 3. Medium
            const mediumOutput = path.join(outputDir, `${baseName}_medium.jpg`);
            await sharp(inputPath)
                .resize(this.sizes.medium.width, this.sizes.medium.height, {
                    fit: 'inside',
                    withoutEnlargement: true,
                })
                .jpeg({ quality: this.sizes.medium.quality, progressive: true })
                .toFile(mediumOutput);

            variants.medium = mediumOutput;
            totalCompressedSize += fs.statSync(mediumOutput).size;

            // 4. Small
            const smallOutput = path.join(outputDir, `${baseName}_small.jpg`);
            await sharp(inputPath)
                .resize(this.sizes.small.width, this.sizes.small.height, {
                    fit: 'inside',
                    withoutEnlargement: true,
                })
                .jpeg({ quality: this.sizes.small.quality, progressive: true })
                .toFile(smallOutput);

            variants.small = smallOutput;
            totalCompressedSize += fs.statSync(smallOutput).size;

            // 5. Thumbnail
            const thumbnailOutput = path.join(outputDir, `${baseName}_thumb.jpg`);
            await sharp(inputPath)
                .resize(this.sizes.thumbnail.width, this.sizes.thumbnail.height, {
                    fit: 'cover',
                    position: 'center',
                })
                .jpeg({ quality: this.sizes.thumbnail.quality, progressive: true })
                .toFile(thumbnailOutput);

            variants.thumbnail = thumbnailOutput;
            totalCompressedSize += fs.statSync(thumbnailOutput).size;

            const compressionRatio =
                ((originalSize - totalCompressedSize) / originalSize) * 100;

            return {
                variants,
                originalSize,
                compressedSize: totalCompressedSize,
                compressionRatio,
            };
        } catch (error) {
            this.logger.error(`Erro ao processar imagem: ${error.message}`);
            throw error;
        }
    }

    /**
     * Processa vídeo (gera thumbnail)
     */
    async processVideo(
        inputPath: string,
        outputDir: string,
        baseName: string,
    ): Promise<string> {
        // Por enquanto, apenas retorna o path
        // Futuramente pode gerar thumbnail com ffmpeg
        return inputPath;
    }

    /**
     * Remove ficheiro e suas variantes
     */
    async removeImageVariants(basePath: string, baseName: string): Promise<void> {
        const variants = ['_original', '_large', '_medium', '_small', '_thumb'];

        for (const variant of variants) {
            const filePath = path.join(basePath, `${baseName}${variant}.jpg`);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
    }
}