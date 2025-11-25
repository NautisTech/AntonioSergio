"use client";
import { aesContent } from "@/data/aesContent";
import { useLanguage } from "@/context/LanguageContext";
import { useEntity, filterByEntity } from "@/context/EntityContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Blog() {
	const { language } = useLanguage();
	const { selectedEntity } = useEntity();
	const allBlogPosts = aesContent[language].blogPosts;

	// Filter blog posts by selected entity
	const blogPosts = filterByEntity(allBlogPosts, selectedEntity);

	const translations = {
		noResults: {
			pt: "Nenhuma notícia disponível para esta escola.",
			en: "No news available for this school.",
		},
	};

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
					key={post.slug}
					className="post-prev col-md-6 col-lg-4 mt-50 wow fadeInLeft"
					data-wow-delay={`${0.2 + i * 0.1}s`}
				>
					<div className="post-prev-container">
						<div
							className="post-prev-img"
							style={{ border: "1px solid #e0e0e0" }}
						>
							<Link href={`/blog/${post.slug}`}>
								<Image
									width={650}
									height={412}
									src={post.cover}
									alt={post.title}
								/>
							</Link>
						</div>
						<h4 className="post-prev-title">
							<Link href={`/blog/${post.slug}`}>
								{post.title}
							</Link>
						</h4>
						<div className="post-prev-text">{post.excerpt}</div>
						<div className="post-prev-info clearfix">
							<div className="float-start">
								<div className="d-inline-flex align-items-center gap-2">
									<Image
										className="post-prev-author-img"
										width={30}
										height={30}
										src={post.author.avatar}
										alt={post.author.name}
									/>
									<span>{post.author.name}</span>
								</div>
							</div>
							<div className="float-end">
								<span>
									{new Date(post.date).toLocaleDateString(
										language === "pt" ? "pt-PT" : "en-US"
									)}
								</span>
							</div>
						</div>
					</div>
				</div>
			))}
			{/* End Post Item */}
			{/* Post Item */}

			{/* End Post Item */}
		</div>
	);
}
