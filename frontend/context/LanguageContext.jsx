"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AES_LANGUAGES, DEFAULT_LANGUAGE } from "@/data/aesContent";

const LanguageContext = createContext({
	language: DEFAULT_LANGUAGE,
	setLanguage: () => {},
	languages: AES_LANGUAGES,
	isReady: false,
});

const STORAGE_KEY = "aes-language";

export function LanguageProvider({ children }) {
	const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		const loadPreference = () => {
			const stored =
				typeof window !== "undefined"
					? window.localStorage.getItem(STORAGE_KEY)
					: null;
			if (stored && AES_LANGUAGES.some(lang => lang.code === stored)) {
				setLanguage(stored);
				setIsReady(true);
				return;
			}
			if (typeof navigator !== "undefined") {
				const browserCode = navigator.language?.split("-")?.[0];
				if (
					browserCode &&
					AES_LANGUAGES.some(lang => lang.code === browserCode)
				) {
					setLanguage(browserCode);
				}
			}
			setIsReady(true);
		};

		loadPreference();
	}, []);

	const handleLanguageChange = code => {
		setLanguage(code);
		if (typeof window !== "undefined") {
			window.localStorage.setItem(STORAGE_KEY, code);
		}
	};

	const value = useMemo(
		() => ({
			language,
			setLanguage: handleLanguageChange,
			languages: AES_LANGUAGES,
			isReady,
		}),
		[language, isReady]
	);

	return (
		<LanguageContext.Provider value={value}>
			{children}
		</LanguageContext.Provider>
	);
}

export const useLanguage = () => useContext(LanguageContext);
