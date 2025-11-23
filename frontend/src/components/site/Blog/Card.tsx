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

const Card = ({ blog }: { blog: ConteudoResumo }) => {
	const { t } = useTranslation("content");
	const title = (blog?.titulo ?? "") as string;
	const subtitleRaw = (blog?.subtitulo ?? "") as any;
	const subtitle = subtitleRaw ? stripHtml(String(subtitleRaw)) : "";
	const imagemPrincipal =
		blog.imagem_destaque || blog.anexos?.[0]?.caminho || "";

	return (
		<>
			<article
				className={`postbox__item format-image mb-50 transition-3`}
			>
				<div className="postbox__thumb w-img">
					<Link href={`/blog/${blog?.slug}`}>
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
							{blog?.publicado_em
								? new Date(
										blog.publicado_em
								  ).toLocaleDateString()
								: t("card.invalid_date")}
						</span>
						<span>
							<a href={`/blog/${blog?.slug}`}>
								<i className="far fa-user"></i>{" "}
								{blog?.autor_nome ?? t("card.unknown_author")}
							</a>
						</span>
						<span>
							<a href={`/blog/${blog?.slug}`}>
								<i className="fal fa-comments"></i>{" "}
								{(() => {
									const count =
										blog?.comentarios?.length ?? 0;
									return t("card.comment", { count });
								})()}
							</a>
						</span>
					</div>
					<h3 className="postbox__title">
						<Link href={`/blog/${blog?.slug}`}>
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
							<Link href={`/blog/${blog?.slug}`}>
								{plainTextTruncate(subtitle, 60)}
							</Link>
						</h4>
					) : null}
					<div className="postbox__text">
						<p>
							{stripHtml(
								blog?.conteudo
									? blog.conteudo.length > 200
										? blog.conteudo.substring(0, 200) +
										  "..."
										: blog.conteudo
									: ""
							)}
						</p>
					</div>
					<div className="postbox__read-more">
						<Link href={`/blog/${blog?.slug}`} className="tp-btn">
							{t("card.read_more")}
						</Link>
					</div>
				</div>
			</article>
		</>
	);
};

export default Card;
