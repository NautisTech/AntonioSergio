"use client";
import AnimatedText from "@/components/common/AnimatedText";
import { aesContent } from "@/data/aesContent";
import { useProjects } from "@/lib/api/public-content";
import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";

const slugify = value =>
	value
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");

export default function Portfolio() {
	const { language } = useLanguage();
	const content = aesContent[language];

	// Fetch projects from API - featured only
	const { data, loading, error } = useProjects({
		featuredOnly: true,
		language: language,
		pageSize: 12,
	});

	const projects = data?.data || [];

	const [currentCategory, setCurrentCategory] = useState("all");
	const isotopContainer = useRef();
	const isotope = useRef();
	const initIsotop = async () => {
		const Isotope = (await import("isotope-layout")).default;
		const imagesloaded = (await import("imagesloaded")).default;

		// Initialize Isotope in the mounted hook
		isotope.current = new Isotope(isotopContainer.current, {
			itemSelector: ".work-item",
			layoutMode: "masonry", // or 'fitRows', depending on your layout needs
		});
		imagesloaded(isotopContainer.current).on("progress", function () {
			// Trigger Isotope layout
			isotope.current.layout();
		});
	};
	const updateCategory = val => {
		setCurrentCategory(val);
		isotope.current.arrange({
			filter: val == "all" ? "*" : "." + val,
		});
		//   isotope.value.layout();
	};
	useEffect(() => {
		/////////////////////////////////////////////////////
		// Magnate Animation

		initIsotop();
	}, []);

	// Re-layout isotope when filtered projects change
	useEffect(() => {
		if (isotope.current) {
			isotope.current.reloadItems();
			isotope.current.arrange({ filter: currentCategory === "all" ? "*" : "." + currentCategory });
		}
	}, [projects, currentCategory]);

	const filters = useMemo(() => {
		const categories = Array.from(
			new Set(
				projects.flatMap(project =>
					(project.categories || []).map(c => c.name || c)
				)
			)
		);
		return [
			{ name: content.homeSections.portfolio.filterAllLabel, category: "all" },
			...categories.map(category => ({
				name: category,
				category: slugify(category),
			})),
		];
	}, [projects, content.homeSections.portfolio.filterAllLabel]);

	// Show loading state
	if (loading) {
		return (
			<div className="container">
				<div className="text-center py-5">
					<p className="text-gray">
						{language === "pt" ? "Carregando projetos..." : "Loading projects..."}
					</p>
				</div>
			</div>
		);
	}

	// Show error state
	if (error) {
		return (
			<div className="container">
				<div className="text-center py-5">
					<p className="text-gray">
						{language === "pt" ? "Erro ao carregar projetos." : "Error loading projects."}
					</p>
				</div>
			</div>
		);
	}

	// Show empty state
	if (projects.length === 0) {
		return (
			<div className="container">
				<div className="text-center py-5">
					<p className="text-gray">
						{language === "pt"
							? "Nenhum projeto disponível."
							: "No projects available."}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container">
			<div className="row mb-60 mb-md-40">
				<div className="col-lg-5">
					<h2 className="section-caption mb-xs-10">
						{content.homeSections.portfolio.caption}
					</h2>
					<h3 className="section-title mb-0">
						<AnimatedText text={content.homeSections.portfolio.title} />
					</h3>
				</div>
				<div className="col-lg-7">
					{/* Works Filter */}
					<div className="works-filter text-md-left text-lg-end mt-50 mt-md-30">
						{filters.map((elm, i) => (
							<a
								onClick={() => updateCategory(elm.category)}
								key={i}
								className={`filter ${
									currentCategory == elm.category
										? "active"
										: ""
								}`}
							>
								{elm.name}
							</a>
						))}
					</div>
					{/* End Works Filter */}
				</div>
			</div>
			{/* Works Grid */}
			<ul
				ref={isotopContainer}
				className="works-grid work-grid-3 work-grid-gut-lg masonry"
				id="work-grid"
			>
				{projects.map((project, index) => {
					const categoryClasses = (project.categories || [])
						.map(category => slugify(category.name || category.slug || ""))
						.join(" ");
					return (
						<li
							key={project.id}
							className={`work-item ${categoryClasses}`}
							data-wow-delay={`${0.3 + index * 0.1}s`}
						>
							<Link
								href={`/projetos/${project.slug}`}
								className="link-underline"
							>
								<div className="work-img">
									<div className="work-img-bg " />
									{project.featured_image && (
										<Image
											width={650}
											height={773}
											src={project.featured_image}
											alt={project.title}
										/>
									)}
								</div>
								<div className="work-intro text-start">
									<h3 className="work-title">{project.title}</h3>
									<div className="work-descr">{project.excerpt}</div>
								</div>
							</Link>
						</li>
					);
				})}
			</ul>
			{/* End Works Grid */}
		</div>
	);
}
