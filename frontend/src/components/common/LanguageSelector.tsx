"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLanguageContext } from "@/context";

interface LanguageSelectorProps {
    variant?: "desktop" | "mobile";
    className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
    variant = "desktop",
    className = ""
}) => {
    const { t } = useTranslation(["shared"]);
    const {
        languages,
        selectedLanguage,
        setSelectedLanguage,
        loading,
        error
    } = useLanguageContext();

    const [isOpen, setIsOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setFocusedIndex(-1);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isOpen) return;

            switch (event.key) {
                case 'Escape':
                    setIsOpen(false);
                    setFocusedIndex(-1);
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    setFocusedIndex(prev =>
                        prev < languages.length - 1 ? prev + 1 : 0
                    );
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    setFocusedIndex(prev =>
                        prev > 0 ? prev - 1 : languages.length - 1
                    );
                    break;
                case 'Enter':
                case ' ':
                    event.preventDefault();
                    if (focusedIndex >= 0) {
                        handleLanguageSelect(languages[focusedIndex]);
                    }
                    break;
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, focusedIndex, languages]);

    const handleLanguageSelect = (language: typeof selectedLanguage) => {
        setSelectedLanguage(language);
        setIsOpen(false);
        setFocusedIndex(-1);
    };

    const getDropdownStyles = () => {
        if (variant === "mobile") {
            return {
                container: "w-100",
                trigger: `w-100 px-4 py-3 rounded-3 language-selector-trigger`,
                dropdown: "w-100 mt-2",
                option: "px-4 py-3"
            };
        }

        return {
            container: "position-relative",
            trigger: `px-3 py-2 rounded-2 language-selector-trigger`,
            dropdown: "position-absolute top-100 end-0 mt-1",
            option: "px-3 py-2"
        };
    };

    const dropdownStyles = getDropdownStyles();

    if (loading) {
        return (
            <div className={`d-flex align-items-center ${dropdownStyles.container} ${className}`}>
                <div
                    className={`d-flex align-items-center justify-content-center bg-light ${dropdownStyles.trigger} language-selector-loading`}
                    style={{
                        minWidth: variant === "mobile" ? "auto" : "120px",
                        minHeight: variant === "mobile" ? "48px" : "40px"
                    }}
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <div
                            className="spinner-border spinner-border-sm text-primary"
                            role="status"
                            style={{ width: "1rem", height: "1rem" }}
                        >
                            <span className="visually-hidden">{t("language.loading")}</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`d-flex align-items-center ${dropdownStyles.container} ${className}`}>
                <div
                    className={`d-flex align-items-center bg-danger bg-opacity-10 text-danger ${dropdownStyles.trigger}`}
                    style={{ minWidth: variant === "mobile" ? "auto" : "120px" }}
                >
                    <small>{t("language.error")}</small>
                </div>
            </div>
        );
    }

    if (languages.length === 0) {
        return (
            <div className={`d-flex align-items-center ${dropdownStyles.container} ${className}`}>
                <div
                    className={`d-flex align-items-center bg-light text-muted ${dropdownStyles.trigger}`}
                    style={{ minWidth: variant === "mobile" ? "auto" : "120px" }}
                >
                    <small>{t("language.none")}</small>
                </div>
            </div>
        );
    }

    return (
        <div className={`${dropdownStyles.container} ${className}`} ref={dropdownRef}>
            <motion.div
                className={`d-flex align-items-center justify-content-between bg-white ${dropdownStyles.trigger} cursor-pointer`}
                style={{
                    minWidth: variant === "mobile" ? "auto" : "140px",
                    border: "1px solid #e9ecef",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                }}
                onClick={() => setIsOpen(!isOpen)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setIsOpen(!isOpen);
                    }
                }}
                tabIndex={0}
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                whileHover={{
                    borderColor: "#dee2e6"
                }}
                whileTap={{ scale: 0.98 }}
                animate={{
                    borderColor: isOpen ? "#dee2e6" : "#e9ecef"
                }}
            >
                <div className="d-flex align-items-center flex-grow-1 overflow-hidden">
                    <div className="me-2 text-muted flex-shrink-0">
                        <Globe size={variant === "mobile" ? 18 : 16} />
                    </div>
                    <span className={`fw-medium ${variant === "mobile" ? "fs-6" : "fs-7"} text-truncate`}>
                        {selectedLanguage.flag}
                    </span>
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-muted"
                >
                    <ChevronDown size={variant === "mobile" ? 18 : 16} />
                </motion.div>
            </motion.div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={`bg-white border rounded-3 shadow-lg ${dropdownStyles.dropdown} language-selector-dropdown`}
                        style={{
                            zIndex: 1060,
                            minWidth: variant === "mobile" ? "100%" : "180px",
                            maxHeight: "300px",
                            overflowY: "auto"
                        }}
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        role="listbox"
                        aria-label="Selecionar idioma"
                    >
                        {languages.map((language, index) => (
                            <motion.div
                                key={language.code + (language.region || '')}
                                className={`d-flex align-items-center ${dropdownStyles.option} cursor-pointer language-selector-option`}
                                style={{
                                    cursor: "pointer",
                                    backgroundColor: focusedIndex === index ? "#e9ecef" : "transparent"
                                }}
                                onClick={() => handleLanguageSelect(language)}
                                whileHover={{ backgroundColor: "#f8f9fa" }}
                                whileTap={{ scale: 0.98 }}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.2 }}
                                role="option"
                                aria-selected={selectedLanguage.code === language.code && selectedLanguage.region === language.region}
                            >
                                <div className="me-3 flex-shrink-0" style={{ width: "20px" }}>
                                    {selectedLanguage.code === language.code && selectedLanguage.region === language.region && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Check size={16} className="text-success" />
                                        </motion.div>
                                    )}
                                </div>
                                <div className="me-3 flex-shrink-0">
                                    <span style={{ fontSize: "1.2em" }}>{language.flag}</span>
                                </div>
                                <div className="flex-grow-1 overflow-hidden">
                                    <div className="fw-medium text-truncate" title={language.name}>{language.name}</div>
                                    {language.region && (
                                        <small className="text-muted text-truncate d-block" title={language.region}>{language.region}</small>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LanguageSelector;