"use client";
import { useLanguage } from "@/context/LanguageContext";
import { useState } from "react";

const languageNames = {
	pt: "Português",
	en: "English",
};

export default function LanguageSelect({ variant = "light" }) {
	const { language, setLanguage, languages, isReady } = useLanguage();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	const toggleDropdown = () => {
		setIsDropdownOpen(!isDropdownOpen);
	};

	const handleLanguageSelect = (langCode) => {
		setLanguage(langCode);
		setIsDropdownOpen(false);
	};

	return (
		<li className="languageSelect">
			<a
				href="#"
				className="mn-has-sub opacity-1"
				onClick={(e) => {
					e.preventDefault();
					toggleDropdown();
				}}
			>
				{language.toUpperCase()} <i className="mi-chevron-down" />
			</a>

			{/* Dropdown menu with sliding effect */}
			<ul
				className={`mn-sub to-left ${isDropdownOpen ? "open" : "closed"}`}
			>
				{languages.map((lang) => (
					<li key={lang.code}>
						<a
							href="#"
							onClick={(e) => {
								e.preventDefault();
								handleLanguageSelect(lang.code);
							}}
							className={language === lang.code ? "active" : ""}
						>
							{languageNames[lang.code] || lang.label}
						</a>
					</li>
				))}
			</ul>
		</li>
	);
}
