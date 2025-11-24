"use client";
import Footer1 from "@/components/footers/Footer1";
import ParallaxContainer from "@/components/common/ParallaxContainer";
import Header from "@/components/site/Header";
import React from "react";
import Faq from "@/components/common/Faq";
import Contact from "@/components/contact/Contact";
import Map from "@/components/common/Map";
import { pageTranslations } from "@/data/aesContent";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

export default function MainContactPage() {
	const { language } = useLanguage();
	const { theme } = useTheme();
	const t = pageTranslations.contact;
	const isDark = theme === "dark";

	return (
		<>
			<div className="theme-main">
				<div className="page" id="top">
					<nav
						className={`main-nav transparent stick-fixed wow-menubar ${
							isDark ? "" : "dark"
						}`}
					>
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
										"url(/assets/school/campus/campus-5.jpg)",
								}}
							>
								<>
									<>
										<div
											className={`position-absolute top-0 bottom-0 start-0 end-0 ${
												isDark
													? "bg-gradient-dark"
													: "bg-gradient-white"
											}`}
										/>
										<div className="container position-relative pt-50">
											{/* Section Content */}
											<div className="text-center">
												<div className="row">
													{/* Page Title */}
													<div className="col-md-8 offset-md-2">
														<h2
															className="section-caption-border mb-30 mb-xs-20 wow fadeInUp"
															data-wow-duration="1.2s"
														>
															{
																t.hero.eyebrow[
																	language
																]
															}
														</h2>
														<h1 className="hs-title-1 mb-0">
															<span
																className="wow charsAnimIn"
																data-splitting="chars"
															>
																{
																	t.hero
																		.title[
																		language
																	]
																}
															</span>
														</h1>
													</div>
													{/* End Page Title */}
												</div>
											</div>
											{/* End Section Content */}
										</div>
									</>
								</>
							</ParallaxContainer>
						</section>
						<>
							{/* Contact Section */}
							<section
								className={`page-section pt-0 ${isDark ? "bg-dark-1 light-content" : ""}`}
								id="contact"
							>
								<Contact />
							</section>
							<div className={`google-map ${isDark ? "light-content" : ""}`}>
								<Map />
							</div>
							{/* End Contact Section */}
							{/* Divider */}
							<hr className={`mt-0 mb-0 ${isDark ? "white" : ""}`} />
							{/* End Divider */}
							{/* FAQ Section */}
							<section
								className={`page-section ${
									isDark ? "bg-dark-1 light-content" : "bg-gray-light-1"
								} z-index-1`}
							>
								<div className="container position-relative">
									{/* Decorative Waves */}

									{/* End Decorative Waves */}
									<div className="row position-relative">
										<div className="col-md-6 col-lg-5 mb-md-50 mb-sm-30">
											<h3 className="section-title mb-30">
												{t.faq.title[language]}
											</h3>
											<p className="text-gray mb-0">
												{t.faq.content[language]}
											</p>
										</div>
										<div className="col-md-6 offset-lg-1 pt-10 pt-sm-0">
											{/* Accordion */}
											<Faq />
											{/* End Accordion */}
										</div>
									</div>
								</div>
							</section>
						</>
					</main>
					<Footer1 />
				</div>
			</div>
		</>
	);
}
