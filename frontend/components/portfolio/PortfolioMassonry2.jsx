"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useEntity, filterByEntity } from "@/context/EntityContext";
import { useEvents } from "@/lib/api/public-content";

export default function PortfolioMassonry2() {
	const { language } = useLanguage();
	const { selectedEntity } = useEntity();
	const [currentCategory, setCurrentCategory] = useState("all");
	const isotopContainer = useRef();
	const isotope = useRef();

	// Fetch events from API
	const { data: eventsData, loading } = useEvents({ pageSize: 50 });
	const apiEvents = eventsData?.data || [];

	// Filter events by selected entity if needed
	const events = selectedEntity
		? filterByEntity(apiEvents, selectedEntity)
		: apiEvents;

	const translations = {
		allEvents: {
			pt: "Todos os eventos",
			en: "All events",
		},
		noResults: {
			pt: "Nenhum evento disponível para esta escola.",
			en: "No events available for this school.",
		},
	};

	const formatDate = dateString => {
		const date = new Date(dateString);
		if (language === "pt") {
			return date.toLocaleDateString("pt-PT", {
				year: "numeric",
				month: "long",
				day: "numeric",
			});
		}
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

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
		if (!loading && events.length > 0) {
			initIsotop();
		}
	}, [loading, events.length]);

	// Re-layout isotope when filtered events change
	useEffect(() => {
		if (isotope.current) {
			isotope.current.reloadItems();
			isotope.current.arrange({
				filter: currentCategory === "all" ? "*" : "." + currentCategory,
			});
		}
	}, [events, currentCategory]);

	if (loading) {
		return (
			<div className="container">
				<div className="text-center py-5">
					<p className="text-gray">
						{language === "pt" ? "Carregando..." : "Loading..."}
					</p>
				</div>
			</div>
		);
	}

	if (events.length === 0) {
		return (
			<div className="container">
				<div className="text-center py-5">
					<p className="text-gray">
						{translations.noResults[language]}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container">
			{/* Works Filter */}
			<div className="works-filter text-center mb-60 mb-sm-40 z-index-1">
				<a
					onClick={() => updateCategory("all")}
					className={`filter ${
						currentCategory == "all" ? "active" : ""
					}`}
				>
					{translations.allEvents[language]}
				</a>
			</div>
			{/* End Works Filter */}

			{/* Works Grid */}
			<ul
				ref={isotopContainer}
				className="works-grid work-grid-2 work-grid-gut-lg masonry"
				id="work-grid"
			>
				{events.map((event, index) => (
					<li
						key={event.slug}
						className={`work-item all ${
							index % 2 ? " mt-90 mt-md-0 " : ""
						}`}
					>
						<Link
							href={`/eventos/${event.slug}`}
							className="work-link"
						>
							<div className="work-img">
								<div className="work-img-bg" />
								<Image
									width={650}
									height={773}
									src={
										event.featured_image ||
										"/assets/school/campus/campus-2.jpg"
									}
									alt={event.title}
								/>
							</div>
							<div className="work-intro text-start">
								<h3 className="work-title">{event.title}</h3>
								<div className="work-descr">
									{formatDate(event.published_at)}
								</div>
								<div className="work-descr">
									{event.excerpt}
								</div>
							</div>
						</Link>
					</li>
				))}
			</ul>
			{/* End Works Grid */}
		</div>
	);
}
