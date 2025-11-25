import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../database/database.service';
import { ImageProcessorService } from './image-processor.service';
import * as sql from 'mssql';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadsService {
  private uploadPath: string;

  constructor(
    private databaseService: DatabaseService,
    private configService: ConfigService,
    private imageProcessor: ImageProcessorService,
  ) {
    this.uploadPath = this.configService.get('app.uploadPath') || './uploads';
    this.ensureUploadDirectory();
  }

  private ensureUploadDirectory() {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async uploadFile(
    tenantId: number,
    file: Express.Multer.File,
    utilizadorId: number,
  ) {
    // Validar ficheiro
    this.validateFile(file);

    // Gerar nome único
    const fileExt = path.extname(file.originalname);
    const baseFileName = uuidv4();
    const fileName = `${baseFileName}${fileExt}`;
    const tenantFolder = path.join(this.uploadPath, `tenant_${tenantId}`);

    // Criar pasta do tenant se não existir
    if (!fs.existsSync(tenantFolder)) {
      fs.mkdirSync(tenantFolder, { recursive: true });
    }

    const tempFilePath = path.join(tenantFolder, fileName);

    // Salvar ficheiro temporário
    fs.writeFileSync(tempFilePath, file.buffer);

    let finalFilePath = tempFilePath;
    let processedSize = file.size;
    let variants: any = null;

    // Processar imagem se for imagem
    if (this.imageProcessor.isImage(file.mimetype)) {
      try {
        const result = await this.imageProcessor.processImage(
          tempFilePath,
          tenantFolder,
          baseFileName,
        );

        variants = {
          original: path.basename(result.variants.original),
          large: path.basename(result.variants.large),
          medium: path.basename(result.variants.medium),
          small: path.basename(result.variants.small),
          thumbnail: path.basename(result.variants.thumbnail),
        };

        processedSize = result.compressedSize;

        // Remover ficheiro temporário original
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }

        // Usar a versão medium como principal
        const apiUrl = process.env.API_URL || 'http://localhost:9832';
        finalFilePath = `${apiUrl}/${result.variants.medium}`;
      } catch (error) {
        // Se falhar, usar o ficheiro original
        finalFilePath = this.getFileUrl(tenantId, fileName);
      }
    } else {
      // Para ficheiros não-imagem (PDFs, etc), usar URL completa
      finalFilePath = this.getFileUrl(tenantId, fileName);
    }

    // Registrar no banco
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('nome', sql.NVarChar, path.basename(finalFilePath))
      .input('nomeOriginal', sql.NVarChar, file.originalname)
      .input('caminho', sql.NVarChar, finalFilePath)
      .input('type', sql.NVarChar, fileExt.replace('.', ''))
      .input('mimeType', sql.NVarChar, file.mimetype)
      .input('tamanhoBytes', sql.Int, processedSize)
      .input('uploadPorId', sql.Int, utilizadorId)
      .input(
        'variants',
        sql.NVarChar,
        variants ? JSON.stringify(variants) : null,
      ).query(`
        INSERT INTO anexos 
          (nome, nome_original, caminho, type, mime_type, tamanho_bytes, upload_por_id, variants)
        OUTPUT INSERTED.id, INSERTED.nome, INSERTED.caminho, INSERTED.type, INSERTED.variants
        VALUES 
          (@nome, @nomeOriginal, @caminho, @type, @mimeType, @tamanhoBytes, @uploadPorId, @variants)
      `);

    const anexo = result.recordset[0];

    return {
      id: anexo.id,
      nome: anexo.nome,
      nome_original: file.originalname,
      url: this.getFileUrl(tenantId, anexo.nome),
      variants: variants
        ? {
          original: this.getFileUrl(tenantId, variants.original),
          large: this.getFileUrl(tenantId, variants.large),
          medium: this.getFileUrl(tenantId, variants.medium),
          small: this.getFileUrl(tenantId, variants.small),
          thumbnail: this.getFileUrl(tenantId, variants.thumbnail),
        }
        : null,
      type: anexo.type,
      tamanho_bytes: processedSize,
    };
  }

  async uploadMultiple(
    tenantId: number,
    files: Express.Multer.File[],
    utilizadorId: number,
  ) {
    const uploadedFiles: any[] = [];

    for (const file of files) {
      const uploaded = await this.uploadFile(tenantId, file, utilizadorId);
      uploadedFiles.push(uploaded);
    }

    return uploadedFiles;
  }

  async deleteFile(tenantId: number, anexoId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Buscar informações do ficheiro
    const result = await pool.request().input('id', sql.Int, anexoId).query(`
        SELECT caminho, nome, variants FROM anexos WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      throw new BadRequestException('Ficheiro não encontrado');
    }

    const { caminho, nome, variants } = result.recordset[0];
    const tenantFolder = path.join(this.uploadPath, `tenant_${tenantId}`);

    // Se tem variants, remover todas as versões
    if (variants) {
      try {
        const variantsObj = JSON.parse(variants);
        const baseFileName = path.basename(nome, path.extname(nome));

        await this.imageProcessor.removeImageVariants(
          tenantFolder,
          baseFileName,
        );
      } catch (error) { }
    }

    // Deletar ficheiro principal
    if (fs.existsSync(caminho)) {
      fs.unlinkSync(caminho);
    }

    // Deletar registro
    await pool
      .request()
      .input('id', sql.Int, anexoId)
      .query(`DELETE FROM anexos WHERE id = @id`);

    return { success: true };
  }

  async registerExternalFile(
    tenantId: number,
    url: string,
    type: string,
    utilizadorId: number,
  ) {
    // Validar URL
    this.validateExternalUrl(url);

    let processedUrl = url;
    let finalTipo = type;
    let nome = path.basename(url);
    let mimeType: string | null = null;

    // Processar URLs do YouTube
    if (this.isYouTubeUrl(url)) {
      const videoId = this.extractYouTubeVideoId(url);
      if (!videoId) {
        throw new BadRequestException('URL do YouTube inválida');
      }

      // Normalizar URL do YouTube para formato embed
      processedUrl = `https://www.youtube.com/embed/${videoId}`;
      finalTipo = 'youtube';
      nome = `YouTube - ${videoId}`;
      mimeType = 'video/youtube';
    } else if (this.isVimeoUrl(url)) {
      finalTipo = 'vimeo';
      mimeType = 'video/vimeo';
    }

    const originalName = nome;
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('nome', sql.NVarChar, nome)
      .input('nomeOriginal', sql.NVarChar, originalName)
      .input('caminho', sql.NVarChar, processedUrl)
      .input('type', sql.NVarChar, finalTipo)
      .input('mimeType', sql.NVarChar, mimeType)
      .input('tamanhoBytes', sql.Int, 0)
      .input('uploadPorId', sql.Int, utilizadorId)
      .input('variants', sql.NVarChar, null).query(`
        INSERT INTO anexos
          (nome, nome_original, caminho, type, mime_type, tamanho_bytes, upload_por_id, variants)
        OUTPUT INSERTED.id, INSERTED.nome, INSERTED.caminho, INSERTED.type, INSERTED.variants
        VALUES
          (@nome, @nomeOriginal, @caminho, @type, @mimeType, @tamanhoBytes, @uploadPorId, @variants)
      `);

    const anexo = result.recordset[0];

    return {
      id: anexo.id,
      nome: anexo.nome,
      nome_original: originalName,
      url: anexo.caminho,
      variants: null,
      type: anexo.type,
      tamanho_bytes: 0,
    };
  }

  private validateExternalUrl(url: string) {
    try {
      const parsedUrl = new URL(url);
      const allowedProtocols = ['http:', 'https:'];

      if (!allowedProtocols.includes(parsedUrl.protocol)) {
        throw new BadRequestException('Protocolo não permitido. Use http ou https');
      }

      // Lista de domínios permitidos para URLs externas
      const allowedDomains = [
        'youtube.com',
        'www.youtube.com',
        'youtu.be',
        'm.youtube.com',
        'vimeo.com',
        'player.vimeo.com',
        // Adicione outros domínios conforme necessário
      ];

      const hostname = parsedUrl.hostname.toLowerCase();
      const isAllowed = allowedDomains.some(domain =>
        hostname === domain || hostname.endsWith(`.${domain}`)
      );

      if (!isAllowed) {
        throw new BadRequestException(
          `Domínio não permitido. Domínios permitidos: ${allowedDomains.join(', ')}`
        );
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('URL inválida');
    }
  }

  private isYouTubeUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname.toLowerCase();
      return hostname.includes('youtube.com') || hostname.includes('youtu.be');
    } catch {
      return false;
    }
  }

  private isVimeoUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname.toLowerCase().includes('vimeo.com');
    } catch {
      return false;
    }
  }

  private extractYouTubeVideoId(url: string): string | null {
    try {
      const parsedUrl = new URL(url);

      // youtu.be/VIDEO_ID
      if (parsedUrl.hostname.includes('youtu.be')) {
        return parsedUrl.pathname.slice(1).split('?')[0];
      }

      // youtube.com/watch?v=VIDEO_ID
      if (parsedUrl.hostname.includes('youtube.com')) {
        // Formato padrão: youtube.com/watch?v=VIDEO_ID
        const videoId = parsedUrl.searchParams.get('v');
        if (videoId) {
          return videoId;
        }

        // Formato embed: youtube.com/embed/VIDEO_ID
        const embedMatch = parsedUrl.pathname.match(/\/embed\/([^/?]+)/);
        if (embedMatch) {
          return embedMatch[1];
        }

        // Formato shorts: youtube.com/shorts/VIDEO_ID
        const shortsMatch = parsedUrl.pathname.match(/\/shorts\/([^/?]+)/);
        if (shortsMatch) {
          return shortsMatch[1];
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  private validateFile(file: Express.Multer.File) {
    const maxSize = this.configService.get('app.uploadMaxSize') || 10485760;

    if (file.size > maxSize) {
      throw new BadRequestException(
        `Ficheiro muito grande. Tamanho máximo: ${maxSize / 1024 / 1024}MB`,
      );
    }

    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'video/mp4',
      'video/mpeg',
      'audio/mpeg',
      'audio/wav',
    ];

    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('type de ficheiro não permitido');
    }
  }

  private getFileUrl(tenantId: number, fileName: string): string {
    const apiUrl = process.env.API_URL || 'http://localhost:9833';
    return `${apiUrl}/uploads/tenant_${tenantId}/${fileName}`;
  }
}
