"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useEntity, filterByEntity } from "@/context/EntityContext";
import { events as allEvents } from "@/data/aesContent";

export default function PortfolioMassonry2() {
	const { language } = useLanguage();
	const { selectedEntity } = useEntity();

	// Filter events by selected entity
	const events = filterByEntity(allEvents, selectedEntity);
	const [currentCategory, setCurrentCategory] = useState("all");
	const isotopContainer = useRef();
	const isotope = useRef();

	const translations = {
		allEvents: {
			pt: "Todos os eventos",
			en: "All events",
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
		const Isotope = (await import("isotope-layout")).default;
		const imagesloaded = (await import("imagesloaded")).default;

		// Initialize Isotope in the mounted hook
		isotope.current = new Isotope(isotopContainer.current, {
			itemSelector: ".work-item",
			layoutMode: "masonry",
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
	};

	useEffect(() => {
		initIsotop();
	}, []);

	return (
		<div className="container">
			{/* Works Filter */}
			<div className="works-filter text-center mb-60 mb-sm-40 z-index-1">
				<a
					onClick={() => updateCategory("all")}
					className={`filter ${currentCategory == "all" ? "active" : ""}`}
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
						<Link href={`/eventos/${event.slug}`} className="work-link">
							<div className="work-img">
								<div className="work-img-bg" />
								<Image
									width={650}
									height={773}
									src={event.cover}
									alt={event.title}
								/>
							</div>
							<div className="work-intro text-start">
								<h3 className="work-title">{event.title}</h3>
								<div className="work-descr">{formatDate(event.date)}</div>
								<div className="work-descr">{event.summary}</div>
							</div>
						</Link>
					</li>
				))}
			</ul>
			{/* End Works Grid */}
		</div>
	);
}
