"use client";

import { useState, useMemo } from "react";
import Pagination from "./Pagination";
import RightSide from "./RightSide";
import Card from "./Card";
import { useEntidadeContext, useLanguageContext } from "@/context";
import { stripHtml } from "@/utils";
import { useTranslation } from "react-i18next";
import { formatLanguageCode, useConteudos } from "@/lib/api/conteudos-public";

const Area = () => {
	const { t } = useTranslation("content");
	const { selectedEntidade, setSelectedEntidade, entidades, loading } =
		useEntidadeContext();

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

	const [searchValue, setSearchValue] = useState("");
	const [startDate, setStartDate] = useState<string>("");
	const [endDate, setEndDate] = useState<string>("");
	const [selectedTag, setSelectedTag] = useState<string | null>(null);

	// current page
	const [currentPage, setCurrentPage] = useState(1);

	// per page
	const [eventoPerPage, setEventoPerPage] = useState(2);

	// index of last page
	const indexOfLastPage = currentPage * eventoPerPage;

	// index of first page
	const indexOfFirstPage = indexOfLastPage - eventoPerPage;

	// helpers
	const parseLocalDateOnly = (s: string) => {
		const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
		if (!m) return null;
		return new Date(+m[1], +m[2] - 1, +m[3], 0, 0, 0, 0);
	};
	const toDayStart = (d: Date) =>
		new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
	const toDayEnd = (d: Date) =>
		new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

	// 1) start from raw eventos
	const base = (eventos ?? []).filter((e: any) => e?.publico !== false);

	// 2) tag filter
	const afterTag = selectedTag
		? base.filter((e: any) =>
				(e.etiquetas ?? []).some(
					(et: any) => (et?.nome ?? et?.name) === selectedTag
				)
		  )
		: base;

	// 3) date overlap filter
	const afterDate =
		startDate || endDate
			? afterTag.filter((e: any) => {
					const sRaw = e?.data_inicio
						? new Date(e.data_inicio)
						: null;
					const eRaw = e?.data_fim ? new Date(e.data_fim) : sRaw;
					if (!sRaw && !eRaw) return false;

					const eventStart = sRaw ? toDayStart(sRaw) : null;
					const eventEnd = eRaw ? toDayEnd(eRaw) : null;

					const fs = startDate ? parseLocalDateOnly(startDate) : null;
					const fe = endDate ? parseLocalDateOnly(endDate) : null;
					const rangeStart = fs ? toDayStart(fs) : null;
					const rangeEnd = fe ? toDayEnd(fe) : null;

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
			: afterTag;

	// 4) search filter
	const filteredEventos = searchValue
		? afterDate.filter((n: any) => {
				const title = (n?.titulo ?? "") as string;
				const body = (n?.corpo ?? "") as string;
				const q = searchValue.toLowerCase();
				return (
					title?.toLowerCase?.().includes(q) ||
					body?.toLowerCase?.().includes(q) ||
					(stripHtml
						? stripHtml(title).toLowerCase().includes(q)
						: false) ||
					(stripHtml
						? stripHtml(body).toLowerCase().includes(q)
						: false)
				);
		  })
		: afterDate;

	// paginate as before
	const currentEventos = filteredEventos.slice(
		indexOfFirstPage,
		indexOfLastPage
	);

	// paginate
	const paginate = (number: number) => {
		setCurrentPage(number);
	};

	// loader
	if (isLoading) {
		return (
			<div className="container">
				<h2 className="text-center pt-10 alert alert-crimson mt-50">
					{t("loading")}
				</h2>
			</div>
		);
	}
	return (
		<>
			<section className="evento__area pt-120 pb-100">
				<div className="container">
					<div className="row">
						<div className="col-xxl-8 col-xl-8 col-lg-8">
							<div className="postbox__wrapper pr-20">
								{filteredEventos &&
								filteredEventos.length === 0 ? (
									base && base.length === 0 ? (
										<div className="alert alert-crimson text-center">
											{t("events.no_total")}
										</div>
									) : (
										<div className="alert alert-crimson text-center">
											{t("events.no_results")}
										</div>
									)
								) : (
									<>
										{currentEventos?.map(evento => (
											<Card
												key={evento?.id}
												evento={evento}
											/>
										))}
										{filteredEventos &&
											filteredEventos.length > 0 && (
												<div className="basic-pagination">
													<Pagination
														{...({
															noticiasPerPage:
																eventoPerPage,
															eventsS:
																filteredEventos?.length ||
																0,
															currentPage,
															paginate,
														} as any)}
													/>
												</div>
											)}
									</>
								)}
							</div>
						</div>
						<RightSide
							searchValue={searchValue}
							setSearchValue={setSearchValue}
							startDate={startDate}
							endDate={endDate}
							setStartDate={setStartDate}
							setEndDate={setEndDate}
							selectedTag={selectedTag}
							setSelectedTag={setSelectedTag}
						/>
					</div>
				</div>
			</section>
		</>
	);
};

export default Area;
