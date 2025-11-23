import { useMemo } from "react";
import Link from "next/link";
import { useEntidadeContext, useLanguageContext } from "@/context";
import { useTranslation } from "react-i18next";
import { stripHtml, plainTextTruncate } from "@/utils";
import {
	formatLanguageCode,
	StatusConteudo,
	useConteudos,
} from "@/lib/api/conteudos-public";

const RightSide = (props: {
	searchValue?: string;
	setSearchValue?: (v: string) => void;
	selectedTag?: string | null;
	setSelectedTag?: (v: string | null) => void;
}) => {
	const { selectedEntidade, setSelectedEntidade, entidades, loading } =
		useEntidadeContext();
	const selectedTag = props.selectedTag ?? null;
	const setSelectedTag = props.setSelectedTag ?? (() => {});
	const { t } = useTranslation("content");

	const { selectedLanguage } = useLanguageContext();
	const idioma = formatLanguageCode(selectedLanguage);

	const filtros = useMemo(() => {
		const baseFilters: any = { tipoConteudoId: 16 };

		if (selectedEntidade?.value) {
			baseFilters.campoCodigo = "entidades";
			baseFilters.campoValor = selectedEntidade.value;
		}

		return baseFilters;
	}, [selectedEntidade?.value]);

	const {
		data: noticiasData,
		isLoading,
		error,
	} = useConteudos(idioma, filtros);

	const noticias = noticiasData?.data;

	const allNoticias = noticias ?? [];
	const tagsSet = new Map<string, number>();
	allNoticias.forEach((n: any) => {
		if (n?.status !== StatusConteudo.PUBLICADO) return;
		(n.tags ?? []).forEach((et: any) => {
			const name = et?.nome ?? et?.name;
			if (!name) return;
			tagsSet.set(name, (tagsSet.get(name) ?? 0) + 1);
		});
	});
	const tags = Array.from(tagsSet.entries()).map(([nome, count]) => ({
		nome,
		count,
	}));

	const noticiasAfterTagFilter = selectedTag
		? allNoticias.filter((n: any) =>
				(n.tags ?? []).some(
					(et: any) => (et?.nome ?? et?.name) === selectedTag
				)
		  )
		: allNoticias;

	const noticiasFiltered =
		props.searchValue ?? ""
			? noticiasAfterTagFilter.filter((n: any) => {
					const title = stripHtml(n?.titulo ?? "").toLowerCase();
					const body = stripHtml(n?.corpo ?? "").toLowerCase();
					const q = (props.searchValue ?? "").toLowerCase();
					return title.includes(q) || body.includes(q);
			  })
			: noticiasAfterTagFilter;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
	};
	return (
		<>
			<div className="col-xxl-4 col-xl-4 col-lg-4">
				<div className="blog__sidebar pl-70">
					<div className="sidebar__widget mb-60">
						<div className="sidebar__widget-content">
							<div className="sidebar__search p-relative">
								<form onSubmit={handleSubmit}>
									<input
										onChange={e =>
											props.setSearchValue?.(
												e.target.value
											)
										}
										value={props.searchValue ?? ""}
										type="text"
										placeholder={`${t(
											"blogs.search_placeholder"
										)}...`}
										style={{
											backgroundColor: "white",
											color: "#000",
											border: "1px solid #e6e6e6",
										}}
									/>
									<button type="submit">
										<svg
											version="1.1"
											xmlns="http://www.w3.org/2000/svg"
											x="0px"
											y="0px"
											viewBox="0 0 584.4 584.4"
											xmlSpace="preserve"
										>
											<g>
												<path
													className="st0"
													d="M565.7,474.9l-61.1-61.1c-3.8-3.8-8.8-5.9-13.9-5.9c-6.3,0-12.1,3-15.9,8.3c-16.3,22.4-36,42.1-58.4,58.4    c-4.8,3.5-7.8,8.8-8.3,14.5c-0.4,5.6,1.7,11.3,5.8,15.4l61.1,61.1c12.1,12.1,28.2,18.8,45.4,18.8c17.1,0,33.3-6.7,45.4-18.8    C590.7,540.6,590.7,499.9,565.7,474.9z"
												/>
												<path
													className="st1"
													d="M254.6,509.1c140.4,0,254.5-114.2,254.5-254.5C509.1,114.2,394.9,0,254.6,0C114.2,0,0,114.2,0,254.5    C0,394.9,114.2,509.1,254.6,509.1z M254.6,76.4c98.2,0,178.1,79.9,178.1,178.1s-79.9,178.1-178.1,178.1S76.4,352.8,76.4,254.5    S156.3,76.4,254.6,76.4z"
												/>
											</g>
										</svg>
									</button>
								</form>
							</div>
						</div>
					</div>
					<div className="sidebar__widget mb-55">
						<div className="sidebar__widget-head mb-35">
							<h3 className="sidebar__widget-title">
								{t("blogs.title")}
							</h3>
						</div>
						<div className="sidebar__widget-content">
							<div className="rc__post-wrapper">
								{noticiasFiltered?.slice(0, 3).map(noticia => {
									const imagemPrincipal =
										noticia.imagem_destaque ||
										noticia.anexos?.[0]?.caminho ||
										"";

									return (
										<div
											key={noticia?.id}
											className="rc__post d-flex align-items-start"
										>
											<div className="rc__thumb mr-20">
												<Link
													href={`/blog/${noticia?.slug}`}
												>
													<img
														src={imagemPrincipal}
														alt=""
														style={{
															objectFit: "cover",
														}}
													/>
												</Link>
											</div>
											<div className="rc__content">
												<div className="rc__meta">
													<span>
														{noticia?.publicado_em
															? new Date(
																	noticia.publicado_em
															  ).toLocaleDateString()
															: t(
																	"card.invalid_date"
															  )}
													</span>
													<h6 className="rc__title">
														<Link
															href={`/blog/${noticia?.slug}`}
														>
															{plainTextTruncate(
																noticia?.titulo,
																35
															)}
														</Link>
													</h6>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</div>
					<div className="sidebar__widget mb-55">
						<div className="sidebar__widget-head mb-35">
							<h3 className="sidebar__widget-title">
								{t("tags.title")}
							</h3>
						</div>
						<div className="sidebar__widget-content">
							<ul>
								<li>
									<Link
										href="#"
										onClick={() => setSelectedTag(null)}
									>
										{t("tags.all")}
									</Link>
								</li>
								{tags.map(tag => (
									<li key={tag.nome}>
										<Link
											href="#"
											onClick={() =>
												setSelectedTag(tag.nome)
											}
										>
											{tag.nome} ({tag.count})
										</Link>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default RightSide;
