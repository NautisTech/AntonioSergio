"use client";

import { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, EffectFade, Autoplay } from "swiper/modules";
import { useEntidadeContext, useLanguageContext } from "@/context";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import {
	Anexo,
	ConteudoResumo,
	formatLanguageCode,
	useConteudos,
} from "@/lib/api/conteudos-public";

const HeroSkeleton = () => {
	return (
		<div className="slider__skeleton">
			<div className="skeleton-content">
				<div className="skeleton-line subtitle"></div>
				<div className="skeleton-line title"></div>
				<div className="skeleton-line description"></div>
				<div className="skeleton-line description"></div>
			</div>
		</div>
	);
};

const HeroArea = () => {
	const { selectedEntidade, setSelectedEntidade, entidades, loading } =
		useEntidadeContext();

	const { selectedLanguage } = useLanguageContext();
	const idioma = formatLanguageCode(selectedLanguage);

	const bannerFiltros = useMemo(() => {
		const baseFilters: any = { tipoConteudoId: 23 };

		if (selectedEntidade?.value) {
			baseFilters.campoCodigo = "entidades";
			baseFilters.campoValor = selectedEntidade.value;
		}

		return baseFilters;
	}, [selectedEntidade?.value]);

	const {
		data: bannersData,
		isLoading: loadingBanners,
		error: errorBanners,
	} = useConteudos(idioma, bannerFiltros);

	const banners = bannersData?.data;
	const isLoading = loadingBanners;

	if (isLoading || loading || !banners || banners.length === 0) {
		return (
			<section className="slider__area hero-skeleton-full">
				<HeroSkeleton />
			</section>
		);
	}

	return (
		<>
			<section className="slider__area hero-skeleton-medium">
				<div className="slider__active swiper-container slider__height hero-slider-height">
					<Swiper
						spaceBetween={50}
						slidesPerView={1}
						loop={true}
						autoplay={{ delay: 5000 }}
						effect={"fade"}
						className="swiper-wrapper"
						style={{ height: "85vh" }}
						modules={[Navigation, EffectFade, Autoplay]}
						navigation={{
							nextEl: ".slider-button-next",
							prevEl: ".slider-button-prev",
						}}
					>
						{banners?.map((item: ConteudoResumo) => {
							const imagemPrincipal = item.imagem_destaque;

							return (
								<SwiperSlide
									key={item.id}
									className="slider__item swiper-slide p-relative slider__height d-flex align-items-center z-index-1"
									style={{
										height: "85vh",
										minHeight: "85vh",
									}}
								>
									<div
										className="slider__bg slider__overlay include-bg"
										style={{
											background: `url(${imagemPrincipal})`,
											backgroundRepeat: "no-repeat",
											backgroundPosition: "center",
											backgroundSize: "cover",
										}}
									></div>
									<div className="container">
										<div className="row">
											<div className="col-xxl-7 col-xl-8 col-lg-8 col-md-10 col-sm-10">
												<div className="slider__content p-relative z-index-1">
													<span
														dangerouslySetInnerHTML={{
															__html:
																item.subtitulo ||
																"",
														}}
													></span>
													<h2
														className="slider__title"
														dangerouslySetInnerHTML={{
															__html: item.titulo,
														}}
													></h2>
													{item.conteudo && (
														<p
															dangerouslySetInnerHTML={{
																__html: item.conteudo,
															}}
														></p>
													)}
												</div>
											</div>
										</div>
									</div>
								</SwiperSlide>
							);
						})}
					</Swiper>

					<div className="main-slider-paginations">
						<button
							aria-label="Next slide"
							className="slider-button-next"
						>
							<i
								className="fa-regular fa-arrow-right"
								aria-hidden="true"
							></i>
						</button>
						<button
							aria-label="Previous slide"
							className="slider-button-prev"
						>
							<i
								className="fa-regular fa-arrow-left"
								aria-hidden="true"
							></i>
						</button>
					</div>
				</div>
			</section>
		</>
	);
};

export default HeroArea;
