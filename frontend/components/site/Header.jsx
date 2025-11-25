"use client";
import { aesContent } from "@/data/aesContent";
import { toggleMobileMenu } from "@/utlis/toggleMobileMenu";
import { init_classic_menu_resize } from "@/utlis/menuToggle";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import Image from "next/image";
import LanguageSelect from "./LanguageSelect";
import ThemeToggle from "./ThemeToggle";
import { useState, useEffect } from "react";

const resolveHref = (link, variant) => {
	if (variant === "dark" && link.darkHref) return link.darkHref;
	return link.href;
};

export default function Header({ variant = "light" }) {
	const { language } = useLanguage();
	const content = aesContent[language];
	const [menuOpen, setMenuOpen] = useState(-1);

	const toggleDropdown = (i) => {
		if (menuOpen === i) {
			setMenuOpen(-1);
		} else {
			setMenuOpen(i);
		}
	};

	useEffect(() => {
		init_classic_menu_resize();
		window.addEventListener("resize", init_classic_menu_resize);
		return () => {
			window.removeEventListener("resize", init_classic_menu_resize);
		};
	}, []);

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
							// Check if all items are simple links (no subItems)
							const hasOnlySimpleLinks = link.dropdown.every(
								item => !item.subItems || item.subItems.length === 0
							);

							// Nav item with dropdown
							return (
								<li
									key={index}
									className={menuOpen === index ? "js-opened" : ""}
								>
									<a
										href="#"
										onClick={() => toggleDropdown(index)}
										className="mn-has-sub"
									>
										{link.label} <i className="mi-chevron-down" />
									</a>
									<ul
										className={`${hasOnlySimpleLinks ? "mn-sub" : "mn-sub mn-has-multi"} ${menuOpen === index ? "mobile-sub-active" : ""}`}
									>
										{hasOnlySimpleLinks ? (
											// Simple vertical list
											link.dropdown.map((item, itemIndex) => (
												<li key={itemIndex}>
													<Link href={item.href}>
														{item.labels[language]}
													</Link>
												</li>
											))
										) : (
											// Multi-column layout
											link.dropdown.map((column, columnIndex) => (
												<li key={columnIndex} className="mn-sub-multi">
													{/* Column Header */}
													{column.isLink && column.href ? (
														<Link href={column.href} className="mn-group-title">
															{column.labels[language]}
														</Link>
													) : (
														<span className="mn-group-title">
															{column.labels[language]}
														</span>
													)}

													{/* Column Items */}
													{column.subItems && column.subItems.length > 0 ? (
														<ul>
															{column.subItems.map((subItem, subIndex) => (
																<li key={subIndex}>
																	<Link href={subItem.href}>
																		{subItem.labels[language]}
																	</Link>
																</li>
															))}
														</ul>
													) : null}
												</li>
											))
										)}
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
