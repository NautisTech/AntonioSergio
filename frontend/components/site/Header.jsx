"use client";
import { navLinks, schoolIdentity } from "@/data/aesContent";
import { toggleMobileMenu } from "@/utlis/toggleMobileMenu";
import Link from "next/link";

const resolveHref = (link, variant) => {
	if (variant === "dark" && link.darkHref) return link.darkHref;
	return link.href;
};

export default function Header({ variant = "light" }) {
	return (
		<header className="main-nav-sub full-wrapper">
			<div className="nav-logo-wrap local-scroll">
				<Link
					href="/"
					className="logo"
					aria-label={schoolIdentity.name}
				>
					<span className="logo-text fw-bold">
						{schoolIdentity.shortName || schoolIdentity.name}
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
					{navLinks.map(link => (
						<li key={link.href}>
							<Link href={resolveHref(link, variant)}>
								{link.label}
							</Link>
						</li>
					))}
				</ul>
				<ul className="items-end clearlist">
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
									Fala connosco
								</span>
								<span
									className="link-strong link-strong-hovered"
									aria-hidden="true"
								>
									Fala connosco
								</span>
							</span>
						</Link>
					</li>
				</ul>
			</nav>
		</header>
	);
}
