"use client";
import { useState } from "react";
import Footer1 from "@/components/footers/Footer1";
import ParallaxContainer from "@/components/common/ParallaxContainer";
import Header from "@/components/site/Header";
import AnimatedText from "@/components/common/AnimatedText";
import React from "react";
import Link from "next/link";
import Faq from "@/components/common/Faq";
import { pageTranslations } from "@/data/aesContent";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useFaqs } from "@/lib/api/public-content";

export default function MainFaqPage1() {
	const { language } = useLanguage();
	const { theme } = useTheme();
	const t = pageTranslations.faq;
	const isDark = theme === "dark";
	const [searchQuery, setSearchQuery] = useState("");
	const [activeSearch, setActiveSearch] = useState("");

	// Fetch FAQs from API with search filter
	const { data, loading, error } = useFaqs({
		pageSize: 100,
		search: activeSearch || undefined,
	});

	const handleSearch = e => {
		e.preventDefault();
		setActiveSearch(searchQuery.trim());
	};

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
								className={`page-section ${
									isDark
										? "bg-dark-1 bg-dark-alpha-80 light-content"
										: "bg-gray-light-1 bg-light-alpha-90"
								} parallax-5`}
								style={{
									backgroundImage:
										"url(/assets/school/campus/campus-1.jpg)",
								}}
							>
								<div className="container position-relative pt-50 pb-100 pb-sm-20">
									<div className="text-center">
										<div className="row">
											<div className="col-md-8 offset-md-2">
												<h2
													className="section-caption-border mb-30 mb-xs-20 wow fadeInUp"
													data-wow-duration="1.2s"
												>
													{t.hero.eyebrow[language]}
												</h2>
												<h1 className="hs-title-1 mb-0">
													<span
														className="wow charsAnimIn"
														data-splitting="chars"
													>
														<AnimatedText
															text={
																t.hero.title[
																	language
																]
															}
														/>
													</span>
												</h1>
											</div>
										</div>
									</div>
								</div>
							</ParallaxContainer>
						</section>
						<section
							className={`page-section pt-40 pt-sm-20 ${
								isDark ? "bg-dark-1 light-content" : ""
							}`}
						>
							<div className="container relative">
								<div className="row">
									<div className="col-md-8 offset-md-2">
										<form
											onSubmit={handleSearch}
											className="form mb-50 mb-sm-30"
										>
											<div className="search-wrap">
												<button
													className="search-button animate"
													type="submit"
													title="Start Search"
												>
													<i className="mi-search size-18" />
													<span className="visually-hidden">
														{
															t.search.button[
																language
															]
														}
													</span>
												</button>
												<input
													type="text"
													className="form-control input-lg search-field"
													placeholder={
														t.search.placeholder[
															language
														]
													}
													value={searchQuery}
													onChange={e =>
														setSearchQuery(
															e.target.value
														)
													}
												/>
											</div>
										</form>
									</div>
								</div>
								<div className="row section-text">
									<div className="col-md-8 offset-md-2">
										<Faq
											data={data}
											loading={loading}
											error={error}
										/>
									</div>
								</div>
							</div>
						</section>
						<div
							className={`page-section ${
								isDark ? "bg-dark-1 light-content" : "bg-gray-light-1"
							} z-index-1`}
						>
							<div className="container position-relative">
								<div className="row position-relative text-center">
									<div className="col-md-8 offset-md-2 col-lg-6 offset-lg-3">
										<h2 className="section-title mb-30">
											{t.cta.title[language]}
										</h2>
										<p className="mb-40">
											{t.cta.text[language]}
										</p>
										<svg
											className="decoration-11"
											width={461}
											height={190}
											viewBox="0 0 461 190"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
											aria-hidden="true"
										>
											<path
												opacity="0.3"
												d="M442.605 111.48C441.305 102.341 439.526 91.9468 435.749 82.4588C430.87 70.1711 423.769 59.4068 413.627 50.3858C403.485 41.3647 390.568 34.0869 376.618 30.2431C358.405 25.4275 338.548 26.1676 318.169 28.4478C299.668 30.5481 281.167 35.0136 262.318 37.6438C222.968 43.2543 181.352 44.1644 143.567 30.9431C135.337 28.3129 127.107 24.6691 119.052 20.3252C111.697 16.4815 104.342 11.486 95.4163 9.73575C84.0485 7.6355 72.6807 10.4457 61.3128 12.7259C49.945 15.0061 37.6215 16.8363 26.4288 20.6802C15.2362 24.524 4.91864 31.3332 1.49212 42.8075C-0.287107 48.778 -0.287098 54.9235 0.402984 61.0689C1.7932 75.8204 8.54839 89.6218 16.6035 102.693C24.3084 115.061 33.2341 126.526 43.3761 137.032C53.8682 147.796 65.5861 157.441 78.1538 165.966C105.812 185.308 139.96 199.709 174.973 196.729"
												stroke="var(--color-primary-1)"
												strokeWidth="1.3"
												strokeMiterlimit={10}
											/>
											<path
												d="M459.477 130.292C459.127 124.062 458.427 117.302 456.857 111.072C454.937 103.842 451.857 96.9621 447.317 90.7821C442.777 84.6021 436.777 78.7721 429.677 74.5821C421.277 69.6921 411.577 66.6921 401.527 65.5721C387.137 64.0021 372.397 66.3521 357.307 68.8821C344.577 71.0621 331.847 74.4071 319.117 76.9371C294.357 81.8221 268.647 84.8721 243.287 81.1171C230.907 79.2921 218.877 75.7171 207.547 69.8871C197.167 64.5821 187.137 57.7721 175.807 55.0671C162.027 51.8371 148.247 54.3571 134.467 56.5321C120.687 58.7071 106.207 60.1821 92.6068 64.7571C79.0068 69.3321 66.7668 77.5321 62.0468 90.9571C59.8368 97.3121 59.4868 103.847 59.8368 110.382C60.5368 125.847 66.2368 140.612 72.8868 154.327C79.3568 167.517 87.0568 180.182 96.3268 192.147C105.947 204.462 117.127 215.552 129.527 225.517C153.377 244.842 182.627 259.607 212.577 263.012"
												stroke="var(--color-primary-1)"
												strokeWidth="1.3"
												strokeMiterlimit={10}
											/>
										</svg>
										<div className="local-scroll mt-40">
											<Link
												href="/contactos"
												className="btn btn-mod btn-large btn-round btn-hover-anim"
											>
												<span>
													{t.cta.button[language]}
												</span>
											</Link>
										</div>
									</div>
								</div>
							</div>
						</div>
					</main>
					<Footer1 dark={isDark} />
				</div>
				</div>
			</div>
		</>
	);
}
