"use client";
import Footer1 from "@/components/footers/Footer1";
import ParallaxContainer from "@/components/common/ParallaxContainer";
import Header from "@/components/site/Header";
import AnimatedText from "@/components/common/AnimatedText";
import Image from "next/image";
import Link from "next/link";
import Facts from "@/components/home/Facts";
import Testimonials3 from "@/components/home/Testimonials3";
import Faq from "@/components/common/Faq";
import Benefits from "@/components/home/Benefits";
import Brands from "@/components/home/Brands";
import { schoolIdentity, pageTranslations } from "@/data/aesContent";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

export default function MainAboutPage2() {
	const { language } = useLanguage();
	const { theme } = useTheme();
	const t = pageTranslations.about;
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
										? "bg-dark-1 bg-dark-alpha-90 parallax-5 light-content"
										: "bg-gray-light-1 bg-light-alpha-90 parallax-5"
								}`}
								style={{
									backgroundImage:
										"url(/assets/school/campus/campus-1.jpg)",
								}}
							>
								<div className="container position-relative pt-50 pb-100 pb-sm-20">
									{/* Section Content */}
									<div className="text-center">
										<div className="row">
											{/* Page Title */}
											<div className="col-md-8 offset-md-2">
												<h1 className="hs-title-1 mb-30">
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
												<div className="row">
													<div className="col-lg-10 offset-lg-1">
														<p
															className="section-descr mb-0 wow fadeInUp"
															data-wow-delay="0.6s"
															data-wow-duration="1.2s"
														>
															{
																t.hero.subtitle[
																	language
																]
															}
														</p>
													</div>
												</div>
											</div>
											{/* End Page Title */}
										</div>
									</div>
									{/* End Section Content */}
								</div>
							</ParallaxContainer>
						</section>
						<div className="page-section overflow-hidden pt-0 pb-0">
							<div className="marquee marquee-style-2 no-rotate">
								<div className="marquee-track marquee-animation-1">
									<div>{t.marquee.text1[language]}</div>
									<div>{t.marquee.text2[language]}</div>
									<div aria-hidden="true">
										{t.marquee.text1[language]}
									</div>
									<div aria-hidden="true">
										{t.marquee.text2[language]}
									</div>
									<div aria-hidden="true">
										{t.marquee.text1[language]}
									</div>
									<div aria-hidden="true">
										{t.marquee.text2[language]}
									</div>
									<div aria-hidden="true">
										{t.marquee.text1[language]}
									</div>
									<div aria-hidden="true">
										{t.marquee.text2[language]}
									</div>
									<div aria-hidden="true">
										{t.marquee.text1[language]}
									</div>
									<div aria-hidden="true">
										{t.marquee.text2[language]}
									</div>
									<div aria-hidden="true">
										{t.marquee.text1[language]}
									</div>
									<div aria-hidden="true">
										{t.marquee.text2[language]}
									</div>
									<div aria-hidden="true">
										{t.marquee.text1[language]}
									</div>
									<div aria-hidden="true">
										{t.marquee.text2[language]}
									</div>
									<div aria-hidden="true">
										{t.marquee.text1[language]}
									</div>
									<div aria-hidden="true">
										{t.marquee.text2[language]}
									</div>
								</div>
							</div>
						</div>
						<section
							className={`page-section ${
								isDark ? "bg-dark-1 light-content" : ""
							}`}
							id="about"
						>
							<div className="container">
								<div className="row">
									<div className="col-sm-4 mb-xs-50">
										<div className="call-action-4-images w-100">
											<div className="call-action-4-image-1">
												<Image
													src="/assets/school/about/about-1.jpg"
													alt="Campus António Sérgio"
													width={800}
													height={500}
													className="wow scaleOutIn w-100"
													data-wow-duration="1.2s"
												/>
											</div>
											<div
												className="call-action-4-image-2"
												data-rellax-y=""
												data-rellax-speed="0.7"
												data-rellax-percentage="0.25"
											>
												<Image
													src="/assets/school/about/about-3.jpg"
													alt="Campus António Sérgio"
													width={600}
													height={300}
													className="wow scaleOutIn w-100 h-auto"
													data-wow-duration="1.2s"
													data-wow-offset={0}
													style={{ display: "block" }}
												/>
											</div>
										</div>
									</div>

									<div className="col-sm-8 col-lg-6 col-xl-4 offset-xl-1 mt-n10">
										<div
											className="wow linesAnimIn"
											data-splitting="lines"
										>
											<h3 className="h5">
												{t.mission.title[language]}
											</h3>

											<p className="text-gray">
												{t.mission.content[language]}
											</p>

											<h3 className="h5">
												{t.vision.title[language]}
											</h3>

											<p className="text-gray mb-0">
												{t.vision.content[language]}
											</p>
										</div>
									</div>

									<div
										className="col-lg-2 offset-xl-1 d-none d-lg-block position-relative"
										style={{ height: "500px" }}
									>
										<Image
											src="/assets/school/about/about-2.jpg"
											alt="Campus António Sérgio"
											fill
											className="wow scaleOutIn"
											data-wow-duration="1.2s"
											style={{ objectFit: "cover" }}
										/>
									</div>
								</div>
							</div>
						</section>
						<ParallaxContainer
							className={`page-section ${
								isDark
									? "bg-light-1 bg-light-alpha-90 parallax-5"
									: "bg-dark-1 bg-dark-alpha-90 parallax-5 light-content"
							}`}
							style={{
								backgroundImage:
									"url(/assets/school/campus/campus-5.jpg)",
							}}
						>
							<div className="container position-relative">
								<div className="row">
									<div className="col-lg-4 mb-md-60 mb-xs-50 d-flex flex-column justify-content-center">
										<h2 className="section-title mb-20 wow fadeInUp">
											{t.facts.title[language]}
										</h2>
										<p
											className="section-descr mb-40 wow fadeInUp"
											data-wow-delay="0.1s"
										>
											{t.facts.subtitle[language]}
										</p>
										<div
											className="local-scroll wow fadeInUp"
											data-wow-delay="0.2s"
										>
											<Link
												href="/contactos"
												className="btn btn-mod btn-w btn-large btn-round btn-hover-anim"
											>
												<span>
													{t.facts.button[language]}
												</span>
											</Link>
										</div>
									</div>
									<Facts />
								</div>
							</div>
						</ParallaxContainer>
						<section
							className={`page-section overflow-hidden ${
								isDark ? "bg-dark-1 light-content" : "bg-gray-light-2"
							}`}
						>
							<Testimonials3 />
						</section>
						<section
							className={`page-section ${
								isDark ? "bg-dark-1 light-content" : ""
							}`}
						>
							<Brands />
						</section>
						<hr className={`mt-0 mb-0 ${isDark ? "white" : ""}`} />
						<section
							className={`page-section ${
								isDark ? "bg-dark-1 light-content" : ""
							}`}
						>
							<Benefits />
						</section>
						<hr className={`mt-0 mb-0 ${isDark ? "white" : ""}`} />
						<section
							className={`page-section ${
								isDark ? "bg-dark-1 light-content" : ""
							}`}
						>
							<div className="container position-relative">
								<div className="row">
									{/* Images */}
									<div className="col-lg-7 d-flex align-items-start mb-md-60 mb-xs-30">
										<div className="call-action-2-images">
											<div
												className="call-action-2-image-1"
												data-rellax-y=""
												data-rellax-speed="0.5"
												data-rellax-percentage="0.7"
											>
												<Image
													width={386}
													height={400}
													src="/assets/school/about/about-2.jpg"
													alt="Instalações"
													className="wow scaleOutIn"
													data-wow-duration="1.2s"
													data-wow-offset={255}
												/>
											</div>
											<div className="call-action-2-image-2">
												<Image
													width={810}
													height={512}
													src="/assets/school/about/about-3.jpg"
													alt="Instalações"
													className="wow scaleOutIn"
													data-wow-duration="1.2s"
													data-wow-offset={134}
												/>
											</div>
											<div
												className="call-action-2-image-3"
												data-rellax-y=""
												data-rellax-speed="-0.5"
												data-rellax-percentage="0.5"
											>
												<Image
													width={386}
													height={500}
													src="/assets/school/about/about-1.jpg"
													alt="Instalações"
													className="wow scaleOutIn"
													data-wow-duration="1.2s"
													data-wow-offset={0}
												/>
											</div>
										</div>
									</div>
									{/* End Images */}
									{/* Text */}
									<div className="col-lg-5 d-flex align-items-center">
										<div
											className="wow fadeInUp"
											data-wow-duration="1.2s"
											data-wow-offset={255}
										>
											<h2 className="section-title mb-50 mb-sm-20">
												{t.facilities.title[language]}
											</h2>
											<div className="mb-50 mb-sm-40">
												<Faq />
											</div>
											<div className="local-scroll">
												<Link
													href="/contactos"
													className="btn btn-mod btn-large btn-round btn-hover-anim"
												>
													<span>
														{
															t.facilities.button[
																language
															]
														}
													</span>
												</Link>
											</div>
										</div>
									</div>
									{/* End Text */}
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
