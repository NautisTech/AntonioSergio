"use client";
import Footer1 from "@/components/footers/Footer1";
import ParallaxContainer from "@/components/common/ParallaxContainer";
import Header from "@/components/site/Header";
import AnimatedText from "@/components/common/AnimatedText";
import PortfolioMassonry2 from "@/components/portfolio/PortfolioMassonry2";
import { useLanguage } from "@/context/LanguageContext";
import { pageTranslations } from "@/data/aesContent";

export default function EventosPage() {
	const { language } = useLanguage();
	const pageContent = pageTranslations.eventos;

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
								className="page-section bg-dark-1 bg-dark-alpha-90 parallax-5 light-content"
								style={{
									backgroundImage:
										"url(/assets/school/campus/campus-4.jpg)",
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
							<section className="page-section">
								<PortfolioMassonry2 />
							</section>
							{/* End Section */}
						</>
					</main>
					<Footer1 />
				</div>{" "}
			</div>
		</>
	);
}
