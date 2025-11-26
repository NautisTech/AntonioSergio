"use client";
import { use, useState, useEffect } from "react";
import Footer1 from "@/components/footers/Footer1";
import Image from "next/image";
import Link from "next/link";
import ParallaxContainer from "@/components/common/ParallaxContainer";
import Header from "@/components/site/Header";
import AnimatedText from "@/components/common/AnimatedText";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useContentBySlug, useProjects } from "@/lib/api/public-content";
import { notFound } from "next/navigation";

export default function ProjectDetailPage({ params }) {
	const unwrappedParams = use(params);
	const { language } = useLanguage();
	const { theme } = useTheme();
	const isDark = theme === "dark";

	// Fetch project by slug
	const {
		data: project,
		loading: projectLoading,
		error: projectError,
	} = useContentBySlug(unwrappedParams.slug);

	// Re-initialize WOW animations when project loads
	useEffect(() => {
		if (project && typeof window !== "undefined") {
			try {
				const { WOW } = require("wowjs");
				const wow = new WOW({
					boxClass: "wow",
					animateClass: "animated",
					offset: 0,
					mobile: true,
					live: false,
				});
				wow.init();
			} catch (e) {
				console.error("Error initializing WOW:", e);
			}
		}
	}, [project]);

	// Fetch all projects for prev/next navigation
	const { data: projectsData } = useProjects({ pageSize: 100 });
	const allProjects = projectsData?.data || [];

	if (projectError) {
		notFound();
	}

	if (projectLoading) {
		return (
			<div className="theme-main">
				<div className="page" id="top">
					<nav className="main-nav transparent stick-fixed wow-menubar">
						<Header />
					</nav>
					<main id="main">
						<div className="container pt-50 pb-50 text-center">
							<p>
								{language === "pt"
									? "Carregando..."
									: "Loading..."}
							</p>
						</div>
					</main>
				</div>
			</div>
		);
	}

	if (!project) {
		notFound();
	}

	const translations = {
		backToProjects: {
			pt: "Voltar aos projetos",
			en: "Back to projects",
		},
		projectDetails: {
			pt: "Detalhes do Projeto",
			en: "Project Details",
		},
		partners: {
			pt: "Parceiros",
			en: "Partners",
		},
		status: {
			pt: "Estado",
			en: "Status",
		},
		description: {
			pt: "Descrição",
			en: "Description",
		},
		goals: {
			pt: "Objetivos",
			en: "Goals",
		},
		outcomes: {
			pt: "Resultados",
			en: "Outcomes",
		},
		gallery: {
			pt: "Galeria",
			en: "Gallery",
		},
		previous: {
			pt: "Anterior",
			en: "Previous",
		},
		next: {
			pt: "Próximo",
			en: "Next",
		},
		allProjects: {
			pt: "Todos os projetos",
			en: "All projects",
		},
	};

	// Find previous and next projects
	const currentIndex = allProjects.findIndex(
		proj => proj.slug === unwrappedParams.slug
	);
	const prevProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
	const nextProject =
		currentIndex < allProjects.length - 1
			? allProjects[currentIndex + 1]
			: null;

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
									backgroundImage: `url(${
										project.featured_image ||
										"/assets/school/campus/campus-2.jpg"
									})`,
								}}
							>
								<div className="container position-relative pt-30 pt-sm-50">
									{/* Section Content */}
									<div className="text-center">
										<div className="row">
											{/* Page Title */}
											<div className="col-md-8 offset-md-2">
												<div className="mb-20">
													<Link
														href="/projetos"
														className="btn btn-mod btn-small btn-border-w btn-circle"
														data-btn-animate="y"
													>
														<i className="mi-arrow-left align-center size-18" />{" "}
														{
															translations
																.backToProjects[
																language
															]
														}
													</Link>
												</div>
												<h1 className="hs-title-1 mb-20">
													<AnimatedText
														text={project.title}
													/>
												</h1>
												<div className="row">
													<div className="col-md-10 offset-md-1 col-lg-8 offset-lg-2">
														<p
															className="section-descr mb-0 wow fadeIn"
															data-wow-delay="0.2s"
															data-wow-duration="1.2s"
														>
															{project.excerpt ||
																""}
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
						<>
							{/* Section */}
							<section
								className={`page-section ${
									isDark ? "bg-dark-1 light-content" : ""
								}`}
							>
								<div className="container position-relative">
									<div className="row">
										{/* Left Column - Project Details & Content */}
										<div className="col-md-8 mb-sm-40 wow fadeInUp">
											{/* Project Details */}
											{project.categories &&
												project.categories.length >
													0 && (
													<div className="mb-60">
														<h2 className="h3 mb-20">
															{
																translations
																	.projectDetails[
																	language
																]
															}
														</h2>
														<hr
															className={`mb-20 ${
																isDark
																	? "white"
																	: ""
															}`}
														/>
														<div className="row text-gray small">
															<div className="col-sm-5">
																<b>
																	{
																		translations
																			.description[
																			language
																		]
																	}
																	:
																</b>
															</div>
															<div className="col-sm-7">
																{project.categories
																	.map(
																		cat =>
																			cat.name
																	)
																	.join(", ")}
															</div>
														</div>
														<hr
															className={`mb-20 ${
																isDark
																	? "white"
																	: ""
															}`}
														/>
														{project.tags &&
															project.tags
																.length > 0 && (
																<>
																	<div className="row text-gray small">
																		<div className="col-sm-5">
																			<b>
																				{language ===
																				"pt"
																					? "Tags:"
																					: "Tags:"}
																			</b>
																		</div>
																		<div className="col-sm-7">
																			{project.tags
																				.map(
																					t =>
																						t.name
																				)
																				.join(
																					", "
																				)}
																		</div>
																	</div>
																	<hr
																		className={`mb-20 ${
																			isDark
																				? "white"
																				: ""
																		}`}
																	/>
																</>
															)}
													</div>
												)}{" "}
											{/* Content */}
											<div className="mb-60">
												<div
													className="text-gray"
													dangerouslySetInnerHTML={{
														__html: project.content,
													}}
												/>
											</div>
										</div>
										{/* End Left Column */}

										{/* Right Column - Featured Image */}
										<div className="col-md-4">
											{/* Featured Image */}
											{project.featured_image && (
												<div className="mb-30 wow fadeInUp">
													<Image
														src={
															project.featured_image
														}
														alt={project.title}
														width={1350}
														height={865}
													/>
												</div>
											)}
										</div>
										{/* End Right Column */}
									</div>
								</div>
							</section>
							{/* End Section */}

							{/* Divider */}
							<hr
								className={`mt-0 mb-0 ${isDark ? "white" : ""}`}
							/>
							{/* End Divider */}

							{/* Work Navigation */}
							<div
								className={`work-navigation clearfix ${
									isDark ? "light-content" : ""
								}`}
							>
								<Link
									href={
										prevProject
											? `/projetos/${prevProject.slug}`
											: "#"
									}
									className="work-prev"
									style={{
										visibility: prevProject
											? "visible"
											: "hidden",
									}}
								>
									<span>
										<i className="mi-arrow-left size-24 align-middle" />{" "}
										{translations.previous[language]}
									</span>
								</Link>
								<Link href="/projetos" className="work-all">
									<span>
										<i className="mi-close size-24 align-middle" />{" "}
										{translations.allProjects[language]}
									</span>
								</Link>
								<Link
									href={
										nextProject
											? `/projetos/${nextProject.slug}`
											: "#"
									}
									className="work-next"
									style={{
										visibility: nextProject
											? "visible"
											: "hidden",
									}}
								>
									<span>
										{translations.next[language]}{" "}
										<i className="mi-arrow-right size-24 align-middle" />
									</span>
								</Link>
							</div>
						</>
					</main>
					<Footer1 />
				</div>
			</div>
		</>
	);
}
