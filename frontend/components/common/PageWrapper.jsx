"use client";
import { useTheme } from "@/context/ThemeContext";
import { useEffect } from "react";

export default function PageWrapper({ children }) {
	const { theme, isReady } = useTheme();

	useEffect(() => {
		// Update body class when theme changes
		if (typeof document !== "undefined") {
			const body = document.body;
			if (theme === "dark") {
				body.classList.add("dark-mode");
			} else {
				body.classList.remove("dark-mode");
			}
		}
	}, [theme]);

	if (!isReady) {
		// Return children without theme classes during initial load
		return <div className="theme-main">{children}</div>;
	}

	return (
		<div className="theme-main">
			<div className={theme === "dark" ? "dark-mode" : ""}>
				{children}
			</div>
		</div>
	);
}
