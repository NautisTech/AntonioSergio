import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Navigation, EffectFade } from "swiper/modules";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { stripHtml, plainTextTruncate } from "@/utils";
import { ConteudoResumo } from "@/lib/api/conteudos-public";

SwiperCore.use([Navigation]);

const Card = ({ evento }: { evento: ConteudoResumo }) => {
	const { t } = useTranslation("content");
	const title = (evento?.titulo ?? "") as string;
	const subtitleRaw = (evento?.subtitulo ?? "") as any;
	const subtitle = subtitleRaw ? stripHtml(String(subtitleRaw)) : "";
	const imagemPrincipal =
		evento.imagem_destaque || evento.anexos?.[0]?.caminho || "";

	return (
		<>
			<article
				className={`postbox__item format-image mb-50 transition-3`}
			>
				<div className="postbox__thumb w-img">
					<Link href={`/eventos/${evento?.slug}`}>
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
							{evento?.data_inicio && evento?.data_fim
								? `${new Date(
										evento.data_inicio
								  ).toLocaleString()} - ${new Date(
										evento.data_fim
								  ).toLocaleString()}`
								: evento?.data_inicio
								? new Date(evento.data_inicio).toLocaleString()
								: evento?.data_fim
								? new Date(evento.data_fim).toLocaleString()
								: t("card.invalid_date")}
						</span>
						<span>
							<a href={`/eventos/${evento?.slug}`}>
								<i className="far fa-user"></i>{" "}
								{evento?.autor_nome ?? t("card.unknown_author")}
							</a>
						</span>
						<span>
							<a href={`/eventos/${evento?.slug}`}>
								<i className="fal fa-comments"></i>{" "}
								{(() => {
									const count =
										evento?.comentarios?.length ?? 0;
									return t("card.comment", { count });
								})()}
							</a>
						</span>
					</div>
					<h3 className="postbox__title">
						<Link href={`/eventos/${evento?.slug}`}>
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
							<Link href={`/eventos/${evento?.slug}`}>
								{plainTextTruncate(subtitle, 60)}
							</Link>
						</h4>
					) : null}
					<div className="postbox__text">
						<p>
							{stripHtml(
								evento?.conteudo
									? evento.conteudo.length > 200
										? evento.conteudo.substring(0, 200) +
										  "..."
										: evento.conteudo
									: ""
							)}
						</p>
					</div>
					<div className="postbox__read-more">
						<Link
							href={`/eventos/${evento?.slug}`}
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
