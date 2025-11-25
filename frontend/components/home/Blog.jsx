"use client";
import { useNews } from "@/lib/api/public-content";
import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Blog() {
	const { language } = useLanguage();

	// Fetch news from API - featured and limited to 6 items
	// Language is automatically injected from context
	const { data, loading, error } = useNews({
		featuredOnly: true,
		pageSize: 6,
	});

	const translations = {
		noResults: {
			pt: "Nenhuma notícia disponível para esta escola.",
			en: "No news available for this school.",
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

	if (loading) {
		return (
			<div className="row mt-n50">
				<div className="col-12 text-center">
					<p className="text-gray">{translations.loading[language]}</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="row mt-n50">
				<div className="col-12 text-center">
					<p className="text-gray">{translations.error[language]}</p>
				</div>
			</div>
		);
	}

	const blogPosts = data?.data || [];

	if (blogPosts.length === 0) {
		return (
			<div className="row mt-n50">
				<div className="col-12 text-center">
					<p className="text-gray">{translations.noResults[language]}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="row mt-n50">
			{/* Post Item */}
			{blogPosts.map((post, i) => (
				<div
					key={post.id}
					className="post-prev col-md-6 col-lg-4 mt-50 wow fadeInLeft"
					data-wow-delay={`${0.2 + i * 0.1}s`}
				>
					<div className="post-prev-container">
						{post.featured_image && (
							<div
								className="post-prev-img"
								style={{ border: "1px solid #e0e0e0" }}
							>
								<Link href={`/blog/${post.slug}`}>
									<Image
										width={650}
										height={412}
										src={post.featured_image}
										alt={post.title}
									/>
								</Link>
							</div>
						)}
						<h4 className="post-prev-title">
							<Link href={`/blog/${post.slug}`}>{post.title}</Link>
						</h4>
						<div className="post-prev-text">{post.excerpt}</div>
						<div className="post-prev-info clearfix">
							<div className="float-start">
								<div className="d-inline-flex align-items-center gap-2">
									{post.author_name && <span>{post.author_name}</span>}
								</div>
							</div>
							<div className="float-end">
								<span>
									{post.published_at &&
										new Date(post.published_at).toLocaleDateString(
											language === "pt" ? "pt-PT" : "en-US"
										)}
								</span>
							</div>
						</div>
					</div>
				</div>
			))}
			{/* End Post Item */}
		</div>
	);
}
