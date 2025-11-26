"use client";
import React, { useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import Image from "next/image";

export default function Widget1({
	searchInputClass = "form-control input-md search-field input-circle",
	allNews = [],
	filteredNews = [],
	searchQuery = "",
	setSearchQuery = () => {},
	selectedCategory = null,
	setSelectedCategory = () => {},
	selectedTag = null,
	setSelectedTag = () => {},
}) {
	const { language } = useLanguage();

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
		all: {
			pt: "Todas",
			en: "All",
		},
	};

	// Calculate categories with counts from ALL news (not filtered)
	const categories = useMemo(() => {
		const categoryMap = new Map();

		allNews.forEach(post => {
			if (post.categories && Array.isArray(post.categories)) {
				post.categories.forEach(cat => {
					if (!categoryMap.has(cat.id)) {
						categoryMap.set(cat.id, {
							...cat,
							count: 0,
						});
					}
					const existing = categoryMap.get(cat.id);
					existing.count += 1;
				});
			}
		});

		return Array.from(categoryMap.values())
			.filter(cat => cat.count > 0)
			.sort((a, b) => b.count - a.count);
	}, [allNews]);

	// Calculate tags with counts from ALL news (not filtered)
	const tags = useMemo(() => {
		const tagMap = new Map();

		allNews.forEach(post => {
			if (post.tags && Array.isArray(post.tags)) {
				post.tags.forEach(tag => {
					if (!tagMap.has(tag.name)) {
						tagMap.set(tag.name, {
							...tag,
							count: 0,
						});
					}
					const existing = tagMap.get(tag.name);
					existing.count += 1;
				});
			}
		});

		return Array.from(tagMap.values())
			.filter(tag => tag.count > 0)
			.sort((a, b) => b.count - a.count);
	}, [allNews]);

	// Get latest 3 posts from FILTERED results
	const latestPosts = filteredNews.slice(0, 3);

	const handleSubmit = e => {
		e.preventDefault();
		// Search is handled by state change
	};

	return (
		<>
			{/* Search Widget */}
			<div className="widget">
				<form onSubmit={handleSubmit} className="form">
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
							<li>
								<a
									href="#"
									onClick={e => {
										e.preventDefault();
										setSelectedCategory(null);
									}}
									style={{
										fontWeight:
											selectedCategory === null
												? "bold"
												: "normal",
									}}
								>
									{translations.all[language]}
								</a>
							</li>
							{categories.map(category => (
								<li key={category.id}>
									<a
										href="#"
										onClick={e => {
											e.preventDefault();
											setSelectedCategory(category.id);
										}}
										style={{
											fontWeight:
												selectedCategory === category.id
													? "bold"
													: "normal",
										}}
									>
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
			{tags.length > 0 && (
				<div className="widget">
					<h3 className="widget-title">
						{translations.tags[language]}
					</h3>
					<div className="widget-body">
						<div className="tags">
							<a
								href="#"
								onClick={e => {
									e.preventDefault();
									setSelectedTag(null);
								}}
								style={{
									fontWeight:
										selectedTag === null ? "bold" : "normal",
								}}
							>
								{translations.all[language]}
							</a>
							{tags.map(tag => (
								<a
									href="#"
									onClick={e => {
										e.preventDefault();
										setSelectedTag(tag.name);
									}}
									key={tag.id}
									style={{
										fontWeight:
											selectedTag === tag.name
												? "bold"
												: "normal",
									}}
								>
									{tag.name} ({tag.count})
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
							{latestPosts.map(post => (
								<li key={post.id} className="clearfix">
									<Link href={`/blog/${post.slug}`}>
										{post.featured_image && (
											<Image
												src={post.featured_image}
												height={140}
												width={100}
												alt={post.title}
												className="widget-posts-img"
												style={{
													height: "fit-content",
												}}
											/>
										)}
									</Link>
									<div className="widget-posts-descr">
										<Link
											href={`/blog/${post.slug}`}
											title=""
										>
											{post.title}
										</Link>
										<span>
											{translations.postedBy[language]}{" "}
											{post.author_name || "Anonymous"}
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
