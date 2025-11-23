"use client";
import { aesContent } from "@/data/aesContent";
import { toggleMobileMenu } from "@/utlis/toggleMobileMenu";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import LanguageSelect from "./LanguageSelect";

const resolveHref = (link, variant) => {
	if (variant === "dark" && link.darkHref) return link.darkHref;
	return link.href;
};

export default function Header({ variant = "light" }) {
	const { language } = useLanguage();
	const content = aesContent[language];

	return (
		<header className="main-nav-sub full-wrapper">
			<div className="nav-logo-wrap local-scroll">
				<Link
					href="/"
					className="logo"
					aria-label={content.schoolIdentity.name}
				>
					<span className="logo-text fw-bold">
						{content.schoolIdentity.shortName || content.schoolIdentity.name}
					</span>
				</Link>
			</div>

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
					{content.navLinks.map(link => (
						<li key={link.href}>
							<Link href={resolveHref(link, variant)}>
								{link.label}
							</Link>
						</li>
					))}
				</ul>
				<ul className="items-end clearlist">
					<LanguageSelect variant={variant} />
					<li>
						<Link
							href={
								variant === "dark"
									? "/contactos-dark"
									: "/contactos"
							}
							className="opacity-1 no-hover"
						>
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
