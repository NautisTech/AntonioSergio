"use client";
import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { aesContent } from "@/data/aesContent";
import Link from "next/link";
import Image from "next/image";

export default function Widget1({
	searchInputClass = "form-control input-md search-field input-circle",
}) {
	const { language } = useLanguage();
	const content = aesContent[language];
	const blogPosts = content.blogPosts || [];
	const [searchQuery, setSearchQuery] = useState("");

	const translations = {
		search: {
			pt: "Pesquisar...",
			en: "Search...",
		},
		categories: {
			pt: "Categorias",
			en: "Categories",
		},
		tags: {
			pt: "Tags",
			en: "Tags",
		},
		latestPosts: {
			pt: "Últimas Notícias",
			en: "Latest Posts",
		},
		postedBy: {
			pt: "Por",
			en: "Posted by",
		},
	};

	// Extract unique categories from blog posts
	const categories = [
		...new Set(blogPosts.map(post => post.category)),
	].map(category => ({
		name: category,
		count: blogPosts.filter(post => post.category === category).length,
	}));

	// Extract unique tags from blog posts
	const allTags = blogPosts.flatMap(post => post.tags || []);
	const uniqueTags = [...new Set(allTags)];

	// Get latest 3 posts
	const latestPosts = blogPosts.slice(0, 3);

	return (
		<>
			{/* Search Widget */}
			<div className="widget">
				<form
					onSubmit={e => {
						e.preventDefault();
						// Handle search functionality
					}}
					className="form"
				>
					<div className="search-wrap">
						<button
							className="search-button animate"
							type="submit"
							title={
								language === "pt"
									? "Iniciar pesquisa"
									: "Start Search"
							}
						>
							<i className="mi-search size-18" />
							<span className="visually-hidden">
								{language === "pt"
									? "Iniciar pesquisa"
									: "Start search"}
							</span>
						</button>
						<input
							type="text"
							className={searchInputClass}
							placeholder={translations.search[language]}
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
						/>
					</div>
				</form>
			</div>
			{/* End Search Widget */}

			{/* Categories Widget */}
			{categories.length > 0 && (
				<div className="widget">
					<h3 className="widget-title">
						{translations.categories[language]}
					</h3>
					<div className="widget-body">
						<ul className="clearlist widget-menu">
							{categories.map((category, index) => (
								<li key={index}>
									<a href="#" title="">
										{category.name}
									</a>
									<small> - {category.count} </small>
								</li>
							))}
						</ul>
					</div>
				</div>
			)}
			{/* End Widget */}

			{/* Tags Widget */}
			{uniqueTags.length > 0 && (
				<div className="widget">
					<h3 className="widget-title">{translations.tags[language]}</h3>
					<div className="widget-body">
						<div className="tags">
							{uniqueTags.map((tag, index) => (
								<a href="#" key={index}>
									{tag}
								</a>
							))}
						</div>
					</div>
				</div>
			)}
			{/* End Widget */}

			{/* Latest Posts Widget */}
			{latestPosts.length > 0 && (
				<div className="widget">
					<h3 className="widget-title">
						{translations.latestPosts[language]}
					</h3>
					<div className="widget-body">
						<ul className="clearlist widget-posts">
							{latestPosts.map((post, index) => (
								<li key={index} className="clearfix">
									<Link href={`/blog/${post.slug}`}>
										<Image
											src={post.cover}
											height={140}
											width={100}
											alt={post.title}
											className="widget-posts-img"
											style={{ height: "fit-content" }}
										/>
									</Link>
									<div className="widget-posts-descr">
										<Link href={`/blog/${post.slug}`} title="">
											{post.title}
										</Link>
										<span>
											{translations.postedBy[language]}{" "}
											{post.author.name}
										</span>
									</div>
								</li>
							))}
						</ul>
					</div>
				</div>
			)}
			{/* End Widget */}
		</>
	);
}
