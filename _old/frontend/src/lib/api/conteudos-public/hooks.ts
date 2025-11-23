import {
	useQuery,
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import type {
	UseQueryOptions,
	UseInfiniteQueryOptions,
	UseMutationOptions,
} from "@tanstack/react-query";
import { conteudosPublicAPI } from "./api";
import type {
	ConteudoResumo,
	ConteudoCompleto,
	FiltrosConteudo,
	PaginatedResponse,
	ApiError,
	ComentarioPublico,
	CriarComentarioPublicoDto,
} from "./types";

// ==================== LISTAGEM ====================

/**
 * Hook para listar conteúdos com filtros e paginação por idioma
 * @example
 * ```tsx
 * function BlogPage() {
 *   const { selectedLanguage } = useLanguageContext()
 *   const idioma = `${selectedLanguage.code}${selectedLanguage.region ? `-${selectedLanguage.region}` : ''}`
 *
 *   const { data, isLoading, error } = useConteudos(idioma, {
 *     tipoConteudoId: 1,
 *     destaque: true,
 *     pageSize: 10
 *   })
 *
 *   if (isLoading) return <Loading />
 *   if (error) return <Error />
 *
 *   return <ConteudosList conteudos={data.data} />
 * }
 * ```
 */
export function useConteudos(
	idioma: string,
	filtros?: FiltrosConteudo,
	options?: Omit<
		UseQueryOptions<PaginatedResponse<ConteudoResumo>, ApiError>,
		"queryKey" | "queryFn"
	>
) {
	return useQuery<PaginatedResponse<ConteudoResumo>, ApiError>({
		queryKey: ["conteudos-public", idioma, filtros],
		queryFn: () => conteudosPublicAPI.listar(idioma, filtros),
		enabled: !!idioma,
		staleTime: 1000 * 60 * 5, // 5 minutos
		...options,
	});
}

// ==================== CONTEÚDO INDIVIDUAL ====================

/**
 * Hook para obter conteúdo completo por slug
 * @example
 * ```tsx
 * function ConteudoPage({ slug }: { slug: string }) {
 *   const { data: conteudo, isLoading } = useConteudoBySlug(slug)
 *
 *   if (isLoading) return <Loading />
 *   if (!conteudo) return <NotFound />
 *
 *   return <ConteudoDetail conteudo={conteudo} />
 * }
 * ```
 */
export function useConteudoBySlug(
	slug: string,
	options?: Omit<
		UseQueryOptions<ConteudoCompleto, ApiError>,
		"queryKey" | "queryFn"
	>
) {
	return useQuery<ConteudoCompleto, ApiError>({
		queryKey: ["conteudo-public", slug],
		queryFn: () => conteudosPublicAPI.obterPorSlug(slug),
		enabled: !!slug,
		staleTime: 1000 * 60 * 10, // 10 minutos
		...options,
	});
}

// ==================== DESTAQUES ====================

/**
 * Hook para listar conteúdos em destaque por idioma
 * @example
 * ```tsx
 * function DestaquesSection() {
 *   const { selectedLanguage } = useLanguageContext()
 *   const idioma = `${selectedLanguage.code}${selectedLanguage.region ? `-${selectedLanguage.region}` : ''}`
 *
 *   const { data: destaques } = useConteudosDestaque(idioma, 5)
 *
 *   return (
 *     <div>
 *       {destaques?.map(conteudo => (
 *         <DestaqueCard key={conteudo.id} {...conteudo} />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useConteudosDestaque(
	idioma: string,
	limit: number = 5,
	tipoConteudoId?: number,
	filtros?: FiltrosConteudo,
	options?: Omit<
		UseQueryOptions<ConteudoResumo[], ApiError>,
		"queryKey" | "queryFn"
	>
) {
	return useQuery<ConteudoResumo[], ApiError>({
		queryKey: [
			"conteudos-public-destaque",
			idioma,
			limit,
			tipoConteudoId,
			filtros,
		],
		queryFn: () =>
			// Use listar so we can pass through custom filters (e.g. camposPersonalizados)
			conteudosPublicAPI
				.listar(idioma, {
					destaque: true,
					pageSize: limit,
					tipoConteudoId,
					...(filtros || {}),
				})
				.then(r => r.data),
		enabled: !!idioma,
		staleTime: 1000 * 60 * 10,
		...options,
	});
}

// ==================== POR CATEGORIA ====================

/**
 * Hook para listar conteúdos por categoria e idioma
 * @example
 * ```tsx
 * function CategoriaPage({ categoriaId }: { categoriaId: number }) {
 *   const { selectedLanguage } = useLanguageContext()
 *   const idioma = `${selectedLanguage.code}${selectedLanguage.region ? `-${selectedLanguage.region}` : ''}`
 *
 *   const { data, isLoading } = useConteudosPorCategoria(idioma, categoriaId, 1, 10)
 *
 *   return <ConteudosList conteudos={data?.data} />
 * }
 * ```
 */
export function useConteudosPorCategoria(
	idioma: string,
	categoriaId: number,
	page: number = 1,
	pageSize: number = 10,
	options?: Omit<
		UseQueryOptions<PaginatedResponse<ConteudoResumo>, ApiError>,
		"queryKey" | "queryFn"
	>
) {
	return useQuery<PaginatedResponse<ConteudoResumo>, ApiError>({
		queryKey: [
			"conteudos-public-categoria",
			idioma,
			categoriaId,
			page,
			pageSize,
		],
		queryFn: () =>
			conteudosPublicAPI.listarPorCategoria(
				idioma,
				categoriaId,
				page,
				pageSize
			),
		enabled: !!idioma && categoriaId > 0,
		staleTime: 1000 * 60 * 5,
		...options,
	});
}

// ==================== POR TAG ====================

/**
 * Hook para listar conteúdos por tag e idioma
 * @example
 * ```tsx
 * function TagPage({ tag }: { tag: string }) {
 *   const { selectedLanguage } = useLanguageContext()
 *   const idioma = `${selectedLanguage.code}${selectedLanguage.region ? `-${selectedLanguage.region}` : ''}`
 *
 *   const { data } = useConteudosPorTag(idioma, tag)
 *
 *   return <ConteudosList conteudos={data?.data} />
 * }
 * ```
 */
export function useConteudosPorTag(
	idioma: string,
	tag: string,
	page: number = 1,
	pageSize: number = 10,
	options?: Omit<
		UseQueryOptions<PaginatedResponse<ConteudoResumo>, ApiError>,
		"queryKey" | "queryFn"
	>
) {
	return useQuery<PaginatedResponse<ConteudoResumo>, ApiError>({
		queryKey: ["conteudos-public-tag", idioma, tag, page, pageSize],
		queryFn: () =>
			conteudosPublicAPI.listarPorTag(idioma, tag, page, pageSize),
		enabled: !!idioma && !!tag,
		staleTime: 1000 * 60 * 5,
		...options,
	});
}

// ==================== PESQUISA ====================

/**
 * Hook para pesquisar conteúdos por idioma
 * @example
 * ```tsx
 * function SearchPage() {
 *   const { selectedLanguage } = useLanguageContext()
 *   const idioma = `${selectedLanguage.code}${selectedLanguage.region ? `-${selectedLanguage.region}` : ''}`
 *   const [searchTerm, setSearchTerm] = useState('')
 *
 *   const { data, isLoading } = usePesquisarConteudos(idioma, searchTerm)
 *
 *   return (
 *     <>
 *       <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
 *       {isLoading ? <Loading /> : <ResultsList resultados={data?.data} />}
 *     </>
 *   )
 * }
 * ```
 */
export function usePesquisarConteudos(
	idioma: string,
	texto: string,
	page: number = 1,
	pageSize: number = 10,
	options?: Omit<
		UseQueryOptions<PaginatedResponse<ConteudoResumo>, ApiError>,
		"queryKey" | "queryFn"
	>
) {
	return useQuery<PaginatedResponse<ConteudoResumo>, ApiError>({
		queryKey: ["conteudos-public-search", idioma, texto, page, pageSize],
		queryFn: () =>
			conteudosPublicAPI.pesquisar(idioma, texto, page, pageSize),
		enabled: !!idioma && texto.length >= 2,
		staleTime: 1000 * 60 * 2,
		...options,
	});
}

// ==================== RECENTES ====================

/**
 * Hook para listar conteúdos recentes por idioma
 * @example
 * ```tsx
 * function RecentesSection() {
 *   const { selectedLanguage } = useLanguageContext()
 *   const idioma = `${selectedLanguage.code}${selectedLanguage.region ? `-${selectedLanguage.region}` : ''}`
 *
 *   const { data: recentes } = useConteudosRecentes(idioma, 10)
 *
 *   return <ConteudosList conteudos={recentes} />
 * }
 * ```
 */
export function useConteudosRecentes(
	idioma: string,
	limit: number = 10,
	tipoConteudoId?: number,
	options?: Omit<
		UseQueryOptions<ConteudoResumo[], ApiError>,
		"queryKey" | "queryFn"
	>
) {
	return useQuery<ConteudoResumo[], ApiError>({
		queryKey: ["conteudos-public-recentes", idioma, limit, tipoConteudoId],
		queryFn: () =>
			conteudosPublicAPI.listarRecentes(idioma, limit, tipoConteudoId),
		enabled: !!idioma,
		staleTime: 1000 * 60 * 5,
		...options,
	});
}

// ==================== COMENTÁRIOS ====================

/**
 * Hook para listar comentários aprovados de um conteúdo
 * @example
 * ```tsx
 * function CommentsSection({ conteudoSlug }: { conteudoSlug: string }) {
 *   const { data: comentarios, isLoading } = useComentarios(conteudoSlug)
 *
 *   if (isLoading) return <Loading />
 *
 *   return (
 *     <ul>
 *       {comentarios?.map(comment => (
 *         <CommentItem key={comment.id} comment={comment} />
 *       ))}
 *     </ul>
 *   )
 * }
 * ```
 */
export function useComentarios(
	conteudoSlug: string,
	options?: Omit<
		UseQueryOptions<ComentarioPublico[], ApiError>,
		"queryKey" | "queryFn"
	>
) {
	return useQuery<ComentarioPublico[], ApiError>({
		queryKey: ["comentarios-public", conteudoSlug],
		queryFn: () => conteudosPublicAPI.listarComentarios(conteudoSlug),
		enabled: !!conteudoSlug,
		staleTime: 1000 * 60 * 2, // 2 minutes
		refetchOnWindowFocus: true,
		...options,
	});
}

/**
 * Hook para criar um comentário público
 * @example
 * ```tsx
 * function CommentForm({ conteudoId }: { conteudoId: number }) {
 *   const { mutate, isLoading } = useCriarComentario()
 *
 *   const handleSubmit = (data) => {
 *     mutate({
 *       conteudoId,
 *       autorNome: data.name,
 *       autorEmail: data.email,
 *       conteudo: data.comment
 *     }, {
 *       onSuccess: () => toast.success('Comment posted!'),
 *       onError: () => toast.error('Failed to post comment')
 *     })
 *   }
 *
 *   return <form onSubmit={handleSubmit}>...</form>
 * }
 * ```
 */
export function useCriarComentario(
	options?: Omit<
		UseMutationOptions<
			ComentarioPublico,
			ApiError,
			CriarComentarioPublicoDto
		>,
		"mutationFn"
	>
) {
	const queryClient = useQueryClient();

	return useMutation<ComentarioPublico, ApiError, CriarComentarioPublicoDto>({
		mutationFn: (dto: CriarComentarioPublicoDto) =>
			conteudosPublicAPI.criarComentario(dto),
		onSuccess: () => {
			// Invalidate comments queries to refetch after creating a new comment
			queryClient.invalidateQueries({ queryKey: ["comentarios-public"] });
		},
		...options,
	});
}
