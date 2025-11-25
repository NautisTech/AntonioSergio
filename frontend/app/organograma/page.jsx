"use client";
import Footer1 from "@/components/footers/Footer1";
import ParallaxContainer from "@/components/common/ParallaxContainer";
import Header from "@/components/site/Header";
import AnimatedText from "@/components/common/AnimatedText";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import Image from "next/image";

export default function OrganogramaPage() {
	const { language } = useLanguage();
	const { theme } = useTheme();
	const isDark = theme === "dark";

	const content = {
		pt: {
			title: "Organograma",
			subtitle:
				"Compreenda a estrutura da nossa escola e os papéis do pessoal chave dedicado a apoiar o sucesso dos nossos alunos.",
		},
		en: {
			title: "Organizational Chart",
			subtitle:
				"Understand our school structure and the roles of key personnel dedicated to supporting our students' success.",
		},
	};

	const t = content[language];

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
										"url(/assets/school/about/about-1.jpg)",
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
														<AnimatedText text={t.title} />
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
								<div className="row justify-content-center">
									<div className="col-lg-10">
										<div className="text-center">
											<Image
												src="/assets/img/about/organization.png"
												width={1200}
												height={800}
												alt={t.title}
												className="w-100 rounded-0 wow fadeInUp"
												data-wow-delay="0.3s"
												style={{
													objectFit: "contain",
												}}
											/>
										</div>
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
