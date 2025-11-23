// Enums
export enum StatusConteudo {
	RASCUNHO = "rascunho",
	PUBLICADO = "publicado",
	ARQUIVADO = "arquivado",
	AGENDADO = "agendado",
	EM_REVISAO = "em_revisao",
}

export enum TipoAnexo {
	IMAGEM = "imagem",
	VIDEO = "video",
	DOCUMENTO = "documento",
	AUDIO = "audio",
	YOUTUBE_URL = "youtube",
	VIMEO_URL = "vimeo",
	OUTRO = "outro",
}

// Interfaces Base
export interface Tag {
	id: number;
	nome: string;
	slug: string;
	cor?: string;
}

export interface ImageVariants {
	original: string;
	large: string;
	medium: string;
	small: string;
	thumbnail: string;
}

export interface Anexo {
	id: number;
	conteudo_anexo_id?: number;
	tipo_anexo: TipoAnexo;
	legenda?: string;
	ordem: number;
	principal: boolean;
	nome: string;
	nome_original: string;
	mime_type?: string;
	caminho: string;
	url: string;
	tipo: string;
	tamanho_bytes: number;
	variants?: ImageVariants | null;
}

export interface ValorCampoPersonalizado {
	codigo_campo: string;
	valor_texto?: string;
	valor_numero?: number;
	valor_data?: string;
	valor_datetime?: string;
	valor_boolean?: boolean;
	valor_json?: any;
}

// Conteúdo Resumido (para listagens)
export interface ConteudoResumo {
	id: number;
	tipo_conteudo_id: number;
	tipo_conteudo_nome: string;
	tipo_conteudo_codigo: string;
	categoria_id?: number;
	categoria_nome?: string;
	titulo: string;
	slug: string;
	subtitulo?: string;
	resumo?: string;
	conteudo?: string;
	imagem_destaque?: string;
	autor_id: number;
	autor_nome: string;
	status: StatusConteudo;
	destaque: boolean;
	visualizacoes: number;
	publicado_em?: string;
	criado_em: string;
	atualizado_em?: string;
	total_comentarios: number;
	total_favoritos: number;
	data_inicio?: string;
	data_fim?: string;
	meta_title?: string;
	meta_description?: string;
	meta_keywords?: string;
	tags?: Tag[];
	anexos?: Anexo[];
	campos_personalizados?: ValorCampoPersonalizado[];
}

// Conteúdo Completo (para página individual)
export interface ConteudoCompleto {
	id: number;
	tipo_conteudo_id: number;
	tipo_conteudo_nome: string;
	tipo_conteudo_codigo: string;
	categoria_id?: number;
	categoria_nome?: string;
	categoria_slug?: string;
	titulo: string;
	slug: string;
	subtitulo?: string;
	resumo?: string;
	conteudo?: string;
	imagem_destaque?: string;
	autor_id: number;
	autor_nome: string;
	autor_email?: string;
	status: StatusConteudo;
	destaque: boolean;
	permite_comentarios: boolean;
	visualizacoes: number;
	publicado_em?: string;
	data_inicio?: string;
	data_fim?: string;
	meta_title?: string;
	meta_description?: string;
	meta_keywords?: string;
	criado_em: string;
	atualizado_em?: string;
	tags?: Tag[];
	anexos?: Anexo[];
	campos_personalizados?: ValorCampoPersonalizado[];
	total_comentarios?: number;
	total_favoritos?: number;
}

// Filtros para listagem
export interface FiltrosConteudo {
	tipoConteudoId?: number;
	categoriaId?: number;
	destaque?: boolean;
	textoPesquisa?: string;
	tag?: string;
	page?: number;
	pageSize?: number;
	// Support for multiple custom field filters
	camposPersonalizados?: Array<{
		codigo: string;
		valor: string;
	}>;
}

// Resposta paginada
export interface PaginatedResponse<T> {
	data: T[];
	meta: {
		total: number;
		page: number;
		pageSize: number;
		totalPages: number;
	};
}

// Comentário
export interface ComentarioPublico {
	id: number;
	conteudo: string;
	comentario_pai_id?: number | null;
	utilizador_id?: number | null;
	utilizador_nome?: string | null;
	utilizador_foto?: string | null;
	aprovado: boolean;
	likes: number;
	criado_em: string;
	atualizado_em?: string;
	total_respostas: number;
}

// DTO para criar comentário público
export interface CriarComentarioPublicoDto {
	conteudoId: number;
	autorNome?: string;
	autorEmail?: string;
	conteudo: string;
	comentarioPaiId?: number;
}

// Resposta de erro
export interface ApiError {
	message: string;
	statusCode: number;
	error?: string;
}
