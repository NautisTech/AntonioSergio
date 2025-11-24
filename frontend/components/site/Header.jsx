"use client";
import { aesContent } from "@/data/aesContent";
import { toggleMobileMenu } from "@/utlis/toggleMobileMenu";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import Image from "next/image";
import LanguageSelect from "./LanguageSelect";
import ThemeToggle from "./ThemeToggle";
import { useState } from "react";

const resolveHref = (link, variant) => {
	if (variant === "dark" && link.darkHref) return link.darkHref;
	return link.href;
};

export default function Header({ variant = "light" }) {
	const { language } = useLanguage();
	const content = aesContent[language];
	const [openDropdown, setOpenDropdown] = useState(null);

	return (
		<header className="main-nav-sub full-wrapper">
			<div className="nav-logo-wrap local-scroll">
				<Link
					href="/"
					className="logo"
					aria-label={content.schoolIdentity.name}
				>
					<Image
						src="/assets/img/logo/logo-rw.svg"
						alt={content.schoolIdentity.name}
						width={150}
						height={55}
						priority
						style={{ height: "auto", width: "auto" }}
					/>
				</Link>
			</div>{" "}
			<button
				type="button"
				className="mobile-nav"
				onClick={toggleMobileMenu}
				aria-label="Abrir menu"
			>
				<i className="mobile-nav-icon" />
			</button>
			<nav className="inner-nav desktop-nav" aria-label="Menu principal">
				<ul className="clearlist local-scroll">
					{content.navLinks.map((link, index) => {
						if (link.dropdown) {
							// Nav item with dropdown
							return (
								<li
									key={index}
									className="mn-has-sub"
									onMouseEnter={() => setOpenDropdown(index)}
									onMouseLeave={() => setOpenDropdown(null)}
								>
									<a className="mn-group-title">{link.label}</a>
									<ul
										className="mn-sub to-left"
										style={{
											display: openDropdown === index ? "block" : "none",
										}}
									>
										{link.dropdown.map((item, itemIndex) => {
											if (item.subItems) {
												// Dropdown item with sub-items (nested)
												return (
													<li key={itemIndex} className="mn-has-sub">
														<span className="mn-group-title">
															{item.label}
														</span>
														<ul className="mn-sub">
															{item.subItems.map((subItem, subIndex) => (
																<li key={subIndex}>
																	<Link href={subItem.href}>
																		{subItem.label}
																	</Link>
																</li>
															))}
														</ul>
													</li>
												);
											} else {
												// Dropdown item without sub-items
												return (
													<li key={itemIndex}>
														<Link href={item.href}>{item.label}</Link>
													</li>
												);
											}
										})}
									</ul>
								</li>
							);
						} else {
							// Simple nav link without dropdown
							return (
								<li key={link.href || index}>
									<Link href={resolveHref(link, variant)}>
										{link.label}
									</Link>
								</li>
							);
						}
					})}
				</ul>
				<ul className="items-end clearlist">
					<ThemeToggle variant={variant} />
					<LanguageSelect variant={variant} />
					<li>
						<Link href="/contactos" className="opacity-1 no-hover">
							<span
								className="link-hover-anim underline"
								data-link-animate="y"
							>
								<span className="link-strong link-strong-unhovered">
									{content.headerCtaLabel}
								</span>
								<span
									className="link-strong link-strong-hovered"
									aria-hidden="true"
								>
									{content.headerCtaLabel}
								</span>
							</span>
						</Link>
					</li>
				</ul>
			</nav>
		</header>
	);
}
