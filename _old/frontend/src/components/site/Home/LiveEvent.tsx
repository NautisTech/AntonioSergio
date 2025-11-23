"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useEntidadeContext, useLanguageContext } from "@/context";
import {
	Anexo,
	formatLanguageCode,
	useConteudos,
	TipoAnexo,
	getYouTubeEmbedUrl,
	isYouTubeUrl,
	ConteudoResumo,
} from "@/lib/api/conteudos-public";
import { useTranslation } from "react-i18next";

const LiveEventSkeleton = () => {
	return (
		<div className="live-event__skeleton">
			<div className="skeleton-content">
				<div className="skeleton-line title"></div>
				<div className="skeleton-video"></div>
			</div>
		</div>
	);
};

/**
 * Verifica se um evento está ativo baseado na data_fim
 */
const isEventActive = (evento: ConteudoResumo): boolean => {
	if (!evento.data_fim) return false;
	const now = new Date();
	const endDate = new Date(evento.data_fim);
	return now <= endDate;
};

/**
 * Encontra a URL do YouTube em anexos ou imagem_destaque
 * Verifica primeiro anexos com tipo youtube, depois qualquer anexo com URL do YouTube
 * e por último a imagem_destaque
 */
const findYouTubeUrl = (evento: ConteudoResumo): string | null => {
	// 1. Verificar anexos com tipo youtube
	const youtubeAnexo = evento.anexos?.find(
		(anexo: Anexo) => anexo.tipo === TipoAnexo.YOUTUBE_URL
	);
	if (youtubeAnexo?.caminho && isYouTubeUrl(youtubeAnexo.caminho)) {
		return youtubeAnexo.caminho;
	}

	// 2. Verificar outros anexos que possam ter URL do YouTube no campo url ou caminho
	const anexoComYouTube = evento.anexos?.find((anexo: Anexo) => {
		const urlToCheck = anexo.caminho || anexo.url;
		return urlToCheck && isYouTubeUrl(urlToCheck);
	});
	if (anexoComYouTube) {
		return anexoComYouTube.caminho || anexoComYouTube.url;
	}

	// 3. Verificar imagem_destaque
	if (evento.imagem_destaque && isYouTubeUrl(evento.imagem_destaque)) {
		return evento.imagem_destaque;
	}

	return null;
};

const LiveEvent = () => {
	const { t } = useTranslation("home");

	const { selectedEntidade } = useEntidadeContext();
	const { selectedLanguage } = useLanguageContext();
	const idioma = formatLanguageCode(selectedLanguage);

	const eventoFiltros = useMemo(() => {
		const baseFilters: any = { tipoConteudoId: 20 };

		if (selectedEntidade?.value) {
			baseFilters.campoCodigo = "entidades";
			baseFilters.campoValor = selectedEntidade.value;
		}

		return baseFilters;
	}, [selectedEntidade?.value]);

	const { data: eventosData, isLoading } = useConteudos(
		idioma,
		eventoFiltros
	);
	const eventos = eventosData?.data;

	// Encontrar evento ativo com live stream
	const activeEventWithStream = useMemo(() => {
		if (!eventos) return null;

		return eventos.find((evento: ConteudoResumo) => {
			if (!isEventActive(evento)) return false;
			const streamUrl = findYouTubeUrl(evento);
			return !!streamUrl;
		});
	}, [eventos]);

	// Se não há evento ativo com stream, não renderiza nada
	if (isLoading) {
		return null;
	}

	if (!activeEventWithStream) {
		return null;
	}

	const streamUrl = findYouTubeUrl(activeEventWithStream);
	const embedUrl = streamUrl
		? getYouTubeEmbedUrl(streamUrl, true, true, false)
		: null;

	if (!embedUrl || !streamUrl) {
		return null;
	}

	return (
		<section className="live-event__area pt-120 pb-120">
			<div className="container">
				<div className="row">
					<div className="col-12">
						<div className="live-event__wrapper">
							{activeEventWithStream.titulo && (
								<div className="live-event__header mb-40 text-center">
									<h2 className="live-event__title">
										{activeEventWithStream.titulo}
									</h2>
									{activeEventWithStream.subtitulo && (
										<p className="live-event__subtitle">
											{activeEventWithStream.subtitulo}
										</p>
									)}
								</div>
							)}

							<div className="live-event__video-wrapper">
								<div className="live-event__video-container">
									<iframe
										src={embedUrl}
										title={
											activeEventWithStream.titulo ||
											"Live Stream"
										}
										frameBorder="0"
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
										allowFullScreen
									></iframe>
								</div>
							</div>

							{activeEventWithStream.conteudo && (
								<div
									className="live-event__description mt-40 text-center"
									dangerouslySetInnerHTML={{
										__html: activeEventWithStream.conteudo,
									}}
								></div>
							)}

							<div className="live-event__button-wrapper text-center mt-30">
								<Link
									href={streamUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="tp-btn tp-btn-crimson"
								>
									{t("see_event")}
									<i className="fa-regular fa-arrow-right ml-10"></i>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default LiveEvent;
