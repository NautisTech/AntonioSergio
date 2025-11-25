"use client";
import React from "react";
import FooterSocials from "./FooterSocials";
import Link from "next/link";
import Image from "next/image";
import { aesContent } from "@/data/aesContent";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer1({ dark = false }) {
	const { language } = useLanguage();
	const content = aesContent[language];
	const contactInfo = content.contactInfo;
	const navLinks = content.navLinks;
	const schoolIdentity = content.schoolIdentity;
	const footerCopy = content.footerCopy;

	const sanitizedPhone = contactInfo.phone.replace(/\s+/g, "");
	const scrollToTop = event => {
		event.preventDefault();
		window.scrollTo({
			top: 0,
			behavior: "smooth", // Linear easing replacement
		});
	};

	return (
		<footer
			className={`page-section footer footer-brand ${
				dark ? "light-content dark" : ""
			}  pb-30`}
		>
			<div className="container">
				<div className="row pb-120 pb-sm-80 pb-xs-50">
					<div className="col-md-12 col-lg-3 text-gray mb-sm-50">
						<Link href={"/"} className="mb-30 d-inline-block">
							<Image
								src="/assets/img/logo/logo-rw.svg"
								alt={schoolIdentity.name}
								width={150}
								height={55}
								priority
								style={{ height: "auto", width: "auto" }}
							/>
						</Link>
						<p>{schoolIdentity.description}</p>
						<div className="clearlinks">
							<strong>T.</strong>
							<a href={`tel:${sanitizedPhone}`}>
								{contactInfo.phone}
							</a>
						</div>
						<div className="clearlinks">
							<strong>E.</strong>
							<a href={`mailto:${contactInfo.email}`}>
								{contactInfo.email}
							</a>
						</div>
					</div>
					<div className="col-md-12 col-lg-9">
						<div className="row mt-n30">
							{/* School Links */}
							<div className="col-6 col-sm-3 mt-30">
								<h3 className="fw-title">{footerCopy.schoolTitle}</h3>
								<ul className="fw-menu clearlist local-scroll">
									{footerCopy.schoolLinks.map((link, index) => (
										<li key={index}>
											<Link href={link.href}>{link.label}</Link>
										</li>
									))}
								</ul>
							</div>
							{/* Services Links */}
							<div className="col-6 col-sm-3 mt-30">
								<h3 className="fw-title">{footerCopy.servicesTitle}</h3>
								<ul className="fw-menu clearlist local-scroll">
									{footerCopy.servicesLinks.map((link, index) => (
										<li key={index}>
											<Link href={link.href}>{link.label}</Link>
										</li>
									))}
								</ul>
							</div>
							{/* Communication Links */}
							<div className="col-6 col-sm-3 mt-30">
								<h3 className="fw-title">
									{footerCopy.communicationTitle}
								</h3>
								<ul className="fw-menu clearlist local-scroll">
									{footerCopy.communicationLinks.map((link, index) => (
										<li key={index}>
											<Link href={link.href}>{link.label}</Link>
										</li>
									))}
								</ul>
							</div>
							{/* Legal & Social */}
							<div className="col-6 col-sm-3 mt-30">
								<h3 className="fw-title">{footerCopy.legalTitle}</h3>
								<ul className="fw-menu clearlist local-scroll">
									{footerCopy.legalLinks.map((link, index) => (
										<li key={index}>
											<Link href={link.href}>{link.label}</Link>
										</li>
									))}
								</ul>
								<h3 className="fw-title mt-30">
									{footerCopy.socialTitle}
								</h3>
								<ul className="fw-menu clearlist">
									<FooterSocials />
								</ul>
							</div>
						</div>
					</div>
				</div>
				{/* Footer Text */}
				<div className="row text-gray">
					<div className="col-md-4 col-lg-3">
						<b>
							© {schoolIdentity.shortName}{" "}
							{new Date().getFullYear()}.
						</b>
					</div>
					<div className="col-md-7 offset-md-1 offset-lg-2 clearfix">
						<b>{footerCopy.locationNote}</b>
						{/* Back to Top Link */}
						<div className="local-scroll float-end mt-n20 mt-sm-10">
							<a
								href="#top"
								className="link-to-top"
								onClick={scrollToTop}
							>
								<i className="mi-arrow-up size-24" />
								<span className="visually-hidden">
									Scroll to top
								</span>
							</a>
						</div>
						{/* End Back to Top Link */}
					</div>
				</div>
				{/* End Footer Text */}
			</div>
		</footer>
	);
}
