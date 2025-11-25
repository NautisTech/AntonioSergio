"use client";
import Footer1 from "@/components/footers/Footer1";
import ParallaxContainer from "@/components/common/ParallaxContainer";
import Header from "@/components/site/Header";
import AnimatedText from "@/components/common/AnimatedText";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import Image from "next/image";
import { Item, Gallery } from "react-photoswipe-gallery";

export default function InstalacoesPage() {
	const { language } = useLanguage();
	const { theme } = useTheme();
	const isDark = theme === "dark";

	const content = {
		pt: {
			title: "As Nossas Instalações",
			subtitle:
				"Explore os nossos espaços educativos modernos e bem equipados, projetados para melhorar a aprendizagem.",
			categories: {
				classrooms: {
					title: "Salas de Aula",
					description:
						"Ambientes de aprendizagem modernos e confortáveis equipados com a mais recente tecnologia educativa.",
				},
				labs: {
					title: "Laboratórios",
					description:
						"Laboratórios de última geração para aprendizagem prática em ciências, tecnologia e engenharia.",
				},
				workshops: {
					title: "Oficinas",
					description:
						"Oficinas especializadas para aprendizagem prática em disciplinas técnicas e profissionais.",
				},
				playground: {
					title: "Recreio e Desporto",
					description:
						"Instalações recreativas e desportivas que promovem a atividade física e a interação social.",
				},
				library: {
					title: "Biblioteca e Áreas de Estudo",
					description:
						"Espaços tranquilos e inspiradores para pesquisa, leitura e estudo individual.",
				},
				common: {
					title: "Áreas Comuns",
					description:
						"Espaços acolhedores para relaxamento, socialização e atividades comunitárias.",
				},
			},
		},
		en: {
			title: "Our Facilities",
			subtitle:
				"Explore our modern and well-equipped educational spaces, designed to enhance learning.",
			categories: {
				classrooms: {
					title: "Classrooms",
					description:
						"Modern and comfortable learning environments equipped with the latest educational technology.",
				},
				labs: {
					title: "Laboratories",
					description:
						"State-of-the-art laboratories for hands-on learning in science, technology, and engineering.",
				},
				workshops: {
					title: "Workshops",
					description:
						"Specialized workshops for practical learning in technical and professional disciplines.",
				},
				playground: {
					title: "Recreation and Sports",
					description:
						"Recreational and sports facilities that promote physical activity and social interaction.",
				},
				library: {
					title: "Library and Study Areas",
					description:
						"Quiet and inspiring spaces for research, reading, and individual study.",
				},
				common: {
					title: "Common Areas",
					description:
						"Welcoming spaces for relaxation, socialization, and community activities.",
				},
			},
		},
	};

	const t = content[language];

	// Facility images with placeholder images (can be replaced with actual school images)
	const facilityImages = {
		classrooms: [
			{
				src: "/assets/school/campus/campus-1.jpg",
				title:
					language === "pt"
						? "Sala de Aula Moderna"
						: "Modern Classroom",
			},
			{
				src: "/assets/school/campus/campus-2.jpg",
				title:
					language === "pt"
						? "Espaço de Aprendizagem Interativo"
						: "Interactive Learning Space",
			},
			{
				src: "/assets/school/campus/campus-3.jpg",
				title:
					language === "pt"
						? "Sala de Aula com Tecnologia"
						: "Technology-Enhanced Classroom",
			},
		],
		labs: [
			{
				src: "/assets/school/campus/campus-4.jpg",
				title:
					language === "pt"
						? "Laboratório de Ciências"
						: "Science Laboratory",
			},
			{
				src: "/assets/school/courses/course-1.jpg",
				title:
					language === "pt"
						? "Laboratório de Informática"
						: "Computer Lab",
			},
			{
				src: "/assets/school/courses/course-2.jpg",
				title:
					language === "pt"
						? "Laboratório de Química"
						: "Chemistry Lab",
			},
		],
		workshops: [
			{
				src: "/assets/school/courses/course-3.jpg",
				title: language === "pt" ? "Oficina Técnica" : "Technical Workshop",
			},
			{
				src: "/assets/school/courses/course-4.jpg",
				title:
					language === "pt"
						? "Oficina de Engenharia"
						: "Engineering Workshop",
			},
			{
				src: "/assets/school/courses/course-5.jpg",
				title:
					language === "pt"
						? "Oficina de Eletrónica"
						: "Electronics Workshop",
			},
		],
		playground: [
			{
				src: "/assets/school/campus/campus-5.jpg",
				title: language === "pt" ? "Campo Desportivo" : "Sports Field",
			},
			{
				src: "/assets/school/campus/campus-6.jpg",
				title:
					language === "pt"
						? "Campo de Basquetebol"
						: "Basketball Court",
			},
			{
				src: "/assets/school/breadcrumb/breadcrumb-1.jpg",
				title: language === "pt" ? "Área de Recreio" : "Playground Area",
			},
		],
		library: [
			{
				src: "/assets/school/breadcrumb/breadcrumb-2.jpg",
				title: language === "pt" ? "Biblioteca Principal" : "Main Library",
			},
			{
				src: "/assets/school/breadcrumb/breadcrumb-3.jpg",
				title: language === "pt" ? "Área de Leitura" : "Reading Area",
			},
			{
				src: "/assets/school/breadcrumb/breadcrumb-4.jpg",
				title: language === "pt" ? "Espaços de Estudo" : "Study Spaces",
			},
		],
		common: [
			{
				src: "/assets/school/about/about-1.jpg",
				title: language === "pt" ? "Sala de Estudantes" : "Student Lounge",
			},
			{
				src: "/assets/school/about/about-2.jpg",
				title: language === "pt" ? "Cantina" : "Cafeteria",
			},
			{
				src: "/assets/school/about/about-3.jpg",
				title: language === "pt" ? "Área de Receção" : "Reception Area",
			},
		},
	};

	const FacilitySection = ({ category, images, index }) => {
		const isEven = index % 2 === 0;

		return (
			<section
				className={`page-section ${
					isDark ? "bg-dark-1 light-content" : isEven ? "" : "bg-gray-light-1"
				}`}
			>
				<div className="container position-relative">
					<div className="text-center mb-60 mb-sm-40">
						<h2
							className={`section-title ${
								isDark ? "light-content" : ""
							}`}
						>
							{t.categories[category].title}
						</h2>
						<p
							className={`section-descr mb-0 ${
								isDark ? "text-gray" : ""
							}`}
						>
							{t.categories[category].description}
						</p>
					</div>

					<Gallery>
						<div className="row g-4">
							{images.map((image, i) => (
								<div key={i} className="col-md-4">
									<Item
										original={image.src}
										thumbnail={image.src}
										width={1200}
										height={800}
									>
										{({ ref, open }) => (
											<div
												className="post-prev-img rounded-0 overflow-hidden wow fadeInUp"
												data-wow-delay={`${i * 0.1}s`}
												style={{ cursor: "pointer" }}
											>
												<Image
													ref={ref}
													onClick={open}
													src={image.src}
													width={600}
													height={400}
													alt={image.title}
													style={{
														width: "100%",
														height: "300px",
														objectFit: "cover",
													}}
												/>
												<div className="mt-2">
													<p
														className={`text-center mb-0 ${
															isDark ? "text-gray" : ""
														}`}
													>
														{image.title}
													</p>
												</div>
											</div>
										)}
									</Item>
								</div>
							))}
						</div>
					</Gallery>
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

						{/* Facility Sections */}
						{Object.keys(facilityImages).map((category, index) => (
							<FacilitySection
								key={category}
								category={category}
								images={facilityImages[category]}
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
