"use client";
import { use } from "react";
import Footer1 from "@/components/footers/Footer1";
import Image from "next/image";
import Link from "next/link";
import ParallaxContainer from "@/components/common/ParallaxContainer";
import Header from "@/components/site/Header";
import AnimatedText from "@/components/common/AnimatedText";
import { useLanguage } from "@/context/LanguageContext";
import { aesContent } from "@/data/aesContent";
import { notFound } from "next/navigation";

export default function ProjectDetailPage({ params }) {
	const unwrappedParams = use(params);
	const { language } = useLanguage();
	const content = aesContent[language];
	const projects = content.projects || [];

	// Find the project by slug
	const project = projects.find(proj => proj.slug === unwrappedParams.id);

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
	const currentIndex = projects.findIndex(
		proj => proj.slug === unwrappedParams.id
	);
	const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
	const nextProject =
		currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;

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
									backgroundImage: `url(${project.cover})`,
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
														{translations.backToProjects[language]}
													</Link>
												</div>
												<h1 className="hs-title-1 mb-20">
													<span
														className="wow charsAnimIn"
														data-splitting="chars"
													>
														<AnimatedText text={project.title} />
													</span>
												</h1>
												<div className="row">
													<div className="col-md-10 offset-md-1 col-lg-8 offset-lg-2">
														<p
															className="section-descr mb-0 wow fadeIn"
															data-wow-delay="0.2s"
															data-wow-duration="1.2s"
														>
															{project.categories &&
																project.categories
																	.map(cat => cat.label)
																	.join(", ")}
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
							<section className="page-section">
								<div className="container position-relative">
									<div className="row">
										{/* Project Details */}
										<div className="col-md-4 mb-sm-40 wow fadeInUp">
											<div className="block-sticky">
												<h2 className="h3 mb-20">
													{translations.projectDetails[language]}
												</h2>
												<hr className="mb-20" />

												{project.status && (
													<>
														<div className="row text-gray small">
															<div className="col-sm-5">
																<b>{translations.status[language]}:</b>
															</div>
															<div className="col-sm-7">{project.status}</div>
														</div>
														<hr className="mb-20" />
													</>
												)}

												{project.partners && project.partners.length > 0 && (
													<>
														<div className="row text-gray small">
															<div className="col-sm-5">
																<b>{translations.partners[language]}:</b>
															</div>
															<div className="col-sm-7">
																{project.partners.join(", ")}
															</div>
														</div>
														<hr className="mb-20" />
													</>
												)}

												{project.summary && (
													<>
														<div className="text-gray small">
															<div>
																<b>{translations.description[language]}:</b>
															</div>
															<div>{project.summary}</div>
														</div>
														<hr className="mb-20" />
													</>
												)}
											</div>
										</div>
										{/* End Project Details */}

										<div className="col-md-8">
											{/* Description */}
											{project.description && (
												<div className="mb-60">
													<h2 className="h3 mb-20">
														{translations.description[language]}
													</h2>
													<p className="text-gray">{project.description}</p>
												</div>
											)}

											{/* Goals */}
											{project.goals && Array.isArray(project.goals) && (
												<div className="mb-60">
													<h2 className="h3 mb-20">
														{translations.goals[language]}
													</h2>
													<ul className="text-gray">
														{project.goals.map((goal, index) => (
															<li key={index}>{goal}</li>
														))}
													</ul>
												</div>
											)}

											{/* Outcomes */}
											{project.outcomes && (
												<div className="mb-60">
													<h2 className="h3 mb-20">
														{translations.outcomes[language]}
													</h2>
													<p className="text-gray">{project.outcomes}</p>
												</div>
											)}

											{/* Gallery */}
											{project.gallery && project.gallery.length > 0 && (
												<div className="mb-n30">
													<h2 className="h3 mb-40">
														{translations.gallery[language]}
													</h2>
													{project.gallery.map((image, index) => (
														<div key={index} className="mb-30 wow fadeInUp">
															<Image
																src={image}
																alt={`${project.title} - ${index + 1}`}
																width={1350}
																height={865}
															/>
														</div>
													))}
												</div>
											)}
										</div>
									</div>
								</div>
							</section>
							{/* End Section */}

							{/* Divider */}
							<hr className="mt-0 mb-0" />
							{/* End Divider */}

							{/* Work Navigation */}
							<div className="work-navigation clearfix">
								<Link
									href={prevProject ? `/projetos/${prevProject.slug}` : "#"}
									className="work-prev"
									style={{
										visibility: prevProject ? "visible" : "hidden",
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
									href={nextProject ? `/projetos/${nextProject.slug}` : "#"}
									className="work-next"
									style={{
										visibility: nextProject ? "visible" : "hidden",
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
