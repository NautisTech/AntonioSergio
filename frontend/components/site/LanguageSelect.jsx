"use client";
import { useLanguage } from "@/context/LanguageContext";

const ariaLabels = {
	pt: "Selecionar idioma",
	en: "Select language",
};

export default function LanguageSelect({ variant = "light" }) {
	const { language, setLanguage, languages, isReady } = useLanguage();
	const isDark = variant === "dark";

	return (
		<div className="language-select-wrap ms-30">
			<label className="visually-hidden" htmlFor="language-select">
				{ariaLabels[language] || ariaLabels.en}
			</label>
			<select
				id="language-select"
				disabled={!isReady}
				value={language}
				onChange={event => setLanguage(event.target.value)}
				className={`form-select form-select-sm border-0 text-uppercase fw-semibold p-0 bg-transparent shadow-none ${
					isDark ? "text-white" : "text-dark"
				}`}
				style={{ minWidth: 80 }}
			>
				{languages.map(lang => (
					<option
						key={lang.code}
						value={lang.code}
						className="text-dark"
					>
						{lang.label}
					</option>
				))}
			</select>
		</div>
	);
}
