"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function Content1({
	posts = [],
	loading = false,
	error = null,
	filteredCount = 0,
	totalCount = 0,
}) {
	const { language } = useLanguage();

	const translations = {
		readMore: {
			pt: "Ler Mais",
			en: "Read More",
		},
		comments: {
			pt: "Comentários",
			en: "Comments",
		},
		noResults: {
			pt: "Nenhuma notícia disponível.",
			en: "No news available.",
		},
		noFilterResults: {
			pt: "Nenhuma notícia encontrada com os filtros aplicados.",
			en: "No news found with the applied filters.",
		},
		loading: {
			pt: "Carregando notícias...",
			en: "Loading news...",
		},
		error: {
			pt: "Erro ao carregar notícias.",
			en: "Error loading news.",
		},
	};

	const formatDate = dateString => {
		const date = new Date(dateString);
		if (language === "pt") {
			return date.toLocaleDateString("pt-PT", {
				year: "numeric",
				month: "long",
				day: "numeric",
			});
		}
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	if (loading) {
		return (
			<div className="text-center py-5">
				<p className="text-gray">{translations.loading[language]}</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center py-5">
				<p className="text-gray">{translations.error[language]}</p>
			</div>
		);
	}

	if (posts.length === 0) {
		return (
			<div className="text-center py-5">
				<p className="text-gray">
					{totalCount === 0
						? translations.noResults[language]
						: translations.noFilterResults[language]}
				</p>
			</div>
		);
	}

	return (
		<>
			{posts.map((post, index) => (
				<div
					key={post.id || index}
					className="blog-item box-shadow round p-4 p-md-5"
				>
					{/* Post Title */}
					<h2 className="blog-item-title">
						<Link href={`/blog/${post.slug}`}>{post.title}</Link>
					</h2>

					{/* Author, Date, Category */}
					<div className="blog-item-data">
						{post.published_at && (
							<>
								<a href="#">
									<i className="mi-clock size-16" />{" "}
									{formatDate(post.published_at)}
								</a>
								<span className="separator">&nbsp;</span>
							</>
						)}
						{post.author_name && (
							<>
								<a href="#">
									<i className="mi-user size-16" /> {post.author_name}
								</a>
								<span className="separator">&nbsp;</span>
							</>
						)}
						{post.categories && post.categories.length > 0 && (
							<>
								<i className="mi-folder size-16" />
								<span>{post.categories[0].name}</span>
							</>
						)}
					</div>

					{/* Image */}
					{post.featured_image && (
						<div className="blog-media">
							<Link href={`/blog/${post.slug}`}>
								<Image
									src={post.featured_image}
									width={1350}
									height={865}
									alt={post.title}
								/>
							</Link>
						</div>
					)}

					{/* Text Intro */}
					<div className="mb-30">
						<p className="mb-0">{post.excerpt}</p>
					</div>

					{/* Read More Link */}
					<div className="blog-item-foot">
						<Link
							href={`/blog/${post.slug}`}
							className="btn btn-mod btn-round btn-medium btn-gray"
						>
							{translations.readMore[language]}
						</Link>
					</div>
				</div>
			))}
		</>
	);
}
