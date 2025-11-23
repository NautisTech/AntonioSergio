"use client";

import React, { createContext, useContext, useMemo, useCallback, useState, useEffect } from "react";
import { IdiomaInterface, Idioma, DEFAULT_LANGUAGE } from "@/models";
import { useLanguageHook } from "@/hooks";
import i18n from "@/context/I18n";

export interface LanguageContextProps {
    languages: IdiomaInterface[];
    selectedLanguage: IdiomaInterface;
    setSelectedLanguage: (language: IdiomaInterface) => void;
    loading: boolean;
    error: string | null;
    getLanguageByCode: (code: string) => IdiomaInterface | undefined;
}

const LanguageContext = createContext<LanguageContextProps>({} as LanguageContextProps);

export const useLanguageContext = () => useContext(LanguageContext);

const STORAGE_KEY = "selectedLanguage";

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedLanguage, setSelectedLanguageState] = useState<IdiomaInterface>(DEFAULT_LANGUAGE);
    const [isStorageLoaded, setIsStorageLoaded] = useState(false);

    const {
        data: languages = [],
        isLoading: loading,
        error: fetchError
    } = useLanguageHook();

    useEffect(() => {
        const storedLanguage = localStorage.getItem(STORAGE_KEY);
        if (storedLanguage) {
            try {
                const parsedLanguage = JSON.parse(storedLanguage);
                const existingLanguage = languages.find(lang =>
                    lang.code === parsedLanguage.code && lang.region === parsedLanguage.region
                );
                if (existingLanguage) {
                    setSelectedLanguageState(existingLanguage);
                    i18n.changeLanguage(existingLanguage.code);
                } else {
                    localStorage.removeItem(STORAGE_KEY);
                }
            } catch (error) {
                localStorage.removeItem(STORAGE_KEY);
            }
        } else {
            i18n.changeLanguage(DEFAULT_LANGUAGE.code);
        }
        setIsStorageLoaded(true);
    }, [languages]);

    const setSelectedLanguage = useCallback((language: IdiomaInterface) => {
        setSelectedLanguageState(language);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(language));
        i18n.changeLanguage(language.code);
    }, []);

    const getLanguageByCode = useCallback((code: string) => {
        return languages.find(lang => lang.code === code ||
            (lang.region && `${lang.code}-${lang.region}` === code));
    }, [languages]);

    const error = fetchError ? `Erro ao carregar idiomas: ${fetchError}` : null;

    const value = useMemo(
        () => ({
            languages,
            selectedLanguage,
            setSelectedLanguage,
            loading: !isStorageLoaded || loading,
            error,
            getLanguageByCode,
        }),
        [languages, selectedLanguage, setSelectedLanguage, loading, error, isStorageLoaded, getLanguageByCode]
    );

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};