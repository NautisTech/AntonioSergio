"use client";
import { aesContent, DEFAULT_LANGUAGE } from "@/data/aesContent";
import { useLanguage } from "@/context/LanguageContext";

export function useAesContent() {
	const { language } = useLanguage();
	return aesContent[language] ?? aesContent[DEFAULT_LANGUAGE];
}
