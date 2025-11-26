"use client";
import { useState, useMemo } from "react";
import Footer1 from "@/components/footers/Footer1";
import ParallaxContainer from "@/components/common/ParallaxContainer";
import Header from "@/components/site/Header";
import AnimatedText from "@/components/common/AnimatedText";
import Widget1 from "@/components/blog/widgets/Widget1";
import Pagination from "@/components/common/Pagination";
import Content1 from "@/components/blog/content/Content1";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useNews } from "@/lib/api/public-content";
import { pageTranslations } from "@/data/aesContent";

export default function BlogPage() {
	const { language } = useLanguage();
	const { theme } = useTheme();
	const pageContent = pageTranslations.blog;
	const isDark = theme === "dark";

	// Fetch ALL news once (no filters, except language which is auto-applied)
	const { data, loading, error } = useNews({
		pageSize: 999, // Get all
	});

	// Client-side filter states
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [selectedTag, setSelectedTag] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 12;

	const allNews = data?.data || [];

	// Client-side filtering
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

	// Client-side pagination
	const indexOfLastPost = currentPage * postsPerPage;
	const indexOfFirstPost = indexOfLastPost - postsPerPage;
	const currentPosts = filteredNews.slice(indexOfFirstPost, indexOfLastPost);
	const totalPages = Math.ceil(filteredNews.length / postsPerPage);

	// Reset to page 1 when filters change
	useMemo(() => {
		setCurrentPage(1);
	}, [selectedCategory, selectedTag, searchQuery]);

	const paginationData = {
		page: currentPage,
		pageSize: postsPerPage,
		total: filteredNews.length,
		totalPages: totalPages,
	};

	return (
		<>
			<div className="theme-main">
				<div className={isDark ? "dark-mode" : ""}>
					<div
						className={`page ${isDark ? "bg-dark-1" : ""}`}
						id="top"
					>
						<nav className="main-nav transparent stick-fixed wow-menubar">
							<Header />
						</nav>
						<main id="main">
							<section
								className="page-section pt-0 pb-0"
								id="home"
							>
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
													<h2 className="section-caption mb-xs-10">
														{
															pageContent.hero
																.eyebrow[
																language
															]
														}
													</h2>
													<h1 className="hs-title-1 mb-20">
														<span
															className="wow charsAnimIn"
															data-splitting="chars"
														>
															<AnimatedText
																text={
																	pageContent
																		.hero
																		.title[
																		language
																	]
																}
															/>
														</span>
													</h1>
												</div>
												{/* End Page Title */}
											</div>
										</div>
										{/* End Section Content */}
									</div>
								</ParallaxContainer>
							</section>
							<>
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
												<Content1
													posts={currentPosts}
													loading={loading}
													error={error}
													filteredCount={
														filteredNews.length
													}
													totalCount={allNews.length}
												/>
												{/* End Post */}
												{/* Pagination */}
												<Pagination
													className={"pagination"}
													pagination={paginationData}
													currentPage={currentPage}
													onPageChange={
														setCurrentPage
													}
												/>
												{/* End Pagination */}
											</div>
											{/* End Content */}
											{/* Sidebar */}
											<div className="col-md-4 col-lg-3 offset-lg-1">
												<Widget1
													searchInputClass="form-control input-lg search-field round"
													allNews={allNews}
													filteredNews={filteredNews}
													searchQuery={searchQuery}
													setSearchQuery={
														setSearchQuery
													}
													selectedCategory={
														selectedCategory
													}
													setSelectedCategory={
														setSelectedCategory
													}
													selectedTag={selectedTag}
													setSelectedTag={
														setSelectedTag
													}
												/>
											</div>
											{/* End Sidebar */}
										</div>
									</div>
								</section>

								{/* End Section */}
							</>
						</main>
						<Footer1 dark={isDark} />
					</div>
				</div>
			</div>
		</>
	);
}
