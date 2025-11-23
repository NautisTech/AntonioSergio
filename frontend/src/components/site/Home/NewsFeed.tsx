"use client";

import { useMemo } from "react";
import { useEntidadeContext, useLanguageContext } from "@/context";
import {
	formatLanguageCode,
	useConteudosDestaque,
} from "@/lib/api/conteudos-public";
import Link from "next/link";

const NewsFeed = () => {
	const { selectedLanguage } = useLanguageContext();
	const { selectedEntidade } = useEntidadeContext();
	const idioma = formatLanguageCode(selectedLanguage);

	// Build base filters for destaque and optional entidade custom field
	const filtrosBase = useMemo(() => {
		const base: any = {
			destaque: true,
			pageSize: 5,
		};

		if (selectedEntidade?.value) {
			base.camposPersonalizados = [
				{ codigo: "entidades", valor: selectedEntidade.value },
			];
		}

		return base;
	}, [selectedEntidade?.value]);

	const tipoEventos = 16;
	const tipoProjetos = 20;
	const tipoNoticias = 21;

	// Fetch destaque items for each main type using useConteudosDestaque
	const eventos =
		useConteudosDestaque(
			idioma,
			filtrosBase.pageSize ?? 5,
			tipoEventos,
			filtrosBase
		).data ?? [];
	const projetos =
		useConteudosDestaque(
			idioma,
			filtrosBase.pageSize ?? 5,
			tipoProjetos,
			filtrosBase
		).data ?? [];
	const noticias =
		useConteudosDestaque(
			idioma,
			filtrosBase.pageSize ?? 5,
			tipoNoticias,
			filtrosBase
		).data ?? [];

	const conteudos = useMemo(() => {
		const all = [...eventos, ...projetos, ...noticias];
		const map = new Map<number, (typeof all)[0]>();
		for (const item of all) {
			if (!map.has(item.id)) map.set(item.id, item);
		}
		return Array.from(map.values());
	}, [eventos, projetos, noticias]);

	return (
		<div className="news-feed">
			<div className="news-feed__track">
				{/* Render items multiple times for seamless infinite loop */}
				{conteudos.length > 0 &&
					[
						...conteudos,
						...conteudos,
						...conteudos,
						...conteudos,
					].map((item, index) => {
						let prefix = `/conteudos`;
						let emoji = "📰";
						switch (item.tipo_conteudo_id) {
							case 16:
								prefix = `/blog`;
								emoji = "📰";
								break;
							case 20:
								prefix = `/eventos`;
								emoji = "📅";
								break;
							case 21:
								prefix = `/projetos`;
								emoji = "🛠️";
								break;
						}

						return (
							<Link
								key={`${item.id}-${index}`}
								href={`${prefix}/${item.slug}`}
								className="news-feed__item"
							>
								<span className="news-feed__icon">{emoji}</span>
								<span className="news-feed__title">
									{item.titulo}
								</span>
								<span className="news-feed__separator">•</span>
							</Link>
						);
					})}
			</div>
		</div>
	);
};

export default NewsFeed;
