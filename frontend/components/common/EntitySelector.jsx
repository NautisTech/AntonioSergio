"use client";
import { useEntity } from "@/context/EntityContext";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect, useRef } from "react";

export default function EntitySelector() {
	const { entities, selectedEntity, setSelectedEntity } = useEntity();
	const { language } = useLanguage();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef(null);

	const labels = {
		pt: {
			all: "Todas as Escolas",
		},
		en: {
			all: "All Schools",
		},
	};

	const t = labels[language];

	const toggleDropdown = () => {
		setIsDropdownOpen(!isDropdownOpen);
	};

	const handleEntitySelect = (entity) => {
		setSelectedEntity(entity);
		setIsDropdownOpen(false);
	};

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target)
			) {
				setIsDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const displayText = selectedEntity
		? selectedEntity.displayName
		: t.all;

	return (
		<li className="entitySelect" ref={dropdownRef}>
			<a
				href="#"
				className="mn-has-sub opacity-1"
				onClick={(e) => {
					e.preventDefault();
					toggleDropdown();
				}}
			>
				{displayText} <i className="mi-chevron-down" />
			</a>

			{/* Dropdown menu with sliding effect */}
			<ul
				className={`mn-sub to-left ${isDropdownOpen ? "open" : "closed"}`}
				style={{ minWidth: "280px" }}
			>
				{/* "All Schools" option */}
				<li>
					<a
						href="#"
						onClick={(e) => {
							e.preventDefault();
							handleEntitySelect(null);
						}}
						className={!selectedEntity ? "active" : ""}
					>
						{t.all}
					</a>
				</li>

				{/* Individual schools */}
				{entities.map((entity) => (
					<li key={entity.value}>
						<a
							href="#"
							onClick={(e) => {
								e.preventDefault();
								handleEntitySelect(entity);
							}}
							className={
								selectedEntity?.value === entity.value ? "active" : ""
							}
						>
							{entity.displayName}
						</a>
					</li>
				))}
			</ul>
		</li>
	);
}
