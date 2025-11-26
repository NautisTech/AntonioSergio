"use client";
import Footer1 from "@/components/footers/Footer1";
import ParallaxContainer from "@/components/common/ParallaxContainer";
import Header from "@/components/site/Header";
import TicketForm from "@/components/ticket/TicketForm";
import React from "react";
import { pageTranslations } from "@/data/aesContent";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

export default function TicketPage() {
	const { language } = useLanguage();
	const { theme } = useTheme();
	const t = pageTranslations.ticket;
	const isDark = theme === "dark";

	return (
		<>
			<div className="theme-main">
				<div className="page" id="top">
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
										"url(/assets/school/campus/campus-2.jpg)",
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
														<h1 className="hs-title-1 mb-30">
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
														<p
															className="section-descr mb-0 wow fadeInUp"
															data-wow-delay="0.2s"
														>
															{
																t.hero.subtitle[
																	language
																]
															}
														</p>
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

						{/* Ticket Form Section */}
						<section
							className={`page-section ${
								isDark ? "bg-dark-1 light-content" : ""
							}`}
							id="ticket-form"
						>
							<TicketForm />
						</section>
						{/* End Ticket Form Section */}

						{/* Info Section */}
						<section
							className={`page-section ${
								isDark
									? "bg-dark-2 light-content"
									: "bg-gray-light-1"
							}`}
						>
							<div className="container position-relative">
								<div className="row">
									<div className="col-lg-4 mb-md-40 mb-xs-30">
										<div className="alt-features-item text-center">
											<div className="alt-features-icon mb-20">
												<i
													className="mi-clock"
													aria-hidden="true"
												/>
											</div>
											<h4 className="alt-features-title">
												{language === "pt"
													? "Resposta Rápida"
													: "Quick Response"}
											</h4>
											<div className="alt-features-descr">
												{language === "pt"
													? "A nossa equipa responderá ao seu ticket o mais brevemente possível, de acordo com a prioridade definida."
													: "Our team will respond to your ticket as soon as possible, according to the defined priority."}
											</div>
										</div>
									</div>

									<div className="col-lg-4 mb-md-40 mb-xs-30">
										<div className="alt-features-item text-center">
											<div className="alt-features-icon mb-20">
												<i
													className="mi-settings"
													aria-hidden="true"
												/>
											</div>
											<h4 className="alt-features-title">
												{language === "pt"
													? "Suporte Técnico"
													: "Technical Support"}
											</h4>
											<div className="alt-features-descr">
												{language === "pt"
													? "Equipa especializada pronta para resolver problemas técnicos e outras questões relacionadas com equipamentos."
													: "Specialized team ready to solve technical problems and other equipment-related issues."}
											</div>
										</div>
									</div>

									<div className="col-lg-4">
										<div className="alt-features-item text-center">
											<div className="alt-features-icon mb-20">
												<i
													className="mi-search"
													aria-hidden="true"
												/>
											</div>
											<h4 className="alt-features-title">
												{language === "pt"
													? "Acompanhamento"
													: "Follow-up"}
											</h4>
											<div className="alt-features-descr">
												{language === "pt"
													? "Acompanhe o progresso do seu ticket e receba atualizações sobre a resolução do problema."
													: "Track your ticket progress and receive updates on issue resolution."}
											</div>
										</div>
									</div>
								</div>
							</div>
						</section>
						{/* End Info Section */}
					</main>
					<Footer1 />
				</div>
			</div>
		</>
	);
}
