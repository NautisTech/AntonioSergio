"use client";
import { use, useState, useEffect } from "react";
import Footer1 from "@/components/footers/Footer1";
import ParallaxContainer from "@/components/common/ParallaxContainer";
import Header from "@/components/site/Header";
import AnimatedText from "@/components/common/AnimatedText";
import Widget1 from "@/components/blog/widgets/Widget1";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useContentBySlug, useNews, useComments } from "@/lib/api/public-content";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useMemo } from "react";
import Comments from "@/components/blog/Comments";
import Form1 from "@/components/blog/commentForm/Form1";

export default function BlogDetailPage({ params }) {
	const unwrappedParams = use(params);
	const { language } = useLanguage();
	const { theme } = useTheme();
	const isDark = theme === "dark";

	// Fetch blog post by slug
	const {
		data: blog,
		loading: blogLoading,
		error: blogError,
	} = useContentBySlug(unwrappedParams.slug);

	// Re-initialize WOW animations when blog loads
	useEffect(() => {
		if (blog && typeof window !== "undefined") {
			try {
				const { WOW } = require("wowjs");
				const wow = new WOW({
					boxClass: "wow",
					animateClass: "animated",
					offset: 0,
					mobile: true,
					live: false,
				});
				wow.init();
			} catch (e) {
				console.error("Error initializing WOW:", e);
			}
		}
	}, [blog]);

	// Fetch all news for prev/next navigation and sidebar
	const { data: newsData } = useNews({ pageSize: 999 });
	const allNews = newsData?.data || [];

	// Fetch comments for this blog post
	const {
		data: comments,
		loading: commentsLoading,
		refetch: refetchComments,
	} = useComments(blog?.id || null);

	// State for sidebar filters
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [selectedTag, setSelectedTag] = useState(null);

	// Client-side filtering for sidebar
	const filteredNews = useMemo(() => {
		let filtered = [...allNews];

		// Filter by category
		if (selectedCategory) {
			filtered = filtered.filter(post =>
				post.categories?.some(cat => cat.id === selectedCategory)
			);
		}

		// Filter by tag
		if (selectedTag) {
			filtered = filtered.filter(post =>
				post.tags?.some(tag => tag.name === selectedTag)
			);
		}

		// Filter by search
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(post => {
				const title = (post.title || "").toLowerCase();
				const excerpt = (post.excerpt || "").toLowerCase();
				const content = (post.content || "").toLowerCase();
				return (
					title.includes(query) ||
					excerpt.includes(query) ||
					content.includes(query)
				);
			});
		}

		return filtered;
	}, [allNews, selectedCategory, selectedTag, searchQuery]);

	if (blogError) {
		notFound();
	}

	if (blogLoading) {
		return (
			<div className="theme-main">
				<div className={isDark ? "dark-mode" : ""}>
					<div
						className={`page ${isDark ? "bg-dark-1" : ""}`}
						id="top"
					>
						<nav
							className={`main-nav transparent stick-fixed wow-menubar ${
								isDark ? "dark dark-mode" : ""
							}`}
						>
							<Header />
						</nav>
						<main id="main">
							<div className="container pt-50 pb-50 text-center">
								<p>
									{language === "pt"
										? "Carregando..."
										: "Loading..."}
								</p>
							</div>
						</main>
					</div>
				</div>
			</div>
		);
	}

	if (!blog) {
		notFound();
	}

	const translations = {
		backToBlog: {
			pt: "Voltar ao blog",
			en: "Back to blog",
		},
		prevPost: {
			pt: "Artigo anterior",
			en: "Prev post",
		},
		nextPost: {
			pt: "Próximo artigo",
			en: "Next post",
		},
		readingTime: {
			pt: "Tempo de leitura",
			en: "Reading time",
		},
		comments: {
			pt: "Comentários",
			en: "Comments",
		},
		comment: {
			pt: "Comentário",
			en: "Comment",
		},
		leaveComment: {
			pt: "Deixe um comentário",
			en: "Leave a comment",
		},
		noComments: {
			pt: "Ainda não há comentários. Seja o primeiro!",
			en: "No comments yet. Be the first!",
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

	// Find previous and next posts from API data
	const currentIndex = allNews.findIndex(
		post => post.slug === unwrappedParams.slug
	);
	const prevPost = currentIndex > 0 ? allNews[currentIndex - 1] : null;
	const nextPost =
		currentIndex < allNews.length - 1 ? allNews[currentIndex + 1] : null;

	return (
		<>
			<div className="theme-main">
				<div className={isDark ? "dark-mode" : ""}>
					<div
						className={`page ${isDark ? "bg-dark-1" : ""}`}
						id="top"
					>
						<nav
							className={`main-nav transparent stick-fixed wow-menubar ${
								isDark ? "dark dark-mode" : ""
							}`}
						>
							<Header />
						</nav>
						<section className="page-section pt-0 pb-0" id="home">
							<ParallaxContainer
								className="page-section bg-dark-1 bg-dark-alpha-90 parallax-5 light-content"
								style={{
									backgroundImage:
										"url(/assets/school/campus/campus-2.jpg)",
								}}
							>
								<div className="container position-relative pt-30 pt-sm-50">
									{/* Section Content */}
									<div className="text-center">
										<div className="row">
											{/* Page Title */}
											<div className="col-md-8 offset-md-2">
												<div className="mb-20">
													<Link
														href="/blog"
														className="btn btn-mod btn-small btn-border-w btn-circle"
														data-btn-animate="y"
													>
														<i className="mi-arrow-left align-center size-18" />{" "}
														{
															translations
																.backToBlog[
																language
															]
														}
													</Link>
												</div>
												<h1 className="hs-title-1 mb-20">
													<AnimatedText
														text={blog.title}
													/>
												</h1>

												{/* Author, Date, Category */}
												<div
													className="blog-item-data mt-30 mt-sm-10 mb-0 wow fadeInUp"
													data-wow-delay="0.2s"
												>
													{blog.published_at && (
														<div className="d-inline-block me-3">
															<i className="mi-clock size-16" />
															<span className="visually-hidden">
																{language ===
																"pt"
																	? "Data:"
																	: "Date:"}
															</span>{" "}
															{formatDate(
																blog.published_at
															)}
														</div>
													)}
													{blog.author_name && (
														<div className="d-inline-block me-3">
															<i className="mi-user size-16" />
															<span className="visually-hidden">
																{language ===
																"pt"
																	? "Autor:"
																	: "Author:"}
															</span>{" "}
															{blog.author_name}
														</div>
													)}
													{blog.categories &&
														blog.categories.length >
															0 && (
															<div className="d-inline-block me-3">
																<i className="mi-folder size-16" />
																<span className="visually-hidden">
																	{language ===
																	"pt"
																		? "Categoria:"
																		: "Category:"}
																</span>
																<span>
																	{" "}
																	{blog
																		.categories[0]
																		?.name ||
																		"—"}
																</span>
															</div>
														)}
													{blog.tags &&
														blog.tags.length >
															0 && (
															<div className="d-inline-block me-3">
																<i className="mi-tag size-16" />
																<span className="visually-hidden">
																	{language ===
																	"pt"
																		? "Tags:"
																		: "Tags:"}
																</span>
																<span>
																	{" "}
																	{blog.tags
																		.map(
																			t =>
																				t.name
																		)
																		.join(
																			", "
																		)}
																</span>
															</div>
														)}
												</div>
											</div>
											{/* End Page Title */}
										</div>
									</div>
									{/* End Section Content */}
								</div>
							</ParallaxContainer>
						</section>
						<main id="main">
							{/* Section */}
							<section
								className={`page-section ${
									isDark ? "bg-dark-1 light-content" : ""
								}`}
							>
								<div className="container relative">
									<div className="row">
										{/* Content */}
										<div className="col-md-8 mb-sm-80">
											{/* Post */}
											<div className="blog-item mb-80 mb-xs-40">
												<div className="blog-item-body">
													{/* Image */}
													{blog.featured_image && (
														<div className="blog-media mb-40 mb-xs-30">
															<Image
																src={
																	blog.featured_image
																}
																width={1350}
																height={865}
																alt={blog.title}
															/>
														</div>
													)}

													{/* Content */}
													<div
														dangerouslySetInnerHTML={{
															__html: blog.content,
														}}
													/>
												</div>
											</div>
											{/* End Post */}

											{/* Comments Section */}
											<div className="mb-80 mb-xs-40">
												<h4
													className={`blog-page-title ${isDark ? "text-white" : ""}`}
												>
													{comments && comments.length > 0
														? `${comments.length} ${comments.length === 1 ? translations.comment[language] : translations.comments[language]}`
														: translations.noComments[language]}
												</h4>
												{commentsLoading ? (
													<div className="text-center py-4">
														<p className={isDark ? "text-gray" : ""}>
															{language === "pt"
																? "Carregando comentários..."
																: "Loading comments..."}
														</p>
													</div>
												) : (
													<Comments
														comments={comments || []}
														language={language}
														isDark={isDark}
													/>
												)}
											</div>
											{/* End Comments */}

											{/* Comment Form */}
											{blog?.allow_comments !== false && (
												<div className="mb-80 mb-xs-40">
													<h4
														className={`blog-page-title ${isDark ? "text-white" : ""}`}
													>
														{translations.leaveComment[language]}
													</h4>
													<Form1
														contentId={blog?.id}
														language={language}
														isDark={isDark}
														onSuccess={() => {
															refetchComments();
														}}
													/>
												</div>
											)}
											{/* End Comment Form */}

											{/* Prev/Next Post */}
											<div className="clearfix mt-40">
												{prevPost && (
													<Link
														href={`/blog/${prevPost.slug}`}
														className="blog-item-more left"
													>
														<i className="mi-chevron-left" />
														&nbsp;
														{
															translations
																.prevPost[
																language
															]
														}
													</Link>
												)}
												{nextPost && (
													<Link
														href={`/blog/${nextPost.slug}`}
														className="blog-item-more right"
													>
														{
															translations
																.nextPost[
																language
															]
														}
														&nbsp;
														<i className="mi-chevron-right" />
													</Link>
												)}
											</div>
										</div>
										{/* End Content */}

										{/* Sidebar */}
										<div className="col-md-4 col-lg-3 offset-lg-1">
											<Widget1
												searchInputClass="form-control input-lg search-field round"
												allNews={allNews}
												filteredNews={filteredNews}
												searchQuery={searchQuery}
												setSearchQuery={setSearchQuery}
												selectedCategory={
													selectedCategory
												}
												setSelectedCategory={
													setSelectedCategory
												}
												selectedTag={selectedTag}
												setSelectedTag={setSelectedTag}
											/>
										</div>
										{/* End Sidebar */}
									</div>
								</div>
							</section>
							{/* End Section */}
						</main>
						<Footer1 dark={isDark} />
					</div>
				</div>
			</div>
		</>
	);
}
