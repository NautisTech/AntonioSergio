"use client";
import React from "react";
import Image from "next/image";
import { aesContent } from "@/data/aesContent";
import { useLanguage } from "@/context/LanguageContext";

export default function Brands() {
	const { language } = useLanguage();
	const content = aesContent[language];

	return (
		<div className="container position-relative">
			<div className="row">
				<div className="col-md-8 offset-md-2 text-center">
					<h2 className="section-title-tiny mb-30">
						{content.homeSections.partners.title}
					</h2>

					<div className="logo-grid">
						{content.partners.map(partner => (
							<div
								key={partner.name}
								className="logo-grid-img image-filter"
							>
								<Image
									src={partner.logo}
									width={120}
									height={40}
									alt={partner.name}
								/>
								<div className="small text-gray mt-10">
									{partner.category}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
