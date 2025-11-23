import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Navigation, EffectFade } from "swiper/modules";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { stripHtml, plainTextTruncate } from "@/utils";
import { ConteudoResumo } from "@/lib/api/conteudos-public";

// Swiper exposes a use function but it's not a React Hook; disable the rules-of-hooks warning here
// eslint-disable-next-line react-hooks/rules-of-hooks
SwiperCore.use([Navigation]);

const Card = ({ projeto }: { projeto: ConteudoResumo }) => {
	const { t } = useTranslation("content");
	const title = (projeto?.titulo ?? "") as string;
	const subtitleRaw = (projeto?.subtitulo ?? "") as any;
	const subtitle = subtitleRaw ? stripHtml(String(subtitleRaw)) : "";
	const imagemPrincipal =
		projeto.imagem_destaque ||
		projeto.anexos?.[0]?.caminho ||
		"/images/OCUj9MbhJ73rmpYYrHnLgb7sc.jpg";

	return (
		<>
			<article
				className={`postbox__item format-image mb-50 transition-3`}
			>
				<div className="postbox__thumb w-img">
					<Link href={`/projetos/${projeto?.slug}`}>
						<img
							src={imagemPrincipal}
							alt={title}
							style={{
								width: "100%",
								maxHeight: 360,
								objectFit: "cover",
							}}
						/>
					</Link>
				</div>

				<div className="postbox__content">
					<div className="postbox__meta">
						<span>
							<i className="far fa-calendar-check"></i>{" "}
							{projeto?.publicado_em
								? new Date(
										projeto.publicado_em
								  ).toLocaleDateString()
								: t("card.invalid_date")}
						</span>
						<span>
							<a href={`/projetos/${projeto?.slug}`}>
								<i className="far fa-user"></i>{" "}
								{projeto?.autor_nome ??
									t("card.unknown_author")}
							</a>
						</span>
						<span>
							<a href={`/projetos/${projeto?.slug}`}>
								<i className="fal fa-comments"></i>{" "}
								{(() => {
									const count =
										projeto?.comentarios?.length ?? 0;
									return t("card.comment", { count });
								})()}
							</a>
						</span>
					</div>
					<h3 className="postbox__title">
						<Link href={`/projetos/${projeto?.slug}`}>
							{plainTextTruncate(title, 60)}
						</Link>
					</h3>
					{subtitle ? (
						<h4
							className="postbox__subtitle"
							style={{
								fontSize: "0.95rem",
								marginTop: "0.25rem",
								fontWeight: 500,
								color: "#666",
							}}
						>
							<Link href={`/projetos/${projeto?.slug}`}>
								{plainTextTruncate(subtitle, 60)}
							</Link>
						</h4>
					) : null}
					<div className="postbox__text">
						<p>
							{stripHtml(
								projeto?.conteudo
									? projeto.conteudo.length > 200
										? projeto.conteudo.substring(0, 200) +
										  "..."
										: projeto.conteudo
									: ""
							)}
						</p>
					</div>
					<div className="postbox__read-more">
						<Link
							href={`/projetos/${projeto?.slug}`}
							className="tp-btn"
						>
							{t("card.read_more")}
						</Link>
					</div>
				</div>
			</article>
		</>
	);
};

export default Card;
