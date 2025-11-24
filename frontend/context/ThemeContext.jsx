"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext({
	theme: "light",
	setTheme: () => {},
	isReady: false,
});

const STORAGE_KEY = "aes-theme";
const THEMES = ["light", "dark"];

export function ThemeProvider({ children }) {
	const [theme, setTheme] = useState("light");
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		const loadPreference = () => {
			const stored =
				typeof window !== "undefined"
					? window.localStorage.getItem(STORAGE_KEY)
					: null;

			if (stored && THEMES.includes(stored)) {
				setTheme(stored);
				setIsReady(true);
				return;
			}

			// Check system preference
			if (typeof window !== "undefined" && window.matchMedia) {
				const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
				setTheme(prefersDark ? "dark" : "light");
			}

			setIsReady(true);
		};

		loadPreference();
	}, []);

	const handleThemeChange = (newTheme) => {
		setTheme(newTheme);
		if (typeof window !== "undefined") {
			window.localStorage.setItem(STORAGE_KEY, newTheme);
		}
	};

	const value = useMemo(
		() => ({
			theme,
			setTheme: handleThemeChange,
			isReady,
		}),
		[theme, isReady]
	);

	return (
		<ThemeContext.Provider value={value}>
			{children}
		</ThemeContext.Provider>
	);
}

export const useTheme = () => useContext(ThemeContext);
