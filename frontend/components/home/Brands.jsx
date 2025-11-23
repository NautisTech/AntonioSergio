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
				<div className="col-md-10 offset-md-1 text-center">
					<h2 className="section-title mb-60 mb-xs-40">
						{content.partnersSectionTitle}
					</h2>

					<div className="logo-grid">
						{content.partners.map(partner => (
							<div
								key={partner.name}
								className="logo-grid-img image-filter"
							>
								<Image
									src={partner.logo}
									width={160}
									height={60}
									alt={partner.name}
								/>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
