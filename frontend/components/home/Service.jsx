import AnimatedText from "@/components/common/AnimatedText";
import { programHighlights } from "@/data/aesContent";
import Image from "next/image";
import React from "react";

const tabId = index => `services-item-${index + 1}`;

export default function Service() {
	return (
		<div className="container position-relative">
			<div className="row">
				<div className="col-lg-6 mb-md-60 mb-sm-30">
					<h2 className="section-caption mb-xs-10">
						{programHighlights.preTitle}
					</h2>
					<h3 className="section-title mb-30">
						<AnimatedText text={programHighlights.title} />
					</h3>
					<div className="row">
						<div className="col-lg-10">
							<p
								className="section-descr mb-50 mb-sm-30 wow fadeInUp"
								data-wow-delay="0.4s"
							>
								{programHighlights.description}
							</p>
						</div>
					</div>
					<ul
						className="nav nav-tabs services-tabs wow fadeInUp"
						data-wow-delay="0.55s"
						role="tablist"
					>
						{programHighlights.items.map((item, index) => (
							<li role="presentation" key={item.title}>
								<a
									href={`#${tabId(index)}`}
									className={index === 0 ? "active" : ""}
									aria-controls={tabId(index)}
									role="tab"
									aria-selected={index === 0}
									data-bs-toggle="tab"
								>
									{item.title}{" "}
									<span className="number">
										{(index + 1)
											.toString()
											.padStart(2, "0")}
									</span>
								</a>
							</li>
						))}
					</ul>
				</div>
				<div
					className="col-lg-6 d-flex wow fadeInLeft"
					data-wow-delay="0.55s"
					data-wow-offset={275}
				>
					<div className="tab-content services-content">
						{programHighlights.items.map((item, index) => (
							<div
								className={`tab-pane services-content-item fade ${
									index === 0 ? "show active" : ""
								}`}
								id={tabId(index)}
								role="tabpanel"
								key={item.title}
							>
								<div className="services-text">
									<div className="services-text-container">
										<h4 className="services-title">
											{item.title}
										</h4>
										<p className="text-gray mb-0">
											{item.description}
										</p>
									</div>
								</div>
								<Image
									width={945}
									height={1016}
									className="services-image"
									src={item.image}
									alt={item.title}
								/>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
