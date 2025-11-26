"use client";
import Footer1 from "@/components/footers/Footer1";
import ParallaxContainer from "@/components/common/ParallaxContainer";
import Header from "@/components/site/Header";
import AnimatedText from "@/components/common/AnimatedText";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

export default function RegulamentoPage() {
	const { language } = useLanguage();
	const { theme } = useTheme();
	const isDark = theme === "dark";

	const content = {
		pt: {
			title: "Regulamento Interno",
			subtitle: "Regulamento Interno do Agrupamento",
			description: "Conteúdo em desenvolvimento.",
		},
		en: {
			title: "Internal Regulations",
			subtitle: "School Internal Regulations",
			description: "Content under development.",
		},
	};

	const t = content[language];

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
										"url(/assets/school/campus/campus-4.jpg)",
								}}
							>
								<div className="container position-relative pt-50 pb-100 pb-sm-20">
									<div className="text-center">
										<div className="row">
											<div className="col-md-8 offset-md-2">
												<h1 className="hs-title-1 mb-30">
													<span
														className="wow charsAnimIn"
														data-splitting="chars"
													>
														<AnimatedText
															text={t.title}
														/>
													</span>
												</h1>
												<div className="row">
													<div className="col-lg-10 offset-lg-1">
														<p
															className="section-descr mb-0 wow fadeInUp"
															data-wow-delay="0.6s"
															data-wow-duration="1.2s"
														>
															{t.subtitle}
														</p>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</ParallaxContainer>
						</section>
						<section
							className={`page-section ${
								isDark ? "bg-dark-1 light-content" : ""
							}`}
						>
							<div className="container position-relative">
								<div className="row">
									<div className="col-lg-8 offset-lg-2">
										<p className="text-gray mb-0">
											{t.description}
										</p>
									</div>
								</div>
							</div>
						</section>
					</main>
					<Footer1 />
				</div>
			</div>
		</>
	);
}
