"use client";
import AnimatedText from "@/components/common/AnimatedText";
import { projects } from "@/data/aesContent";
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

	const filters = useMemo(() => {
		const categories = Array.from(
			new Set(
				projects.flatMap(project =>
					(project.categories || []).map(c =>
						typeof c === "string" ? c : c.label
					)
				)
			)
		);
		return [
			{ name: "Todos os projetos", category: "all" },
			...categories.map(category => ({
				name: category,
				category: slugify(category),
			})),
		];
	}, []);

	return (
		<div className="container">
			<div className="row mb-60 mb-md-40">
				<div className="col-lg-5">
					<h2 className="section-caption mb-xs-10">
						Projetos em destaque
					</h2>
					<h3 className="section-title mb-0">
						<AnimatedText text="Inovação, ciência e comunidade em ação." />
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
						.map(category =>
							slugify(
								typeof category === "string"
									? category
									: category.slug
							)
						)
						.join(" ");
					return (
						<li
							key={project.slug}
							className={`work-item ${categoryClasses}`}
							data-wow-delay={`${0.3 + index * 0.1}s`}
						>
							<Link
								href={`/projetos/${project.slug}`}
								className="link-underline"
							>
								<div className="work-img">
									<div className="work-img-bg " />
									<Image
										width={650}
										height={773}
										src={project.cover}
										alt={project.title}
									/>
								</div>
								<div className="work-intro text-start">
									<h3 className="work-title">
										{project.title}
									</h3>
									<div className="work-descr">
										{project.summary}
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
