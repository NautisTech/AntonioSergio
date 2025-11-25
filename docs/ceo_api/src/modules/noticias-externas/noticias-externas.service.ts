import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from '../../database/database.service';
import * as sql from 'mssql';
import { BuscarNoticiasDto } from './dto/buscar-noticias.dto';
import OpenAI from 'openai';

interface NoticiaExterna {
    titulo: string;
    descricao: string;
    conteudo: string;
    url: string;
    imagem_url?: string;
    fonte: string;
    publicado_em: string;
}

export interface NoticiaDB {
    id: number;
    titulo: string;
    descricao?: string;
    conteudo?: string;
    titulo_pt?: string;
    descricao_pt?: string;
    conteudo_pt?: string;
    titulo_es?: string;
    descricao_es?: string;
    conteudo_es?: string;
    url: string;
    imagem_url?: string;
    fonte?: string;
    categoria?: string;
    idioma: string;
    pais: string;
    publicado_em?: Date;
    created_at: Date;
    ativo: boolean;
}

@Injectable()
export class NoticiasExternasService {
    private readonly logger = new Logger(NoticiasExternasService.name);
    private readonly baseUrl = 'https://gnews.io/api/v4';
    private readonly maxNoticiasPorDia = 180;
    private readonly noticiasPorBusca = 5;

    // Categorias e países a buscar em cada execução automática
    private readonly categoriasRotacao = [
        { categoria: 'general', pais: 'us', label: 'Geral (US)' },
        { categoria: 'world', pais: 'us', label: 'Mundo' },
        { categoria: 'nation', pais: 'pt', label: 'Portugal' },
        { categoria: 'technology', pais: 'us', label: 'Tecnologia' },
        { categoria: 'business', pais: 'us', label: 'Negócios' },
        { categoria: 'science', pais: 'us', label: 'Ciência' },
        { categoria: 'health', pais: 'us', label: 'Saúde' },
        { categoria: 'general', pais: 'es', label: 'Espanha' },
        { categoria: 'world', pais: 'gb', label: 'Europa (UK)' },
        { categoria: 'world', pais: 'de', label: 'Europa (DE)' },
        { categoria: 'world', pais: 'fr', label: 'Europa (FR)' }
    ];

    constructor(
        private configService: ConfigService,
        private databaseService: DatabaseService
    ) { }

    /**
     * Obter configuração do tenant
     */
    private async obterConfiguracao(tenantId: number, key: string): Promise<string | null> {
        const mainPool = this.databaseService.getMainConnection();
        const result = await mainPool
            .request()
            .input('tenantId', sql.Int, tenantId)
            .input('key', sql.NVarChar, key)
            .query(`
                SELECT value, is_encrypted
                FROM [ceo_main].[dbo].[tenant_setting]
                WHERE tenant_id = @tenantId AND setting_key = @key AND deleted_at IS NULL
            `);

        if (result.recordset.length === 0) {
            return null;
        }

        const config = result.recordset[0];
        let value = config.value;

        // Decrypt if encrypted
        if (config.is_encrypted === 1 || config.is_encrypted === true) {
            const encryptionService = this.databaseService.getEncryptionService();
            const masterKey = encryptionService.getMasterKey();
            value = encryptionService.decrypt(value, masterKey);
        }

        return value;
    }

    /**
     * Obter todos os tenants que têm notícias externas ativadas
     */
    private async getTenantsComNoticiasAtivadas(): Promise<number[]> {
        try {
            const tenantIds = await this.databaseService.getTenantsWithConfig('NOTICIAS_EXTERNAS', '1');
            this.logger.log(`📋 Tenants com notícias externas ativadas: [${tenantIds.join(', ')}]`);
            return tenantIds;
        } catch (error) {
            this.logger.error('Erro ao obter tenants com notícias ativadas:', error);
            return [];
        }
    }

    /**
     * Obter GNews API key da base de dados
     */
    private async getGNewsApiKey(tenantId: number): Promise<string | null> {
        try {
            const config = await this.obterConfiguracao(tenantId, 'GNEWS_API_KEY');
            if (!config) {
                this.logger.warn('GNEWS_API_KEY não configurada na base de dados - Cron jobs de notícias não funcionarão');
                return null;
            }
            return config;
        } catch (error) {
            this.logger.error('Erro ao obter GNEWS_API_KEY da base de dados:', error);
            return null;
        }
    }

    /**
     * Obter OpenAI API key da base de dados
     */
    private async getOpenAIApiKey(tenantId: number): Promise<string | null> {
        try {
            const config = await this.obterConfiguracao(tenantId, 'OPENAI_API_KEY');
            if (!config) {
                this.logger.warn('OPENAI_API_KEY não configurada na base de dados - Traduções não funcionarão');
                return null;
            }
            return config;
        } catch (error) {
            this.logger.error('Erro ao obter OPENAI_API_KEY da base de dados:', error);
            return null;
        }
    }

    /**
     * Obter modelo OpenAI da base de dados (default: gpt-3.5-turbo)
     */
    private async getOpenAIModel(tenantId: number): Promise<string> {
        try {
            const config = await this.obterConfiguracao(tenantId, 'OPENAI_MODEL_NOTICIAS');
            if (config) {
                return config;
            }
        } catch (error) {
            this.logger.debug('Configuração OPENAI_MODEL_NOTICIAS não encontrada, usando default');
        }
        return 'gpt-3.5-turbo'; // Default: modelo mais barato
    }

    /**
     * Criar cliente OpenAI com API key da base de dados
     */
    private async createOpenAIClient(tenantId: number): Promise<OpenAI | null> {
        const apiKey = await this.getOpenAIApiKey(tenantId);
        if (!apiKey) {
            return null;
        }

        return new OpenAI({
            apiKey: apiKey,
        });
    }

    /**
     * Traduzir texto usando OpenAI
     * @param tenantId ID do tenant
     * @param text Texto em inglês para traduzir
     * @param targetLang Idioma de destino ('pt' ou 'es')
     * @returns Texto traduzido
     */
    private async traduzirTexto(tenantId: number, text: string, targetLang: 'pt' | 'es'): Promise<string> {
        if (!text) {
            return text; // Retornar texto vazio se não houver texto
        }

        try {
            const openai = await this.createOpenAIClient(tenantId);
            if (!openai) {
                this.logger.warn(`⚠️ [Tenant ${tenantId}] OpenAI client não disponível - OPENAI_API_KEY não configurada. Notícias não serão traduzidas.`);
                return text;
            }

            const modelo = await this.getOpenAIModel(tenantId);
            const langName = targetLang === 'pt' ? 'Portuguese (Portugal)' : 'Spanish';

            this.logger.debug(`🤖 [Tenant ${tenantId}] Chamando OpenAI (${modelo}) para traduzir para ${langName}...`);

            const completion = await openai.chat.completions.create({
                model: modelo,
                messages: [
                    {
                        role: 'system',
                        content: `You are a professional translator. Translate the following news text from English to ${langName}. Maintain the tone and style of journalism. Only return the translation, no explanations.`
                    },
                    {
                        role: 'user',
                        content: text
                    }
                ],
                temperature: 1, // Baixa temperatura para traduções mais consistentes
                max_completion_tokens: 4000,
            });

            const traducao = completion.choices[0]?.message?.content?.trim();

            if (!traducao || traducao === text) {
                this.logger.warn(`⚠️ [Tenant ${tenantId}] OpenAI retornou vazio ou igual ao original para ${targetLang}. Usando texto original.`);
                return text;
            }

            this.logger.debug(`✅ [Tenant ${tenantId}] Tradução concluída para ${targetLang} (${text.substring(0, 30)}... → ${traducao.substring(0, 30)}...)`);
            return traducao;
        } catch (error) {
            this.logger.error(`❌ [Tenant ${tenantId}] Erro OpenAI ao traduzir para ${targetLang}: ${error.message}${error.response?.data ? ' | ' + JSON.stringify(error.response.data) : ''}`);
            this.logger.error(`❌ Stack: ${error.stack}`);
            return text; // Retornar texto original em caso de erro
        }
    }

    /**
     * Traduzir notícia (apenas título e descrição) para PT e ES
     * @param tenantId ID do tenant
     * @param noticia Notícia em inglês
     * @returns Objeto com traduções e flag de sucesso
     */
    private async traduzirNoticia(tenantId: number, noticia: NoticiaExterna): Promise<{
        titulo_pt: string;
        descricao_pt: string;
        titulo_es: string;
        descricao_es: string;
        traducao_completa: boolean;
    }> {
        const FLAG_PENDENTE = 'Em processo de tradução';

        try {
            this.logger.log(`🌐 [Tenant ${tenantId}] Iniciando tradução: ${noticia.titulo.substring(0, 60)}...`);

            // Traduzir apenas título e descrição para português
            this.logger.debug(`[Tenant ${tenantId}] Traduzindo para PT-PT...`);
            const [titulo_pt, descricao_pt] = await Promise.all([
                this.traduzirTexto(tenantId, noticia.titulo, 'pt'),
                this.traduzirTexto(tenantId, noticia.descricao, 'pt'),
            ]);

            // Traduzir apenas título e descrição para espanhol
            this.logger.debug(`[Tenant ${tenantId}] Traduzindo para ES...`);
            const [titulo_es, descricao_es] = await Promise.all([
                this.traduzirTexto(tenantId, noticia.titulo, 'es'),
                this.traduzirTexto(tenantId, noticia.descricao, 'es'),
            ]);

            // Verificar se ALGUMA tradução falhou (retornou o texto original)
            // Se qualquer uma falhar, marca TODAS como pendentes
            const algumaTraduzida =
                titulo_pt !== noticia.titulo &&
                descricao_pt !== noticia.descricao &&
                titulo_es !== noticia.titulo &&
                descricao_es !== noticia.descricao;

            this.logger.log(`✅ [Tenant ${tenantId}] Tradução concluída (todas traduzidas: ${algumaTraduzida})`);

            // Se QUALQUER tradução falhou, marca TODAS como pendentes
            // Só usa as traduções se TODAS tiverem sucesso
            return {
                titulo_pt: algumaTraduzida ? titulo_pt : FLAG_PENDENTE,
                descricao_pt: algumaTraduzida ? descricao_pt : FLAG_PENDENTE,
                titulo_es: algumaTraduzida ? titulo_es : FLAG_PENDENTE,
                descricao_es: algumaTraduzida ? descricao_es : FLAG_PENDENTE,
                traducao_completa: algumaTraduzida,
            };
        } catch (error) {
            this.logger.error(`❌ [Tenant ${tenantId}] Erro ao traduzir notícia:`, error);
            // Se falhar completamente, marcar com flag pendente
            return {
                titulo_pt: FLAG_PENDENTE,
                descricao_pt: FLAG_PENDENTE,
                titulo_es: FLAG_PENDENTE,
                descricao_es: FLAG_PENDENTE,
                traducao_completa: false,
            };
        }
    }

    /**
     * Cron job que executa 3x ao dia (11:45, 16:00, 19:00)
     * Busca notícias de TODAS as categorias para cada tenant (cada tenant usa suas próprias API keys)
     */
    @Cron('35 18 * * *')  // 16:55
    @Cron('0 16 * * *')  // 16:00
    async buscarNoticiasAutomaticamente() {
        try {
            this.logger.log('🔄 Iniciando busca automática de notícias...');

            // Obter todos os tenants que têm notícias externas ativadas
            const tenantIds = [1004];

            if (tenantIds.length === 0) {
                this.logger.warn('⚠️ Nenhum tenant com NOTICIAS_EXTERNAS ativado');
                return;
            }

            this.logger.log(`📋 Tenants a processar: [${tenantIds.join(', ')}]`);
            this.logger.log(`📚 Categorias configuradas: ${this.categoriasRotacao.length}`);

            // Processar cada tenant individualmente (cada um tem suas próprias API keys)
            for (const tenantId of tenantIds) {
                try {
                    this.logger.log(`\n\n🏢 ========== TENANT ${tenantId} ==========`);

                    // Verificar limite diário do tenant logo no início
                    const noticiasHojeInicio = await this.contarNoticiasHoje(tenantId);
                    if (noticiasHojeInicio >= this.maxNoticiasPorDia) {
                        this.logger.warn(`⚠️ [Tenant ${tenantId}] Limite diário já atingido: ${noticiasHojeInicio}/${this.maxNoticiasPorDia} - pulando tenant`);
                        continue;
                    }

                    // Processar TODAS as categorias para este tenant
                    let totalGuardadas = 0;
                    for (const configCategoria of this.categoriasRotacao) {
                        try {
                            // Verificar limite antes de cada categoria
                            const noticiasHoje = await this.contarNoticiasHoje(tenantId);
                            if (noticiasHoje >= this.maxNoticiasPorDia) {
                                this.logger.warn(`⚠️ [Tenant ${tenantId}] Limite diário atingido: ${noticiasHoje}/${this.maxNoticiasPorDia} - parando categorias`);
                                break; // Para de processar mais categorias para este tenant
                            }

                            this.logger.log(`\n📰 [Tenant ${tenantId}] ${configCategoria.label} (${configCategoria.pais.toUpperCase()})`);

                            const noticiasRestantes = this.maxNoticiasPorDia - noticiasHoje;
                            const quantidadeBuscar = Math.min(this.noticiasPorBusca, noticiasRestantes);

                            // Buscar notícias da API usando a GNEWS_API_KEY deste tenant
                            this.logger.log(`🔍 [Tenant ${tenantId}] Buscando ${quantidadeBuscar} notícias...`);
                            const noticiasApi = await this.buscarDaApi(tenantId, {
                                categoria: configCategoria.categoria,
                                idioma: 'en',
                                pais: configCategoria.pais,
                                max: quantidadeBuscar
                            });

                            this.logger.log(`✅ [Tenant ${tenantId}] ${noticiasApi.length} notícias obtidas de ${configCategoria.label}`);

                            // Guardar notícias com traduções (usando OPENAI_API_KEY deste tenant)
                            let guardadas = 0;
                            let duplicadas = 0;
                            for (const noticia of noticiasApi) {
                                try {
                                    // IMPORTANTE: Verificar se notícia já existe ANTES de traduzir (economia de $$$)
                                    const pool = await this.databaseService.getTenantConnection(tenantId);
                                    const existe = await pool.request()
                                        .input('url', sql.NVarChar, noticia.url)
                                        .query(`SELECT id FROM noticias_externas WHERE url = @url`);

                                    if (existe.recordset.length > 0) {
                                        this.logger.debug(`[Tenant ${tenantId}] Notícia duplicada (pulando): ${noticia.titulo.substring(0, 60)}...`);
                                        duplicadas++;
                                        continue; // Pula para próxima notícia SEM traduzir
                                    }

                                    // Traduzir apenas se não existir
                                    const traducoes = await this.traduzirNoticia(tenantId, noticia);

                                    // Criar identificador único da categoria (ex: "portugal", "espanha", "general")
                                    const categoriaId = configCategoria.pais === 'pt' ? 'portugal' :
                                        configCategoria.pais === 'es' ? 'espanha' :
                                            configCategoria.pais === 'gb' ? 'europa_uk' :
                                                configCategoria.pais === 'de' ? 'europa_de' :
                                                    configCategoria.pais === 'fr' ? 'europa_fr' :
                                                        configCategoria.categoria;

                                    // Guardar notícia com todas as traduções
                                    await this.guardarNoticiaDB(tenantId, noticia, categoriaId, traducoes);
                                    guardadas++;

                                    this.logger.log(`✅ [Tenant ${tenantId}] Notícia ${guardadas}/${noticiasApi.length} guardada com sucesso`);
                                } catch (error) {
                                    this.logger.error(`[Tenant ${tenantId}] Erro ao processar notícia "${noticia.titulo}":`, error.message);
                                }
                            }

                            totalGuardadas += guardadas;
                            const novoTotal = noticiasHoje + guardadas;
                            this.logger.log(`✅ [Tenant ${tenantId}] ${configCategoria.label}: ${guardadas} novas, ${duplicadas} duplicadas (Total hoje: ${novoTotal}/${this.maxNoticiasPorDia})`);

                        } catch (error) {
                            this.logger.error(`❌ [Tenant ${tenantId}] Erro ao processar ${configCategoria.label}:`, error.message);
                        }
                    }

                    this.logger.log(`\n✅ [Tenant ${tenantId}] Processamento concluído: ${totalGuardadas} notícias guardadas no total`);

                } catch (error) {
                    this.logger.error(`❌ [Tenant ${tenantId}] Erro geral no processamento:`, error);
                }
            }

            this.logger.log(`\n\n✅ Busca automática concluída para ${tenantIds.length} tenant(s)`);

        } catch (error) {
            this.logger.error('❌ Erro na busca automática de notícias:', error);
        }
    }

    /**
     * Cron job que executa de hora em hora
     * Tenta traduzir notícias que falharam na tradução inicial
     */
    @Cron('0 * * * *')  // A cada hora
    async processarTraducoesPendentes() {
        try {
            this.logger.log('🔄 Iniciando processamento de traduções pendentes...');

            // Obter todos os tenants que têm notícias externas ativadas
            const tenantIds = await this.getTenantsComNoticiasAtivadas();

            if (tenantIds.length === 0) {
                this.logger.warn('⚠️ Nenhum tenant com NOTICIAS_EXTERNAS ativado');
                return;
            }

            let totalProcessadas = 0;

            for (const tenantId of tenantIds) {
                try {
                    this.logger.log(`\n📝 [Tenant ${tenantId}] Processando traduções pendentes...`);

                    const pool = await this.databaseService.getTenantConnection(tenantId);

                    // Buscar notícias com tradução pendente (máximo 10 por vez)
                    const result = await pool.request()
                        .query(`
                            SELECT TOP 10
                                id, titulo, descricao, url
                            FROM noticias_externas
                            WHERE traducao_pendente = 1
                                AND ativo = 1
                            ORDER BY created_at DESC
                        `);

                    const noticiasPendentes = result.recordset;

                    if (noticiasPendentes.length === 0) {
                        this.logger.log(`✅ [Tenant ${tenantId}] Nenhuma tradução pendente`);
                        continue;
                    }

                    this.logger.log(`📰 [Tenant ${tenantId}] ${noticiasPendentes.length} notícias pendentes encontradas`);

                    for (const noticia of noticiasPendentes) {
                        try {
                            // Tentar traduzir novamente
                            const traducoes = await this.traduzirNoticia(tenantId, {
                                titulo: noticia.titulo,
                                descricao: noticia.descricao,
                                conteudo: '',
                                url: noticia.url,
                                fonte: '',
                                publicado_em: ''
                            });

                            // Se tradução foi bem-sucedida, atualizar no banco
                            if (traducoes.traducao_completa) {
                                await pool.request()
                                    .input('id', sql.Int, noticia.id)
                                    .input('tituloPt', sql.NVarChar, traducoes.titulo_pt)
                                    .input('descricaoPt', sql.NVarChar, traducoes.descricao_pt)
                                    .input('tituloEs', sql.NVarChar, traducoes.titulo_es)
                                    .input('descricaoEs', sql.NVarChar, traducoes.descricao_es)
                                    .query(`
                                        UPDATE noticias_externas
                                        SET titulo_pt = @tituloPt,
                                            descricao_pt = @descricaoPt,
                                            titulo_es = @tituloEs,
                                            descricao_es = @descricaoEs,
                                            traducao_pendente = 0
                                        WHERE id = @id
                                    `);

                                totalProcessadas++;
                                this.logger.log(`✅ [Tenant ${tenantId}] Notícia ${noticia.id} traduzida com sucesso`);
                            } else {
                                this.logger.warn(`⚠️ [Tenant ${tenantId}] Tradução ainda pendente para notícia ${noticia.id}`);
                            }
                        } catch (error) {
                            this.logger.error(`❌ [Tenant ${tenantId}] Erro ao traduzir notícia ${noticia.id}:`, error.message);
                        }
                    }

                } catch (error) {
                    this.logger.error(`❌ [Tenant ${tenantId}] Erro no processamento de traduções:`, error);
                }
            }

            this.logger.log(`\n✅ Processamento de traduções pendentes concluído: ${totalProcessadas} traduções completadas`);

        } catch (error) {
            this.logger.error('❌ Erro no processamento de traduções pendentes:', error);
        }
    }

    /**
     * Cron job semanal (domingo às 02:00)
     * Apaga notícias com mais de 7 dias para cada tenant com NOTICIAS_EXTERNAS ativado
     */
    @Cron('0 2 * * 0')
    async limpezaSemanal() {
        try {
            this.logger.log('🧹 Iniciando limpeza semanal de notícias antigas...');

            // Obter todos os tenants que têm notícias externas ativadas
            const tenantIds = await this.getTenantsComNoticiasAtivadas();

            if (tenantIds.length === 0) {
                this.logger.warn('⚠️ Nenhum tenant com NOTICIAS_EXTERNAS ativado');
                return;
            }

            let totalRemovidas = 0;

            // Processar cada tenant
            for (const tenantId of tenantIds) {
                try {
                    this.logger.log(`🧹 [Tenant ${tenantId}] Limpando notícias antigas...`);

                    const pool = await this.databaseService.getTenantConnection(tenantId);

                    const result = await pool.request()
                        .query(`
                            DELETE FROM noticias_externas
                            WHERE created_at < DATEADD(day, -7, GETDATE())
                        `);

                    const removidas = result.rowsAffected[0] || 0;
                    totalRemovidas += removidas;

                    this.logger.log(`✅ [Tenant ${tenantId}] Limpeza concluída: ${removidas} notícias antigas removidas`);

                } catch (error) {
                    this.logger.error(`❌ [Tenant ${tenantId}] Erro na limpeza semanal:`, error);
                }
            }

            this.logger.log(`\n✅ Limpeza semanal concluída: ${totalRemovidas} notícias removidas de ${tenantIds.length} tenant(s)`);

        } catch (error) {
            this.logger.error('❌ Erro na limpeza semanal:', error);
        }
    }

    /**
     * Buscar notícias da DB (usado pelo frontend)
     */
    async listarNoticiasBD(tenantId: number, params: BuscarNoticiasDto): Promise<NoticiaDB[]> {
        const pool = await this.databaseService.getTenantConnection(tenantId);

        const max = params.max || 12;

        let query = `
            SELECT TOP (@max)
                id,
                titulo,
                descricao,
                conteudo,
                titulo_pt,
                descricao_pt,
                conteudo_pt,
                titulo_es,
                descricao_es,
                conteudo_es,
                url,
                imagem_url,
                fonte,
                categoria,
                idioma,
                pais,
                publicado_em,
                created_at,
                ativo
            FROM noticias_externas
            WHERE ativo = 1
        `;

        const request = pool.request()
            .input('max', sql.Int, max);

        // Filtrar por categoria se especificado
        if (params.categoria) {
            query += ` AND categoria = @categoria`;
            request.input('categoria', sql.NVarChar, params.categoria);
        }

        // Ordenar por data de publicação (mais recentes primeiro)
        query += ` ORDER BY publicado_em DESC, created_at DESC`;

        const result = await request.query(query);

        return result.recordset;
    }

    /**
     * Contar notícias criadas hoje
     */
    private async contarNoticiasHoje(tenantId: number): Promise<number> {
        const pool = await this.databaseService.getTenantConnection(tenantId);

        const result = await pool.request()
            .query(`
                SELECT COUNT(*) as total
                FROM noticias_externas
                WHERE CAST(created_at AS DATE) = CAST(GETDATE() AS DATE)
            `);

        return result.recordset[0]?.total || 0;
    }

    /**
     * Guardar notícia na DB com traduções (apenas título e descrição)
     * NOTA: Assume que verificação de duplicata já foi feita antes de chamar este método
     */
    private async guardarNoticiaDB(
        tenantId: number,
        noticia: NoticiaExterna,
        categoria: string,
        traducoes?: {
            titulo_pt: string;
            descricao_pt: string;
            titulo_es: string;
            descricao_es: string;
            traducao_completa: boolean;
        }
    ): Promise<void> {
        const pool = await this.databaseService.getTenantConnection(tenantId);

        // Inserir nova notícia com traduções (conteúdo sempre null)
        await pool.request()
            .input('titulo', sql.NVarChar, noticia.titulo)
            .input('descricao', sql.NVarChar, noticia.descricao || null)
            .input('tituloPt', sql.NVarChar, traducoes?.titulo_pt || null)
            .input('descricaoPt', sql.NVarChar, traducoes?.descricao_pt || null)
            .input('tituloEs', sql.NVarChar, traducoes?.titulo_es || null)
            .input('descricaoEs', sql.NVarChar, traducoes?.descricao_es || null)
            .input('url', sql.NVarChar, noticia.url)
            .input('imagemUrl', sql.NVarChar, noticia.imagem_url || null)
            .input('fonte', sql.NVarChar, noticia.fonte)
            .input('categoria', sql.NVarChar, categoria)
            .input('idioma', sql.VarChar, 'en')
            .input('pais', sql.VarChar, 'us')
            .input('publicadoEm', sql.DateTime2, new Date(noticia.publicado_em))
            .input('traducaoPendente', sql.Bit, traducoes?.traducao_completa === false ? 1 : 0)
            .query(`
                INSERT INTO noticias_externas (
                    titulo, descricao, conteudo,
                    titulo_pt, descricao_pt, conteudo_pt,
                    titulo_es, descricao_es, conteudo_es,
                    url, imagem_url, fonte, categoria, idioma, pais,
                    publicado_em, traducao_pendente, ativo
                ) VALUES (
                    @titulo, @descricao, NULL,
                    @tituloPt, @descricaoPt, NULL,
                    @tituloEs, @descricaoEs, NULL,
                    @url, @imagemUrl, @fonte, @categoria, @idioma, @pais,
                    @publicadoEm, @traducaoPendente, 1
                )
            `);

        this.logger.debug(`✅ Notícia guardada: ${noticia.titulo}`);
    }

    /**
     * Buscar notícias da API GNews
     * NOTA: Busca sempre em inglês porque tem mais conteúdo disponível
     */
    private async buscarDaApi(tenantId: number, params: BuscarNoticiasDto): Promise<NoticiaExterna[]> {
        const apiKey = await this.getGNewsApiKey(tenantId);

        if (!apiKey) {
            throw new Error('GNEWS_API_KEY não configurada na base de dados');
        }

        const queryParams = new URLSearchParams({
            apikey: apiKey,
            lang: 'en',  // Sempre buscar em inglês (mais conteúdo disponível)
            country: params.pais || 'us',
            max: String(params.max || 10),
        });

        // Adicionar categoria ou keywords (não ambos)
        // NOTA: GNews usa 'topic' para categorias (general, world, nation, business, technology, science, health, sports, entertainment)
        if (params.keywords) {
            queryParams.append('q', params.keywords);
        } else if (params.categoria) {
            // Mapear categorias customizadas para topics da GNews API
            const topicMap: { [key: string]: string } = {
                'general': 'general',
                'world': 'world',
                'portugal': 'nation',
                'espanha': 'nation',
                'europa_uk': 'world',
                'europa_de': 'world',
                'europa_fr': 'world',
                'technology': 'technology',
                'business': 'business',
                'science': 'science',
                'health': 'health',
                'nation': 'nation'
            };

            const topic = topicMap[params.categoria] || params.categoria;
            queryParams.append('topic', topic);
        }

        const endpoint = params.keywords ? 'search' : 'top-headlines';
        const url = `${this.baseUrl}/${endpoint}?${queryParams.toString()}`;

        this.logger.debug(`Buscando notícias de: ${url.replace(apiKey, 'HIDDEN')}`);

        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            this.logger.error(`GNews API error: ${response.status} - ${errorText}`);
            throw new Error(`GNews API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        if (!data.articles || !Array.isArray(data.articles)) {
            this.logger.warn(`GNews API retornou sem artigos para país: ${params.pais}, categoria: ${params.categoria}`);
            return [];
        }

        this.logger.log(`✅ GNews API retornou ${data.articles.length} artigos para país: ${params.pais}, categoria: ${params.categoria}`);

        return data.articles.map((article: any) => ({
            titulo: article.title,
            descricao: article.description,
            conteudo: article.content,
            url: article.url,
            imagem_url: article.image,
            fonte: article.source?.name || 'Desconhecido',
            publicado_em: article.publishedAt
        }));
    }

    /**
     * Forçar busca manual (para testes ou admin)
     */
    async buscarManual(tenantId: number, categoria?: string): Promise<{ sucesso: boolean; mensagem: string }> {
        try {
            const noticiasHoje = await this.contarNoticiasHoje(tenantId);

            if (noticiasHoje >= this.maxNoticiasPorDia) {
                return {
                    sucesso: false,
                    mensagem: `Limite diário atingido: ${noticiasHoje}/${this.maxNoticiasPorDia} notícias`
                };
            }

            const noticias = await this.buscarDaApi(tenantId, {
                categoria: categoria || 'general',
                idioma: 'en',
                pais: 'us',
                max: this.noticiasPorBusca
            });

            let guardadas = 0;
            for (const noticia of noticias) {
                try {
                    // Traduzir notícia para PT e ES
                    this.logger.log(`🌐 Traduzindo: ${noticia.titulo.substring(0, 50)}...`);
                    const traducoes = await this.traduzirNoticia(tenantId, noticia);

                    await this.guardarNoticiaDB(tenantId, noticia, categoria || 'general', traducoes);
                    guardadas++;
                } catch (error) {
                    this.logger.error(`Erro ao guardar notícia: ${noticia.titulo}`, error);
                }
            }

            return {
                sucesso: true,
                mensagem: `${guardadas} notícias guardadas com sucesso`
            };

        } catch (error) {
            this.logger.error('Erro na busca manual:', error);
            return {
                sucesso: false,
                mensagem: `Erro: ${error.message}`
            };
        }
    }

    /**
     * Estatísticas
     */
    async getStats(tenantId: number): Promise<any> {
        const pool = await this.databaseService.getTenantConnection(tenantId);

        const result = await pool.request()
            .query(`
                SELECT
                    COUNT(*) as total_noticias,
                    COUNT(CASE WHEN CAST(created_at AS DATE) = CAST(GETDATE() AS DATE) THEN 1 END) as noticias_hoje,
                    COUNT(DISTINCT categoria) as total_categorias,
                    MIN(created_at) as primeira_noticia,
                    MAX(created_at) as ultima_noticia
                FROM noticias_externas
                WHERE ativo = 1
            `);

        const porCategoria = await pool.request()
            .query(`
                SELECT
                    categoria,
                    COUNT(*) as total
                FROM noticias_externas
                WHERE ativo = 1
                GROUP BY categoria
                ORDER BY total DESC
            `);

        return {
            ...result.recordset[0],
            por_categoria: porCategoria.recordset,
            limite_diario: this.maxNoticiasPorDia,
            noticias_restantes_hoje: this.maxNoticiasPorDia - (result.recordset[0]?.noticias_hoje || 0)
        };
    }
}
