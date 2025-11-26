"use client";
import Footer1 from "@/components/footers/Footer1";
import Header from "@/components/site/Header";
import Link from "next/link";
import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { aesContent } from "@/data/aesContent";

export default function NotFoundPage() {
	const { language } = useLanguage();
	const { theme } = useTheme();
	const isDark = theme === "dark";
	const content = aesContent[language]?.notFound;

	if (!content) {
		return null;
	}

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
								className={`home-section ${
									isDark
										? "bg-dark-1 bg-dark-alpha-60 light-content"
										: "bg-gray-light-1 bg-light-alpha-90"
								} parallax-5`}
								style={{
									backgroundImage: isDark
										? "url(/assets/images/full-width-images/section-bg-3.jpg)"
										: "url(/assets/school/campus/campus-6.jpg)",
								}}
								id="home"
							>
								<div className="container min-height-100vh d-flex align-items-center pt-100 pb-100 pt-sm-120 pb-sm-120">
									<div className="home-content">
										<div className="row">
											<div className="col-sm-10 offset-sm-1 col-md-8 offset-md-2 col-lg-6 offset-lg-3">
												<div className="hs-wrap">
													<div
														className="wow fadeInUp"
														data-wow-delay=".1s"
													>
														<h1 className="hs-title-12 mb-40 mb-sm-30">
															{content.hero.title}
														</h1>
													</div>
													<div
														className="mb-40 mb-sm-30 wow fadeInUp"
														data-wow-delay=".2s"
													>
														<h2 className="section-descr mb-20">
															{
																content.hero
																	.description
															}
														</h2>
													</div>
													<div
														className="local-scroll wow fadeInUp"
														data-wow-delay=".3s"
													>
														<Link
															href="/"
															className={`btn btn-mod ${
																isDark
																	? "btn-w"
																	: "btn-color"
															} btn-round btn-medium btn-hover-anim`}
														>
															<i className="mi-arrow-left size-24 align-center" />
															<span>
																{
																	content.hero
																		.button
																}
															</span>
														</Link>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</section>
						</main>
						<Footer1 dark={isDark} />
					</div>
				</div>
			</div>
		</>
	);
}
