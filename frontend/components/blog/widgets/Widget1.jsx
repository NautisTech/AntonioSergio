"use client";
import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import Image from "next/image";
import { useNews, useTags, useCategories } from "@/lib/api/public-content";

export default function Widget1({
	searchInputClass = "form-control input-md search-field input-circle",
}) {
	const { language } = useLanguage();
	const [searchQuery, setSearchQuery] = useState("");

	// Fetch data from API
	const { data: newsData, loading: newsLoading } = useNews({ pageSize: 6 });
	const { data: tagsData, loading: tagsLoading } = useTags();
	const { data: categoriesData, loading: categoriesLoading } =
		useCategories();

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

	// Get data with fallbacks
	const news = newsData?.data || [];
	const apiTags = tagsData || [];
	const apiCategories = categoriesData || [];

	// Extract unique tags and categories from fetched content
	const contentTags = new Map();
	const contentCategories = new Map();

	news.forEach(post => {
		if (post.tags && Array.isArray(post.tags)) {
			post.tags.forEach(tag => {
				if (!contentTags.has(tag.id)) {
					contentTags.set(tag.id, tag);
				}
			});
		}
		if (post.categories && Array.isArray(post.categories)) {
			post.categories.forEach(cat => {
				if (!contentCategories.has(cat.id)) {
					contentCategories.set(cat.id, cat);
				}
			});
		}
	});

	// Merge API data with content-extracted data (prioritize content data)
	const allTags = new Map(apiTags?.map(t => [t.id, t]) || []);
	contentTags.forEach((tag, id) => allTags.set(id, tag));
	const tags = Array.from(allTags.values());

	const allCategories = new Map(apiCategories?.map(c => [c.id, c]) || []);
	contentCategories.forEach((cat, id) => allCategories.set(id, cat));
	const categories = Array.from(allCategories.values());

	// Get latest 3 posts
	const latestPosts = news.slice(0, 3);

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
							{categories.map(category => (
								<li key={category.id}>
									<a
										href={`/blog?categoryId=${category.id}`}
										title=""
									>
										{category.name}
									</a>
									<small>
										{" "}
										- {category.contentCount || 0}{" "}
									</small>
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
							{tags.map(tag => (
								<a href={`/blog?tags=${tag.name}`} key={tag.id}>
									{tag.name}
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
