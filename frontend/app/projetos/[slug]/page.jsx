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
import { useAttachments } from "@/lib/api/public-uploads";
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

	// Log project data to verify custom fields
	useEffect(() => {
		if (project) {
			console.log("=== PROJECT DATA ===");
			console.log("Full project object:", project);
			console.log("Custom fields:", project.custom_fields);
			console.log("Custom fields keys:", project.custom_fields ? Object.keys(project.custom_fields) : "No custom_fields");
		}
	}, [project]);

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

	// Fetch attachments for this project
	const { data: attachments } = useAttachments(
		"content",
		project?.id || null
	);

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
		otherProjects: {
			pt: "Outros Projetos",
			en: "Other Projects",
		},
		documents: {
			pt: "Documentos",
			en: "Documents",
		},
	};

	// Helper to get localized values
	const getLocalizedValue = (item, field, lang) => {
		const localizedField = `${field}_${lang}`;
		return item?.[localizedField] || item?.[field] || "";
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
										{/* Project Details Sidebar */}
										<div className="col-md-4 mb-sm-40 wow fadeInUp">
											<div className="block-sticky">
												{/* Project Details */}
												{(project.categories && project.categories.length > 0) || (project.tags && project.tags.length > 0) && (
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
														{project.tags &&
															project.tags
																.length >
																0 && (
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
												)}

												{/* Custom Fields */}
												{project.custom_fields &&
													Object.keys(project.custom_fields)
														.length > 0 && (
														<div className="mb-60">
															{(() => {
																// Separate objectives from other fields
																const objectives = [];
																const otherFields = [];

																Object.entries(
																	project.custom_fields
																).forEach(([key, field]) => {
																	if (field?.value && key !== 'entidades') {
																		if (key.startsWith('objetivos_')) {
																			objectives.push(field.value);
																		} else {
																			otherFields.push([key, field]);
																		}
																	}
																});

																return (
																	<>
																		{/* Regular custom fields */}
																		{otherFields.map(([key, field]) => {
																			let displayValue = field.value;

																			// Format dates
																			if (field.type === "date" && field.value) {
																				const date = new Date(field.value);
																				displayValue = date.toLocaleDateString(
																					language === "pt" ? "pt-PT" : "en-US",
																					{
																						year: "numeric",
																						month: "long",
																						day: "numeric",
																					}
																				);
																			}

																			// Format multiselect as comma-separated list
																			if (field.type === "multiselect" && Array.isArray(field.value)) {
																				displayValue = field.value.join(", ");
																			}

																			return (
																				<div key={key} className="mb-30">
																					<h3 className="h5 mb-15">
																						{field.label}
																					</h3>
																					<div className="text-gray">
																						{displayValue}
																					</div>
																				</div>
																			);
																		})}

																		{/* Objectives as bullet points */}
																		{objectives.length > 0 && (
																			<div className="mb-30">
																				<h3 className="h5 mb-15">
																					{language === "pt" ? "Objetivos" : "Objectives"}
																				</h3>
																				<ul className="text-gray">
																					{objectives.map((objective, index) => (
																						<li key={index} className="mb-10">
																							{objective}
																						</li>
																					))}
																				</ul>
																			</div>
																		)}
																	</>
																);
															})()}
														</div>
													)}

												{/* Content/Description */}
												{project.content && (
													<div className="text-gray">
														<div
															dangerouslySetInnerHTML={{
																__html: project.content,
															}}
														/>
													</div>
												)}
											</div>
										</div>
										{/* End Project Details Sidebar */}

										{/* Images Column */}
										<div className="col-md-8">
											<div className="mb-n30">
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

												{/* Attachment Images */}
												{attachments
													?.filter(
														att =>
															att.fileType ===
															"image"
													)
													.sort(
														(a, b) =>
															a.displayOrder -
															b.displayOrder
													)
													.map((att, index) => (
														<div
															key={att.url}
															className="mb-30 wow fadeInUp"
														>
															<Image
																src={att.url}
																width={1350}
																height={865}
																alt={
																	att.originalName
																}
															/>
														</div>
													))}

												{/* Documents Section */}
												{attachments?.filter(
													att =>
														att.fileType ===
														"document"
												).length > 0 && (
													<div className="mb-30 wow fadeInUp">
														<h3 className="h4 mb-20">
															{
																translations
																	.documents[
																	language
																]
															}
														</h3>
														<div className="text-gray">
															{attachments
																.filter(
																	att =>
																		att.fileType ===
																		"document"
																)
																.sort(
																	(a, b) =>
																		a.displayOrder -
																		b.displayOrder
																)
																.map(doc => (
																	<div
																		key={
																			doc.url
																		}
																		className="mb-10"
																	>
																		<a
																			href={
																				doc.url
																			}
																			target="_blank"
																			rel="noopener noreferrer"
																			className="link-hover-anim"
																		>
																			📄{" "}
																			{
																				doc.originalName
																			}
																		</a>
																	</div>
																))}
														</div>
													</div>
												)}
											</div>
										</div>
										{/* End Images Column */}
									</div>
								</div>
							</section>
							{/* End Section */}

							{/* Related Projects */}
							{allProjects && allProjects.length > 1 && (
								<>
									{/* Divider */}
									<hr
										className={`mt-0 mb-0 ${
											isDark ? "white" : ""
										}`}
									/>
									{/* End Divider */}

									<section
										className={`page-section  ${
											isDark
												? "bg-dark-1 light-content"
												: ""
										} `}
									>
										<div className="container relative">
											<h2 className="section-title mb-40 mb-xs-30">
												{
													translations.otherProjects[
														language
													]
												}
											</h2>

											<div className="row multi-columns-row">
												{allProjects
													.filter(
														p => p.id !== project.id
													)
													.slice(0, 4)
													.map(
														(relProject, index) => (
															<div
																key={
																	relProject.id
																}
																className="col-md-6 col-lg-3 mb-30"
															>
																<Link
																	href={`/projetos/${relProject.slug}`}
																	className="work-item"
																	style={{
																		textDecoration:
																			"none",
																	}}
																>
																	<div className="work-img">
																		<div className="work-img-bg wow-p scalexIn" />
																		<Image
																			src={
																				relProject.featured_image ||
																				"/assets/images/placeholder.jpg"
																			}
																			width={
																				650
																			}
																			height={
																				773
																			}
																			alt={getLocalizedValue(
																				relProject,
																				"title",
																				language
																			)}
																		/>
																	</div>
																	<div className="work-intro">
																		<h3 className="work-title">
																			{getLocalizedValue(
																				relProject,
																				"title",
																				language
																			)}
																		</h3>
																		<div className="work-descr">
																			{getLocalizedValue(
																				relProject,
																				"excerpt",
																				language
																			)}
																		</div>
																	</div>
																</Link>
															</div>
														)
													)}
											</div>
										</div>
									</section>
								</>
							)}
							{/* End Related Projects */}

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
