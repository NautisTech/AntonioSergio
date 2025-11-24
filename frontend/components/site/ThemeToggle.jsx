"use client";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle({ variant = "light" }) {
	const { theme, setTheme, isReady } = useTheme();

	const toggleTheme = (e) => {
		e.preventDefault();
		setTheme(theme === "light" ? "dark" : "light");
	};

	if (!isReady) {
		return null;
	}

	return (
		<li className="themeToggle">
			<a
				href="#"
				className="opacity-1"
				onClick={toggleTheme}
				aria-label={theme === "light" ? "Mudar para modo escuro" : "Mudar para modo claro"}
			>
				{theme === "light" ? (
					<i className="mi-moon size-24" />
				) : (
					<i className="mi-sun size-24" />
				)}
			</a>
		</li>
	);
}
