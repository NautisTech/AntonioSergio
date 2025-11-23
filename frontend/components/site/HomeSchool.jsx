"use client";
import About from "@/components/home/About";
import Benefits from "@/components/home/Benefits";
import Blog from "@/components/home/Blog";
import Brands from "@/components/home/Brands";
import Contact from "@/components/home/Contact";
import Facts from "@/components/home/Facts";
import Faq from "@/components/home/Faq";
import Features from "@/components/home/Features";
import ParallaxContainer from "@/components/common/ParallaxContainer";
import Portfolio from "@/components/home/Portfolio";
import Service from "@/components/home/Service";
import Team from "@/components/home/Team";
import Testimonials from "@/components/home/Testimonials";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { aesContent } from "@/data/aesContent";

export default function HomeSchool() {
	const { language } = useLanguage();
	const content = aesContent[language];

	return (
		<>
			<section className="page-section scrollSpysection" id="sobre">
				<div className="container position-relative">
					<div className="row mb-50">
						<div className="col-md-6">
							<h2 className="section-caption mb-xs-10">
								{content.homeSections.about.caption}
							</h2>
							<h3 className="section-title mb-0">
								{content.homeSections.about.title}
							</h3>
						</div>
						<div className="col-md-5 offset-md-1 text-start text-md-end pt-40 pt-sm-20">
							<Link
								href="/sobre-nos"
								className="link-hover-anim underline align-middle"
								data-link-animate="y"
							>
								{content.homeSections.about.actionLabel}{" "}
								<i className="mi-arrow-right size-18" />
							</Link>
						</div>
					</div>
					<About />
				</div>
			</section>

			<section className="page-section bg-gray-light-1" id="equipa">
				<Team />
			</section>

			<section className="page-section" id="oferta">
				<Service />
			</section>

			<ParallaxContainer
				className="page-section bg-dark-1 bg-dark-alpha-90 parallax-5 light-content"
				style={{
					backgroundImage:
						"url(/assets/school/breadcrumb/breadcrumb-1.jpg)",
				}}
			>
				<div className="container position-relative">
					<div className="row">
						<div className="col-lg-4 mb-md-60 mb-xs-50">
							<h2 className="section-title mb-20 wow fadeInUp">
								{content.homeSections.stats.title}
							</h2>
							<p
								className="section-descr mb-40 wow fadeInUp"
								data-wow-delay="0.1s"
							>
								{content.homeSections.stats.description}
							</p>
							<div
								className="local-scroll wow fadeInUp"
								data-wow-delay="0.2s"
							>
								<Link
									href="/contactos"
									className="btn btn-mod btn-w btn-large btn-round btn-hover-anim"
								>
									<span>{content.homeSections.stats.ctaLabel}</span>
								</Link>
							</div>
						</div>
						<Facts />
					</div>
				</div>
			</ParallaxContainer>

			<section className="page-section" id="projetos">
				<Portfolio />
			</section>

			<section className="page-section bg-gray-light-1">
				<Benefits />
			</section>

			<section className="page-section">
				<Testimonials />
			</section>

			<section className="page-section">
				<Brands />
			</section>

			<section
				className="page-section bg-dark bg-dark-alpha-70 light-content"
				style={{
					backgroundImage: "url(/assets/school/campus/campus-4.jpg)",
				}}
			>
				<Features />
			</section>

			<section className="page-section" id="faq">
				<div className="container position-relative">
					<div className="row mb-40">
						<div className="col-md-8">
							<h2 className="section-caption mb-xs-10">
								{content.homeSections.faq.caption}
							</h2>
							<h3 className="section-title mb-0">
								{content.homeSections.faq.title}
							</h3>
						</div>
						<div className="col-md-4 text-md-end pt-30">
							<Link
								href="/contactos"
								className="link-hover-anim underline align-middle"
								data-link-animate="y"
							>
								{content.homeSections.faq.actionLabel}{" "}
								<i className="mi-arrow-right size-18" />
							</Link>
						</div>
					</div>
					<Faq />
				</div>
			</section>

			<section className="page-section" id="blog">
				<div className="container position-relative">
					<div className="row mb-60 mb-xs-30">
						<div className="col-md-6">
							<h2 className="section-caption mb-xs-10">
								{content.homeSections.blog.caption}
							</h2>
							<h3 className="section-title mb-0">
								{content.homeSections.blog.title}
							</h3>
						</div>
						<div className="col-md-5 offset-md-1 text-start text-md-end pt-40 pt-sm-20">
							<Link
								href="/blog"
								className="link-hover-anim underline align-middle"
								data-link-animate="y"
							>
								{content.homeSections.blog.actionLabel}{" "}
								<i className="mi-arrow-right size-18" />
							</Link>
						</div>
					</div>
					<Blog />
				</div>
			</section>

			<section className="page-section bg-gray-light-1" id="contactos">
				<Contact />
			</section>
		</>
	);
}
