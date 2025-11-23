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

	const [searchValue, setSearchValue] = useState("");
	const [selectedTag, setSelectedTag] = useState<string | null>(null);

	// current page
	const [currentPage, setCurrentPage] = useState(1);

	// per page
	const [blogPerPage, setBlogPerPage] = useState(2);

	// index of last page
	const indexOfLastPage = currentPage * blogPerPage;

	// index of first page
	const indexOfFirstPage = indexOfLastPage - blogPerPage;

	// tag filter
	const base = noticias ?? [];
	const afterTag = selectedTag
		? base.filter((n: any) =>
				(n.tags ?? []).some(
					(et: any) => (et?.nome ?? et?.name) === selectedTag
				)
		  )
		: base;

	const filteredNoticias = searchValue
		? afterTag.filter((n: any) => {
				const title = (n?.titulo ?? "") as string;
				const body = (n?.conteudo ?? "") as string;
				const q = searchValue.toLowerCase();
				return (
					(title &&
						title.toLowerCase &&
						title.toLowerCase().includes(q)) ||
					(body &&
						body.toLowerCase &&
						body.toLowerCase().includes(q)) ||
					(stripHtml
						? stripHtml(title).toLowerCase().includes(q)
						: false) ||
					(stripHtml
						? stripHtml(body).toLowerCase().includes(q)
						: false)
				);
		  })
		: afterTag;

	const currentNoticias = filteredNoticias?.slice(
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
			<section className="blog__area pt-120 pb-100">
				<div className="container">
					<div className="row">
						<div className="col-xxl-8 col-xl-8 col-lg-8">
							<div className="postbox__wrapper pr-20">
								{filteredNoticias &&
								filteredNoticias.length === 0 ? (
									noticias && noticias.length === 0 ? (
										<div className="alert alert-crimson text-center">
											{t("blogs.no_total")}
										</div>
									) : (
										<div className="alert alert-crimson text-center">
											{t("blogs.no_results")}
										</div>
									)
								) : (
									<>
										{currentNoticias?.map(blog => (
											<Card key={blog?.id} blog={blog} />
										))}
										{filteredNoticias &&
											filteredNoticias.length > 0 && (
												<div className="basic-pagination">
													<Pagination
														blogPerPage={
															blogPerPage
														}
														toltalBlogs={
															filteredNoticias?.length ||
															0
														}
														currentPage={
															currentPage
														}
														paginate={paginate}
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
