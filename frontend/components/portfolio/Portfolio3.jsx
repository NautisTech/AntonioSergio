"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useEntity, filterByEntity } from "@/context/EntityContext";
import { useProjects } from "@/lib/api/public-content";

export default function Portfolio3({ gridClass = "" }) {
	const { language } = useLanguage();
	const { selectedEntity } = useEntity();
	const [currentCategory, setCurrentCategory] = useState("all");
	const isotopContainer = useRef();
	const isotope = useRef();

	// Fetch projects from API
	const { data: projectsData, loading } = useProjects({ pageSize: 50 });
	const apiProjects = projectsData?.data || [];

	// Filter projects by selected entity if needed
	const projects = selectedEntity
		? filterByEntity(apiProjects, selectedEntity)
		: apiProjects;

	useEffect(() => {
		console.log("Portfolio3 - Projects data:", {
			apiProjectsCount: apiProjects.length,
			projects: projects.length,
			loading,
			selectedEntity,
		});
	}, [apiProjects, projects, loading, selectedEntity]);

	const translations = {
		allProjects: {
			pt: "Todos os projetos",
			en: "All projects",
		},
		noResults: {
			pt: "Nenhum projeto disponível para esta escola.",
			en: "No projects available for this school.",
		},
		loading: {
			pt: "Carregando...",
			en: "Loading...",
		},
	};

	// Get unique categories from projects
	const categories = [
		{ name: translations.allProjects[language], slug: "all" },
		...projects
			.flatMap(p => p.categories || [])
			.filter(
				(cat, index, self) =>
					index === self.findIndex(c => c.slug === cat.slug)
			),
	];

	const initIsotop = async () => {
		if (!isotopContainer.current) return;

		const Isotope = (await import("isotope-layout")).default;
		const imagesloaded = (await import("imagesloaded")).default;

		// Initialize Isotope in the mounted hook
		isotope.current = new Isotope(isotopContainer.current, {
			itemSelector: ".work-item",
			layoutMode: "masonry",
		});
		imagesloaded(isotopContainer.current).on("progress", function () {
			// Trigger Isotope layout
			if (isotope.current) {
				isotope.current.layout();
			}
		});
	};

	const updateCategory = val => {
		setCurrentCategory(val);
		if (isotope.current) {
			isotope.current.arrange({
				filter: val == "all" ? "*" : "." + val,
			});
		}
	};

	useEffect(() => {
		// Only initialize after data is loaded
		if (!loading && projects.length > 0) {
			initIsotop();
		}
	}, [loading, projects.length]);

	// Re-layout isotope when filtered projects change
	useEffect(() => {
		if (isotope.current) {
			isotope.current.reloadItems();
			isotope.current.arrange({
				filter: currentCategory === "all" ? "*" : "." + currentCategory,
			});
		}
	}, [projects, currentCategory]);

	if (loading) {
		return (
			<div className="full-wrapper position-relative">
				<div className="text-center py-5">
					<p className="text-gray">
						{translations.loading[language]}
					</p>
				</div>
			</div>
		);
	}

	if (projects.length === 0) {
		return (
			<div className="full-wrapper position-relative">
				<div className="text-center py-5">
					<p className="text-gray">
						{translations.noResults[language]}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="full-wrapper position-relative">
			{/* Works Filter */}
			<div className="works-filter text-center mb-60 mb-sm-40 z-index-1">
				{categories.map((cat, i) => (
					<a
						onClick={() => updateCategory(cat.slug)}
						key={i}
						className={`filter ${
							currentCategory == cat.slug ? "active" : ""
						}`}
					>
						{cat.label || cat.name}
					</a>
				))}
			</div>
			{/* End Works Filter */}

			{/* Works Grid */}
			<ul
				ref={isotopContainer}
				className={`works-grid work-grid-gut clearfix hide-titles hover-white ${gridClass} masonry`}
				id="work-grid"
			>
				{projects.map((project, index) => {
					const categoryClasses =
						project.categories?.map(cat => cat.slug).join(" ") ||
						"all";
					return (
						<li
							key={project.slug || index}
							className={`work-item mix ${categoryClasses}`}
						>
							<Link
								href={`/projetos/${project.slug}`}
								className={"work-lightbox-link mfp-image"}
							>
								<div className="work-img">
									<div className="work-img-bg" />
									<Image
										width={650}
										height={773}
										src={
											project.featured_image ||
											"/assets/school/campus/campus-2.jpg"
										}
										alt={project.title}
										style={{
											width: "650px",
											height: "773px",
											objectFit: "cover",
										}}
									/>
								</div>
								<div className="work-intro text-start">
									<h3 className="work-title">
										{project.title}
									</h3>
									<div className="work-descr">
										{project.excerpt}
									</div>
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
