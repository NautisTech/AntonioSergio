"use client";
import Footer1 from "@/components/footers/Footer1";
import ParallaxContainer from "@/components/common/ParallaxContainer";
import Header from "@/components/site/Header";
import AnimatedText from "@/components/common/AnimatedText";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import Image from "next/image";
import { Item, Gallery } from "react-photoswipe-gallery";

export default function EqavetPage() {
	const { language } = useLanguage();
	const { theme } = useTheme();
	const isDark = theme === "dark";

	const content = {
		pt: {
			title: "EQAVET - Garantia de Qualidade Europeia",
			subtitle:
				"Parcerias e protocolos de qualidade que melhoram a nossa excelência educativa e oportunidades de desenvolvimento profissional.",
			partnerships: {
				companies: {
					title: "Parcerias e Protocolos com Empresas",
					description:
						"A parceria com empregadores envolve as seguintes iniciativas:",
					items: [
						"Organizar visitas de alunos a empresas para conhecer profissões e atividades",
						"Definir uma estratégia para orientação educativa e profissional",
						"Proporcionar formação contínua para professores/formadores em ambas as instituições",
						"Partilhar formadores da componente tecnológica entre instituições",
						"Partilhar equipamentos e instalações para sessões de formação e experimentação",
						"Implementar Formação em Contexto de Trabalho (FCT) para alunos de Cursos Profissionais",
						"Garantir condições de segurança, saúde e higiene no local de trabalho com equipamento de proteção individual adequado",
					],
				},
				higherEducation: {
					title: "Parcerias e Protocolos com o Ensino Superior",
					description:
						"A colaboração abrange várias ações para orientar os alunos de cursos profissionais para o ensino superior em áreas relacionadas. As principais ações incluem:",
					items: [
						"Orientação para a oferta do ensino superior, incluindo eventos promocionais e integração em projetos",
						"Definição de estratégia de orientação educativa e profissional, com apoio técnico e psicossocial",
						"Formação contínua de professores através de parcerias com CFAE e outras entidades",
						"Trabalho colaborativo entre formadores da componente tecnológica, incluindo mentoria e projetos de investigação",
						"Partilha de equipamentos e instalações para formação e simulação",
					],
				},
				localAdministration: {
					title: "Parcerias e Protocolos com a Administração Local",
					description:
						"A colaboração com a administração local abrange as seguintes ações:",
					items: [
						"Definir estratégia de orientação educativa e profissional, com técnicos especializados e reuniões de rede",
						"Promover o Ensino Técnico e Profissional através de planos de comunicação e eventos comunitários",
						"Estabelecer uma rede de transportes para alunos",
						"Proporcionar formação contínua para professores/formadores em parceria com CFAE e outras entidades",
						"Garantir a manutenção de espaços e equipamentos",
						"Investir em atualizações tecnológicas",
					],
				},
			},
			gallery: {
				title: "Parceiros EQAVET",
				subtitle: "Conheça os nossos Parceiros EQAVET",
			},
		},
		en: {
			title: "EQAVET - European Quality Assurance",
			subtitle:
				"Quality partnerships and protocols that enhance our educational excellence and professional development opportunities.",
			partnerships: {
				companies: {
					title: "Partnerships and Protocols with Companies",
					description:
						"The partnership with employers involves the following initiatives:",
					items: [
						"Organize student visits to companies to learn about professions and activities",
						"Define a strategy for educational and professional guidance",
						"Provide continuous training for teachers/trainers in both institutions",
						"Share trainers of the technological component between institutions",
						"Share equipment and facilities for training and experimentation sessions",
						"Implement Workplace Training (FCT) for Professional Course students",
						"Ensure safety, health and hygiene conditions in the workplace with appropriate personal protective equipment",
					],
				},
				higherEducation: {
					title: "Partnerships and Protocols with Higher Education",
					description:
						"The collaboration covers various actions to guide professional course students to higher education in related areas. Main actions include:",
					items: [
						"Guidance to higher education offerings, including promotional events and project integration",
						"Definition of educational and professional guidance strategy, with technical and psychosocial support",
						"Continuous teacher training through partnerships with CFAE and other entities",
						"Collaborative work between technological component trainers, including mentorship and research projects",
						"Sharing of equipment and facilities for training and simulation",
					],
				},
				localAdministration: {
					title: "Partnerships and Protocols with Local Administration",
					description:
						"The collaboration with local administration covers the following actions:",
					items: [
						"Define educational and professional guidance strategy, with specialized technicians and network meetings",
						"Promote Technical and Professional Education through communication plans and community events",
						"Establish a transport network for students",
						"Provide continuous training for teachers/trainers in partnership with CFAE and other entities",
						"Ensure maintenance of spaces and equipment",
						"Invest in technological upgrades",
					],
				},
			},
			gallery: {
				title: "EQAVET Partners",
				subtitle: "Meet our EQAVET Partners",
			},
		},
	};

	const t = content[language];

	const partnerImages = [
		{
			src: "/assets/school/brand/brand-1.svg",
			title:
				language === "pt"
					? "Associação Empresarial de Portugal"
					: "Portuguese Business Association",
		},
		{
			src: "/assets/school/brand/brand-4.svg",
			title: "Expandindústria",
		},
		{
			src: "/assets/school/brand/brand-5.svg",
			title: "INESCTEC",
		},
		{
			src: "/assets/school/brand/brand-2.svg",
			title:
				language === "pt"
					? "Instituto Politécnico do Porto"
					: "Polytechnic Institute of Porto",
		},
		{
			src: "/assets/school/brand/brand-3.svg",
			title:
				language === "pt"
					? "Área Metropolitana do Porto"
					: "Metropolitan Area of Porto",
		},
	];

	const PartnershipSection = ({ partnership, index }) => {
		const isEven = index % 2 === 0;

		return (
			<section
				className={`page-section ${
					isDark ? "bg-dark-1 light-content" : isEven ? "" : "bg-gray-light-1"
				}`}
			>
				<div className="container position-relative">
					<div className="row">
						<div className="col-lg-10 offset-lg-1">
							<h2
								className={`section-title mb-30 ${
									isDark ? "light-content" : ""
								}`}
							>
								{partnership.title}
							</h2>
							<p
								className={`section-descr mb-40 ${
									isDark ? "text-gray" : ""
								}`}
							>
								{partnership.description}
							</p>
							<ul className="eqavet-list">
								{partnership.items.map((item, i) => (
									<li
										key={i}
										className={`eqavet-list-item wow fadeInUp ${
											isDark ? "dark" : ""
										}`}
										data-wow-delay={`${i * 0.05}s`}
									>
										<span className="eqavet-letter">
											{String.fromCharCode(97 + i)})
										</span>
										<span className="eqavet-text">{item}</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</section>
		);
	};

	return (
		<>
			<style jsx global>{`
				.eqavet-list {
					list-style: none;
					padding: 0;
					margin: 0;
				}

				.eqavet-list-item {
					display: flex;
					align-items: flex-start;
					margin-bottom: 20px;
					padding: 15px 20px;
					background: rgba(165, 28, 48, 0.05);
					border-left: 3px solid #a51c30;
					border-radius: 4px;
					transition: all 0.3s ease;
				}

				.eqavet-list-item:hover {
					transform: translateX(5px);
					background: rgba(165, 28, 48, 0.1);
				}

				.eqavet-list-item.dark {
					background: rgba(255, 255, 255, 0.05);
					border-left-color: #f4edca;
				}

				.eqavet-list-item.dark:hover {
					background: rgba(255, 255, 255, 0.1);
				}

				.eqavet-letter {
					display: inline-flex;
					align-items: center;
					justify-content: center;
					min-width: 30px;
					height: 30px;
					background: #a51c30;
					color: white;
					border-radius: 50%;
					font-weight: 600;
					font-size: 14px;
					margin-right: 15px;
					flex-shrink: 0;
				}

				.eqavet-list-item.dark .eqavet-letter {
					background: #f4edca;
					color: #1f1f1f;
				}

				.eqavet-text {
					flex: 1;
					line-height: 1.6;
					font-size: 16px;
				}
			`}</style>

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

						{/* Partnership Sections */}
						<PartnershipSection
							partnership={t.partnerships.companies}
							index={0}
						/>
						<PartnershipSection
							partnership={t.partnerships.higherEducation}
							index={1}
						/>
						<PartnershipSection
							partnership={t.partnerships.localAdministration}
							index={2}
						/>

						{/* Partners Gallery */}
						<section
							className={`page-section ${
								isDark ? "bg-dark-1 light-content" : ""
							}`}
						>
							<div className="container position-relative">
								<div className="text-center mb-60 mb-sm-40">
									<h2
										className={`section-title ${
											isDark ? "light-content" : ""
										}`}
									>
										{t.gallery.title}
									</h2>
									<p
										className={`section-descr mb-0 ${
											isDark ? "text-gray" : ""
										}`}
									>
										{t.gallery.subtitle}
									</p>
								</div>

								<div className="row g-4 justify-content-center">
									{partnerImages.map((partner, i) => (
										<div key={i} className="col-md-4 col-lg-3">
											<div
												className={`partner-card wow fadeInUp ${
													isDark ? "dark" : ""
												}`}
												data-wow-delay={`${i * 0.1}s`}
											>
												<Image
													src={partner.src}
													width={200}
													height={100}
													alt={partner.title}
													style={{
														width: "100%",
														height: "80px",
														objectFit: "contain",
													}}
												/>
												<p className="partner-title mt-3 mb-0">
													{partner.title}
												</p>
											</div>
										</div>
									))}
								</div>
							</div>
						</section>
					</main>
					<Footer1 />
				</div>
			</div>

			<style jsx global>{`
				.partner-card {
					padding: 30px;
					background: white;
					border-radius: 8px;
					text-align: center;
					transition: all 0.3s ease;
					border: 1px solid #e5e7eb;
				}

				.partner-card:hover {
					transform: translateY(-5px);
					box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
				}

				.partner-card.dark {
					background: rgba(255, 255, 255, 0.05);
					border-color: rgba(255, 255, 255, 0.1);
				}

				.partner-title {
					font-size: 14px;
					font-weight: 500;
					color: #1f1f1f;
				}

				.partner-card.dark .partner-title {
					color: #f4edca;
				}
			`}</style>
		</>
	);
}
