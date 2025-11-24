"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { aesContent } from "@/data/aesContent";

export default function Content1() {
	const { language } = useLanguage();
	const content = aesContent[language];
	const blogPosts = content.blogPosts || [];

	const translations = {
		readMore: {
			pt: "Ler Mais",
			en: "Read More",
		},
		comments: {
			pt: "Comentários",
			en: "Comments",
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

	return (
		<>
			{blogPosts.map((post, index) => (
				<div
					key={post.slug || index}
					className="blog-item box-shadow round p-4 p-md-5"
				>
					{/* Post Title */}
					<h2 className="blog-item-title">
						<Link href={`/blog/${post.slug}`}>{post.title}</Link>
					</h2>

					{/* Author, Date, Category */}
					<div className="blog-item-data">
						<a href="#">
							<i className="mi-clock size-16" /> {formatDate(post.date)}
						</a>
						<span className="separator">&nbsp;</span>
						<a href="#">
							<i className="mi-user size-16" /> {post.author.name}
						</a>
						<span className="separator">&nbsp;</span>
						<i className="mi-folder size-16" />
						<span>{post.category}</span>
					</div>

					{/* Image */}
					{post.cover && (
						<div className="blog-media">
							<Link href={`/blog/${post.slug}`}>
								<Image
									src={post.cover}
									width={1350}
									height={865}
									alt={post.title}
									style={{
										width: "100%",
										height: "auto",
										objectFit: "cover",
									}}
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
