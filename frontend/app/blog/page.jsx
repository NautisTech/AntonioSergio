"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
	const searchParams = useSearchParams();
	const { language } = useLanguage();
	const { theme } = useTheme();
	const pageContent = pageTranslations.blog;
	const isDark = theme === "dark";

	// State for filters
	const [filters, setFilters] = useState({
		categoryId: undefined,
		tags: undefined,
		search: undefined,
		page: 1,
	});

	// Update filters when URL params change
	useEffect(() => {
		const categoryId = searchParams.get("categoryId");
		const tags = searchParams.get("tags");
		const search = searchParams.get("search");
		const page = searchParams.get("page");

		setFilters({
			categoryId: categoryId ? parseInt(categoryId) : undefined,
			tags: tags || undefined,
			search: search || undefined,
			page: page ? parseInt(page) : 1,
		});
	}, [searchParams]);

	// Fetch news data at page level
	const { data, loading, error } = useNews({
		page: filters.page || 1,
		pageSize: 12,
		categoryId: filters.categoryId,
		tags: filters.tags,
		search: filters.search,
	});

	return (
		<>
			<div className="theme-main">
				<div className={isDark ? "dark-mode" : ""}>
					<div className={`page ${isDark ? "bg-dark-1" : ""}`} id="top">
						<nav className="main-nav transparent stick-fixed wow-menubar">
							<Header />
						</nav>
					<main id="main">
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
												<h2 className="section-caption mb-xs-10">
													{pageContent.hero.eyebrow[language]}
												</h2>
												<h1 className="hs-title-1 mb-20">
													<span
														className="wow charsAnimIn"
														data-splitting="chars"
													>
														<AnimatedText
															text={pageContent.hero.title[language]}
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
								className={`page-section ${isDark ? "bg-dark-1 light-content" : ""}`}
							>
								<div className="container relative">
									<div className="row">
										{/* Content */}
										<div className="col-md-8 mb-sm-80">
											{/* Post */}
											<Content1
												data={data}
												loading={loading}
												error={error}
											/>
											{/* End Post */}
											{/* Pagination */}
											<Pagination
												className={"pagination"}
												filters={filters}
												pagination={data?.pagination}
											/>
											{/* End Pagination */}
										</div>
										{/* End Content */}
										{/* Sidebar */}
										<div className="col-md-4 col-lg-3 offset-lg-1">
											<Widget1
												searchInputClass="form-control input-lg search-field round"
												filters={filters}
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
