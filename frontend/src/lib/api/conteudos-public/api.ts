import { publicApiClient, type RequestConfig } from "../client";
import type {
	ConteudoResumo,
	ConteudoCompleto,
	FiltrosConteudo,
	PaginatedResponse,
	ComentarioPublico,
	CriarComentarioPublicoDto,
} from "./types";

class ConteudosPublicAPI {
	private baseUrl = "/public/conteudos";

	/**
	 * Listar conteúdos públicos com filtros e paginação por idioma
	 * @example
	 * ```ts
	 * const result = await conteudosPublicAPI.listar('pt-PT', {
	 *   tipoConteudoId: 1,
	 *   destaque: true,
	 *   pageSize: 10,
	 *   camposPersonalizados: [
	 *     { codigo: 'entidades', valor: 'antoniosergio' }
	 *   ]
	 * })
	 * ```
	 */
	async listar(
		idioma: string,
		filtros?: FiltrosConteudo,
		config?: RequestConfig
	): Promise<PaginatedResponse<ConteudoResumo>> {
		const tenantId = publicApiClient.getTenantId();

		// Transform camposPersonalizados array into individual campoCodigo/campoValor params
		const params: any = { ...filtros };

		if (
			filtros?.camposPersonalizados &&
			filtros.camposPersonalizados.length > 0
		) {
			// For now, support the first custom field (backend limitation)
			// In the future, this could be extended to support multiple fields
			const campo = filtros.camposPersonalizados[0];
			params.campoCodigo = campo.codigo;
			params.campoValor = campo.valor;
			delete params.camposPersonalizados;
		}

		return publicApiClient.get<PaginatedResponse<ConteudoResumo>>(
			`${this.baseUrl}/${tenantId}/language/${idioma}`,
			{
				params,
				skipErrorHandling: false,
				...config,
			}
		);
	}

	/**
	 * Obter conteúdo completo por slug
	 * @example
	 * ```ts
	 * const conteudo = await conteudosPublicAPI.obterPorSlug('meu-artigo')
	 * ```
	 */
	async obterPorSlug(
		slug: string,
		config?: RequestConfig
	): Promise<ConteudoCompleto> {
		const tenantId = publicApiClient.getTenantId();

		return publicApiClient.get<ConteudoCompleto>(
			`${this.baseUrl}/${tenantId}/slug/${slug}`,
			{
				skipErrorHandling: false,
				...config,
			}
		);
	}

	/**
	 * Listar conteúdos em destaque por idioma
	 * @example
	 * ```ts
	 * const destaques = await conteudosPublicAPI.listarDestaques('pt-PT', 5)
	 * ```
	 */
	async listarDestaques(
		idioma: string,
		limit: number = 5,
		tipoConteudoId?: number,
		config?: RequestConfig
	): Promise<ConteudoResumo[]> {
		const result = await this.listar(
			idioma,
			{
				destaque: true,
				pageSize: limit,
				tipoConteudoId,
			},
			config
		);

		return result.data;
	}

	/**
	 * Listar conteúdos por categoria e idioma
	 * @example
	 * ```ts
	 * const artigos = await conteudosPublicAPI.listarPorCategoria('pt-PT', 5, 1, 10)
	 * ```
	 */
	async listarPorCategoria(
		idioma: string,
		categoriaId: number,
		page: number = 1,
		pageSize: number = 10,
		config?: RequestConfig
	): Promise<PaginatedResponse<ConteudoResumo>> {
		return this.listar(
			idioma,
			{
				categoriaId,
				page,
				pageSize,
			},
			config
		);
	}

	/**
	 * Listar conteúdos por tag e idioma
	 * @example
	 * ```ts
	 * const artigos = await conteudosPublicAPI.listarPorTag('pt-PT', 'tecnologia')
	 * ```
	 */
	async listarPorTag(
		idioma: string,
		tag: string,
		page: number = 1,
		pageSize: number = 10,
		config?: RequestConfig
	): Promise<PaginatedResponse<ConteudoResumo>> {
		return this.listar(
			idioma,
			{
				tag,
				page,
				pageSize,
			},
			config
		);
	}

	/**
	 * Pesquisar conteúdos por idioma
	 * @example
	 * ```ts
	 * const resultados = await conteudosPublicAPI.pesquisar('pt-PT', 'nextjs')
	 * ```
	 */
	async pesquisar(
		idioma: string,
		texto: string,
		page: number = 1,
		pageSize: number = 10,
		config?: RequestConfig
	): Promise<PaginatedResponse<ConteudoResumo>> {
		return this.listar(
			idioma,
			{
				textoPesquisa: texto,
				page,
				pageSize,
			},
			config
		);
	}

	/**
	 * Listar conteúdos recentes por idioma
	 * @example
	 * ```ts
	 * const recentes = await conteudosPublicAPI.listarRecentes('pt-PT', 10)
	 * ```
	 */
	async listarRecentes(
		idioma: string,
		limit: number = 10,
		tipoConteudoId?: number,
		config?: RequestConfig
	): Promise<ConteudoResumo[]> {
		const result = await this.listar(
			idioma,
			{
				pageSize: limit,
				tipoConteudoId,
				page: 1,
			},
			config
		);

		return result.data;
	}

	/**
	 * Listar comentários aprovados de um conteúdo
	 * @example
	 * ```ts
	 * const comentarios = await conteudosPublicAPI.listarComentarios('meu-artigo')
	 * ```
	 */
	async listarComentarios(
		conteudoSlug: string,
		config?: RequestConfig
	): Promise<ComentarioPublico[]> {
		const tenantId = publicApiClient.getTenantId();

		return publicApiClient.get<ComentarioPublico[]>(
			`${this.baseUrl}/comentarios/${tenantId}/conteudo/${conteudoSlug}`,
			{
				skipErrorHandling: false,
				...config,
			}
		);
	}

	/**
	 * Criar comentário público (sem autenticação)
	 * @example
	 * ```ts
	 * const comentario = await conteudosPublicAPI.criarComentario({
	 *   conteudoId: 123,
	 *   autorNome: 'João Silva',
	 *   autorEmail: 'joao@example.com',
	 *   conteudo: 'Excelente artigo!'
	 * })
	 * ```
	 */
	async criarComentario(
		dto: CriarComentarioPublicoDto,
		config?: RequestConfig
	): Promise<ComentarioPublico> {
		const tenantId = publicApiClient.getTenantId();

		return publicApiClient.post<ComentarioPublico>(
			`${this.baseUrl}/comentarios/${tenantId}`,
			dto,
			{
				skipErrorHandling: false,
				...config,
			}
		);
	}
}

export const conteudosPublicAPI = new ConteudosPublicAPI();
