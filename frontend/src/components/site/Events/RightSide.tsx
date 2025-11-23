import { useMemo } from "react";
import Link from "next/link";
import { useEntidadeContext, useLanguageContext } from "@/context";
import { useTranslation } from "react-i18next";
import { stripHtml, plainTextTruncate } from "@/utils";
import { formatLanguageCode, useConteudos } from "@/lib/api/conteudos-public";

type RightSideProps = {
	searchValue?: string;
	setSearchValue?: (v: string) => void;
	startDate: string;
	endDate: string;
	setStartDate: (v: string) => void;
	setEndDate: (v: string) => void;
	selectedTag: string | null;
	setSelectedTag: (v: string | null) => void;
};

const RightSide = (props: RightSideProps) => {
	const { selectedEntidade, setSelectedEntidade, entidades, loading } =
		useEntidadeContext();
	const { t } = useTranslation("content");

	const { selectedLanguage } = useLanguageContext();
	const idioma = formatLanguageCode(selectedLanguage);

	const filtros = useMemo(() => {
		const baseFilters: any = { tipoConteudoId: 20 };

		if (selectedEntidade?.value) {
			baseFilters.campoCodigo = "entidades";
			baseFilters.campoValor = selectedEntidade.value;
		}

		return baseFilters;
	}, [selectedEntidade?.value]);

	const {
		data: eventosData,
		isLoading,
		error,
	} = useConteudos(idioma, filtros);

	const eventos = eventosData?.data;

	const allEventos = eventos ?? [];
	const tagsSet = new Map<string, number>();
	allEventos.forEach((n: any) => {
		if (!n?.publico) return;
		(n.etiquetas ?? []).forEach((et: any) => {
			const name = et?.nome ?? et?.name;
			if (!name) return;
			tagsSet.set(name, (tagsSet.get(name) ?? 0) + 1);
		});
	});
	const tags = Array.from(tagsSet.entries()).map(([nome, count]) => ({
		nome,
		count,
	}));

	const eventosAfterTagFilter = props.selectedTag
		? allEventos.filter((n: any) =>
				(n.etiquetas ?? []).some(
					(et: any) => (et?.nome ?? et?.name) === props.selectedTag
				)
		  )
		: allEventos;

	const parseLocalDate = (d: string) => {
		const [y, m, day] = d.split("-").map(Number);
		return new Date(y, (m ?? 1) - 1, day ?? 1);
	};

	const eventosAfterDateFilter =
		props.startDate || props.endDate
			? eventosAfterTagFilter.filter((evento: any) => {
					const start = evento?.data_inicio
						? new Date(evento.data_inicio)
						: null;
					const end = evento?.data_fim
						? new Date(evento.data_fim)
						: start;

					if (!start && !end) return false;

					const eventStart = start
						? new Date(
								start.getFullYear(),
								start.getMonth(),
								start.getDate(),
								0,
								0,
								0,
								0
						  )
						: null;
					const eventEnd = end
						? new Date(
								end.getFullYear(),
								end.getMonth(),
								end.getDate(),
								23,
								59,
								59,
								999
						  )
						: null;

					const filterStart = props.startDate
						? parseLocalDate(props.startDate)
						: null;
					const filterEnd = props.endDate
						? parseLocalDate(props.endDate)
						: null;

					const rangeStart = filterStart
						? new Date(
								filterStart.getFullYear(),
								filterStart.getMonth(),
								filterStart.getDate(),
								0,
								0,
								0,
								0
						  )
						: null;
					const rangeEnd = filterEnd
						? new Date(
								filterEnd.getFullYear(),
								filterEnd.getMonth(),
								filterEnd.getDate(),
								23,
								59,
								59,
								999
						  )
						: null;

					if (rangeStart && rangeEnd) {
						return (
							(eventStart ? eventStart <= rangeEnd : true) &&
							(eventEnd ? eventEnd >= rangeStart : true)
						);
					} else if (rangeStart) {
						return eventEnd ? eventEnd >= rangeStart : false;
					} else if (rangeEnd) {
						return eventStart ? eventStart <= rangeEnd : false;
					}
					return true;
			  })
			: eventosAfterTagFilter;

	const eventosFiltered =
		props.searchValue ?? ""
			? eventosAfterDateFilter.filter((n: any) => {
					const title = stripHtml(n?.titulo ?? "").toLowerCase();
					const body = stripHtml(n?.corpo ?? "").toLowerCase();
					const q = (props.searchValue ?? "").toLowerCase();
					return title.includes(q) || body.includes(q);
			  })
			: eventosAfterDateFilter;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
	};
	return (
		<>
			<div className="col-xxl-4 col-xl-4 col-lg-4">
				<div className="events__sidebar pl-70">
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
											"events.search_placeholder"
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
								{t("events.date_filter")}
							</h3>
						</div>
						<div className="sidebar__widget-content">
							<div className="date-filter">
								<div className="mb-3">
									<label
										htmlFor="startDate"
										className="form-label"
									>
										{t("events.start_date")}:
									</label>
									<input
										type="date"
										id="startDate"
										className="form-control"
										value={props.startDate}
										onChange={e =>
											props.setStartDate(e.target.value)
										}
										style={{
											backgroundColor: "white",
											color: "#000",
											border: "1px solid #e6e6e6",
											padding: "8px 12px",
											borderRadius: "4px",
											width: "100%",
										}}
									/>
								</div>
								<div className="mb-3">
									<label
										htmlFor="endDate"
										className="form-label"
									>
										{t("events.end_date")}:
									</label>
									<input
										type="date"
										id="endDate"
										className="form-control"
										value={props.endDate}
										onChange={e =>
											props.setEndDate(e.target.value)
										}
										style={{
											backgroundColor: "white",
											color: "#000",
											border: "1px solid #e6e6e6",
											padding: "8px 12px",
											borderRadius: "4px",
											width: "100%",
										}}
									/>
								</div>
								{(props.startDate || props.endDate) && (
									<button
										type="button"
										onClick={() => {
											props.setStartDate("");
											props.setEndDate("");
										}}
										className="btn btn-sm btn-outline-secondary"
										style={{
											fontSize: "0.8rem",
											padding: "4px 8px",
										}}
									>
										{t("events.clear_dates")}
									</button>
								)}
							</div>
						</div>
					</div>
					<div className="sidebar__widget mb-55">
						<div className="sidebar__widget-head mb-35">
							<h3 className="sidebar__widget-title">
								{t("events.title")}
							</h3>
						</div>
						<div className="sidebar__widget-content">
							<div className="rc__post-wrapper">
								{eventosFiltered?.slice(0, 3).map(evento => {
									const imagemPrincipal =
										evento.imagem_destaque ||
										evento.anexos?.[0]?.caminho ||
										"/images/OCUj9MbhJ73rmpYYrHnLgb7sc.jpg";
									return (
										<div
											key={evento?.id}
											className="rc__post d-flex align-items-start"
										>
											<div className="rc__thumb mr-20">
												<Link
													href={`/eventos/${evento?.slug}`}
												>
													<img
														src={imagemPrincipal}
														alt={evento?.titulo}
														style={{
															objectFit: "cover",
														}}
													/>
												</Link>
											</div>
											<div className="rc__content">
												<div className="rc__meta">
													<span>
														{evento?.data_inicio &&
														evento?.data_fim
															? `${new Date(
																	evento.data_inicio
															  ).toLocaleString()} - ${new Date(
																	evento.data_fim
															  ).toLocaleString()}`
															: evento?.data_inicio
															? new Date(
																	evento.data_inicio
															  ).toLocaleString()
															: evento?.data_fim
															? new Date(
																	evento.data_fim
															  ).toLocaleString()
															: t(
																	"card.invalid_date"
															  )}
													</span>
													<h6 className="rc__title">
														<Link
															href={`/eventos/${evento?.slug}`}
														>
															{plainTextTruncate(
																evento?.titulo,
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
										onClick={() =>
											props.setSelectedTag(null)
										}
									>
										{t("tags.all")}
									</Link>
								</li>
								{tags.map(tag => (
									<li key={tag.nome}>
										<Link
											href="#"
											onClick={() =>
												props.setSelectedTag(tag.nome)
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
