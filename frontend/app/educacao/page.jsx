"use client";
import Footer1 from "@/components/footers/Footer1";
import ParallaxContainer from "@/components/common/ParallaxContainer";
import Header from "@/components/site/Header";
import AnimatedText from "@/components/common/AnimatedText";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import Image from "next/image";

export default function EducacaoPage() {
	const { language } = useLanguage();
	const { theme } = useTheme();
	const isDark = theme === "dark";

	const content = {
		pt: {
			title: "Educação",
			subtitle:
				"Descubra a nossa oferta educativa abrangente desde o jardim de infância até ao ensino secundário, concebida para desenvolver o potencial de cada aluno.",
			levels: [
				{
					id: "jardim-infancia",
					title: "Jardim de Infância",
					subtitle: "Educação Pré-Escolar",
					description:
						"O nosso programa de jardim de infância oferece um ambiente acolhedor e estimulante onde as crianças pequenas desenvolvem competências fundamentais através da aprendizagem baseada no jogo. Focamo-nos no desenvolvimento social, emocional e cognitivo, preparando as crianças para a sua jornada educativa com criatividade, curiosidade e confiança.",
					image: "/assets/school/campus/campus-1.jpg",
				},
				{
					id: "primario",
					title: "Ensino Primário",
					subtitle: "Ensino Básico (1.º - 4.º Ano)",
					description:
						"O nosso programa de ensino primário constrói bases sólidas na literacia, numeracia e pensamento crítico. Através de atividades envolventes e atenção personalizada, ajudamos os alunos a desenvolver competências académicas essenciais, promovendo simultaneamente a independência, criatividade e o amor pela aprendizagem que os servirá ao longo da sua jornada educativa.",
					image: "/assets/school/campus/campus-2.jpg",
				},
				{
					id: "basico",
					title: "Ensino Básico",
					subtitle: "Ensino Básico (5.º - 9.º Ano)",
					description:
						"O nosso currículo do ensino básico proporciona uma educação abrangente nas disciplinas fundamentais, introduzindo simultaneamente áreas de estudo especializadas. Os alunos desenvolvem competências avançadas de pensamento crítico, exploram os seus interesses e começam a preparar-se para os seus futuros percursos académicos e profissionais através de diversas oportunidades de aprendizagem e orientação.",
					image: "/assets/school/campus/campus-3.jpg",
				},
				{
					id: "secundario",
					title: "Ensino Secundário",
					subtitle: "Ensino Secundário (10.º - 12.º Ano)",
					description:
						"O nosso programa de ensino secundário oferece preparação académica rigorosa e cursos técnicos especializados, concebidos para preparar os alunos para o ensino superior e carreiras profissionais. Com instalações modernas e corpo docente especializado, proporcionamos uma educação abrangente que desenvolve liderança, inovação e as competências necessárias para o sucesso no mundo moderno.",
					image: "/assets/school/campus/campus-4.jpg",
				},
			],
		},
		en: {
			title: "Education",
			subtitle:
				"Discover our comprehensive educational offerings from kindergarten through high school, designed to nurture every student's potential.",
			levels: [
				{
					id: "jardim-infancia",
					title: "Kindergarten",
					subtitle: "Early Childhood Education",
					description:
						"Our kindergarten program provides a nurturing and stimulating environment where young children develop fundamental skills through play-based learning. We focus on social, emotional, and cognitive development, preparing children for their educational journey ahead with creativity, curiosity, and confidence.",
					image: "/assets/school/campus/campus-1.jpg",
				},
				{
					id: "primario",
					title: "Primary School",
					subtitle: "Elementary Education (1st - 4th Grade)",
					description:
						"Our primary education program builds strong foundations in literacy, numeracy, and critical thinking. Through engaging activities and personalized attention, we help students develop essential academic skills while fostering independence, creativity, and a love for learning that will serve them throughout their educational journey.",
					image: "/assets/school/campus/campus-2.jpg",
				},
				{
					id: "basico",
					title: "Middle School",
					subtitle: "Basic Education (5th - 9th Grade)",
					description:
						"Our middle school curriculum provides comprehensive education across core subjects while introducing specialized areas of study. Students develop advanced critical thinking skills, explore their interests, and begin preparing for their future academic and career paths through diverse learning opportunities and guidance.",
					image: "/assets/school/campus/campus-3.jpg",
				},
				{
					id: "secundario",
					title: "High School",
					subtitle: "Secondary Education (10th - 12th Grade)",
					description:
						"Our high school program offers rigorous academic preparation and specialized technical courses designed to prepare students for higher education and professional careers. With modern facilities and expert faculty, we provide comprehensive education that develops leadership, innovation, and the skills needed for success in the modern world.",
					image: "/assets/school/campus/campus-4.jpg",
				},
			],
		},
	};

	const t = content[language];

	const EducationLevel = ({ level, index }) => {
		const isReverse = index % 2 !== 0;

		return (
			<section
				id={level.id}
				className={`page-section ${
					isDark
						? "bg-dark-1 light-content"
						: index % 2 === 0
							? ""
							: "bg-gray-light-1"
				}`}
			>
				<div className="container position-relative">
					<div className="row align-items-center">
						<div
							className={`col-lg-6 mb-md-60 mb-sm-40 ${
								isReverse ? "order-lg-2" : ""
							}`}
						>
							<div className={isReverse ? "ps-lg-5" : "pe-lg-5"}>
								<h2
									className={`section-caption-border mb-30 mb-xs-20 ${
										isDark ? "light-content" : ""
									}`}
								>
									{level.subtitle}
								</h2>
								<h3
									className={`section-title mb-30 ${
										isDark ? "light-content" : ""
									}`}
								>
									{level.title}
								</h3>
								<p
									className={`section-descr mb-0 ${
										isDark ? "text-gray" : ""
									}`}
								>
									{level.description}
								</p>
							</div>
						</div>
						<div
							className={`col-lg-6 ${isReverse ? "order-lg-1" : ""}`}
						>
							<div className={isReverse ? "pe-lg-5" : "ps-lg-5"}>
								<Image
									src={level.image}
									width={800}
									height={600}
									alt={level.title}
									className="w-100 rounded-0 wow fadeInUp"
									data-wow-delay="0.3s"
									style={{
										height: "400px",
										objectFit: "cover",
									}}
								/>
							</div>
						</div>
					</div>
				</div>
			</section>
		);
	};

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
										"url(/assets/school/campus/campus-3.jpg)",
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

						{/* Education Levels */}
						{t.levels.map((level, index) => (
							<EducationLevel
								key={level.id}
								level={level}
								index={index}
							/>
						))}
					</main>
					<Footer1 />
				</div>
			</div>
		</>
	);
}
