"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEntidadeContext } from "@/context";

interface EntidadeSelectorProps {
	variant?: "desktop" | "mobile";
	className?: string;
}

const EntidadeSelector: React.FC<EntidadeSelectorProps> = ({
	variant = "desktop",
	className = "",
}) => {
	const { t } = useTranslation("shared");
	const { entidades, selectedEntidade, setSelectedEntidade, loading, error } =
		useEntidadeContext();

	const [isOpen, setIsOpen] = useState(false);
	const [focusedIndex, setFocusedIndex] = useState(-1);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// All options including "All entities"
	const allOptions = [null, ...entidades];

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
				setFocusedIndex(-1);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Keyboard navigation
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (!isOpen) return;

			switch (event.key) {
				case "Escape":
					setIsOpen(false);
					setFocusedIndex(-1);
					break;
				case "ArrowDown":
					event.preventDefault();
					setFocusedIndex(prev =>
						prev < allOptions.length - 1 ? prev + 1 : 0
					);
					break;
				case "ArrowUp":
					event.preventDefault();
					setFocusedIndex(prev =>
						prev > 0 ? prev - 1 : allOptions.length - 1
					);
					break;
				case "Enter":
				case " ":
					event.preventDefault();
					if (focusedIndex >= 0) {
						handleEntidadeSelect(allOptions[focusedIndex]);
					}
					break;
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, focusedIndex, allOptions]);

	const handleEntidadeSelect = (entidade: typeof selectedEntidade) => {
		setSelectedEntidade(entidade);
		setIsOpen(false);
		setFocusedIndex(-1);
	};

	const getDropdownStyles = () => {
		if (variant === "mobile") {
			return {
				container: "w-100",
				trigger: `w-100 px-4 py-3 rounded-3 entidade-selector-trigger`,
				dropdown: "w-100 mt-2",
				option: "px-4 py-3",
			};
		}

		// Desktop styles - position dropdown to the left
		return {
			container: "position-relative",
			trigger: `px-3 py-2 rounded-2 entidade-selector-trigger`,
			dropdown: "position-absolute top-100 end-0 mt-1",
			option: "px-3 py-2",
		};
	};

	const dropdownStyles = getDropdownStyles();

	if (loading) {
		return (
			<div
				className={`d-flex align-items-center ${dropdownStyles.container} ${className}`}
			>
				<div
					className={`d-flex align-items-center justify-content-center bg-light ${dropdownStyles.trigger} entidade-selector-loading`}
					style={{
						minWidth: variant === "mobile" ? "auto" : "180px",
						minHeight: variant === "mobile" ? "48px" : "40px",
					}}
				>
					<motion.div
						animate={{ rotate: 360 }}
						transition={{
							duration: 1,
							repeat: Infinity,
							ease: "linear",
						}}
					>
						<div
							className="spinner-border spinner-border-sm text-primary"
							role="status"
							style={{ width: "1rem", height: "1rem" }}
						>
							<span className="visually-hidden">
								{t("entity.loading")}
							</span>
						</div>
					</motion.div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div
				className={`d-flex align-items-center ${dropdownStyles.container} ${className}`}
			>
				<div
					className={`d-flex align-items-center bg-danger bg-opacity-10 text-danger ${dropdownStyles.trigger}`}
					style={{
						minWidth: variant === "mobile" ? "auto" : "180px",
					}}
				>
					<small>{t("entity.error")}</small>
				</div>
			</div>
		);
	}

	if (entidades.length === 0) {
		return (
			<div
				className={`d-flex align-items-center ${dropdownStyles.container} ${className}`}
			>
				<div
					className={`d-flex align-items-center bg-light text-muted ${dropdownStyles.trigger}`}
					style={{
						minWidth: variant === "mobile" ? "auto" : "180px",
					}}
				>
					<small>{t("entity.none")}</small>
				</div>
			</div>
		);
	}

	return (
		<div
			className={`${dropdownStyles.container} ${className}`}
			ref={dropdownRef}
		>
			{/* Custom Dropdown Trigger */}
			<motion.div
				className={`d-flex align-items-center justify-content-between bg-white ${dropdownStyles.trigger} cursor-pointer`}
				style={{
					minWidth: variant === "mobile" ? "auto" : "200px",
					border: "1px solid #e9ecef",
					cursor: "pointer",
					transition: "all 0.2s ease",
				}}
				onClick={() => setIsOpen(!isOpen)}
				onKeyDown={e => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						setIsOpen(!isOpen);
					}
				}}
				tabIndex={0}
				role="combobox"
				aria-expanded={isOpen}
				aria-haspopup="listbox"
				whileHover={{
					borderColor: "#dee2e6",
				}}
				whileTap={{ scale: 0.98 }}
				animate={{
					borderColor: isOpen ? "#dee2e6" : "#e9ecef",
				}}
			>
				<div className="d-flex align-items-center flex-grow-1 overflow-hidden">
					<div className="me-2 text-muted flex-shrink-0">
						<Building2 size={variant === "mobile" ? 18 : 16} />
					</div>
					<span
						className={`fw-medium ${
							variant === "mobile" ? "fs-6" : "fs-7"
						} text-truncate`}
					>
						{selectedEntidade
							? selectedEntidade.displayName
							: variant === "mobile"
							? t("entity.select")
							: t("entity.all")}
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

			{/* Custom Dropdown Menu */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						className={`bg-white border rounded-3 shadow-lg ${dropdownStyles.dropdown} entidade-selector-dropdown`}
						style={{
							zIndex: 1060,
							minWidth: variant === "mobile" ? "100%" : "220px",
							maxHeight: "300px",
							overflowY: "auto",
						}}
						initial={{ opacity: 0, y: -10, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -10, scale: 0.95 }}
						transition={{ duration: 0.2, ease: "easeOut" }}
						role="listbox"
						aria-label="Selecionar entidade"
					>
						{/* "All entities" option */}
						<motion.div
							className={`d-flex align-items-center ${dropdownStyles.option} cursor-pointer entidade-selector-option`}
							style={{
								cursor: "pointer",
								backgroundColor:
									focusedIndex === 0
										? "#e9ecef"
										: "transparent",
							}}
							onClick={() => handleEntidadeSelect(null)}
							whileHover={{ backgroundColor: "#f8f9fa" }}
							whileTap={{ scale: 0.98 }}
							role="option"
							aria-selected={!selectedEntidade}
						>
							<div className="me-3" style={{ width: "20px" }}>
								{!selectedEntidade && (
									<motion.div
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										transition={{ duration: 0.2 }}
									>
										<Check
											size={16}
											className="text-success"
										/>
									</motion.div>
								)}
							</div>
							<div className="flex-grow-1 overflow-hidden">
								<div className="fw-medium text-truncate">
									{variant === "mobile"
										? t("entity.all")
										: t("entity.all")}
								</div>
								<small className="text-muted text-truncate d-block">
									{t("entity.select")}
								</small>
							</div>
						</motion.div>
						{/* Entity options */}
						{entidades.map((entidade, index) => (
							<motion.div
								key={entidade.value}
								className={`d-flex align-items-center ${dropdownStyles.option} cursor-pointer entidade-selector-option`}
								style={{
									cursor: "pointer",
									backgroundColor:
										focusedIndex === index + 1
											? "#e9ecef"
											: "transparent",
								}}
								onClick={() => handleEntidadeSelect(entidade)}
								whileHover={{ backgroundColor: "#f8f9fa" }}
								whileTap={{ scale: 0.98 }}
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{
									delay: index * 0.05,
									duration: 0.2,
								}}
								role="option"
								aria-selected={
									selectedEntidade?.value === entidade.value
								}
							>
								<div
									className="me-3 flex-shrink-0"
									style={{ width: "20px" }}
								>
									{selectedEntidade?.value ===
										entidade.value && (
										<motion.div
											initial={{ scale: 0 }}
											animate={{ scale: 1 }}
											transition={{ duration: 0.2 }}
										>
											<Check
												size={16}
												className="text-success"
											/>
										</motion.div>
									)}
								</div>
								<div className="flex-grow-1 overflow-hidden">
									<div
										className="fw-medium text-truncate"
										title={entidade.displayName}
									>
										{entidade.displayName}
									</div>
								</div>
							</motion.div>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default EntidadeSelector;
