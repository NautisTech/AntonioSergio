"use client";
import React, { useState, useRef, useEffect } from "react";
import { useEntity } from "@/context/EntityContext";
import { useLanguage } from "@/context/LanguageContext";

export default function EntitySelector() {
	const { entities, selectedEntity, setSelectedEntity } = useEntity();
	const { language } = useLanguage();
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef(null);

	const labels = {
		pt: {
			all: "Todas as Escolas",
			select: "Selecionar Escola",
		},
		en: {
			all: "All Schools",
			select: "Select School",
		},
	};

	const t = labels[language];

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = event => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleEntitySelect = entity => {
		setSelectedEntity(entity);
		setIsOpen(false);
	};

	const allOptions = [null, ...entities];

	return (
		<div className="position-relative" ref={dropdownRef}>
			<button
				className="btn btn-link dropdown-toggle px-2 py-1"
				onClick={() => setIsOpen(!isOpen)}
				style={{
					color: "inherit",
					textDecoration: "none",
					fontSize: "14px",
					fontWeight: "500",
				}}
				aria-expanded={isOpen}
				aria-haspopup="true"
			>
				<i className="mi-building me-1" style={{ fontSize: "16px" }} />
				<span>
					{selectedEntity
						? selectedEntity.displayName
						: t.all}
				</span>
			</button>

			{isOpen && (
				<div
					className="position-absolute bg-white border rounded shadow-sm"
					style={{
						top: "100%",
						right: 0,
						marginTop: "8px",
						minWidth: "240px",
						maxHeight: "400px",
						overflowY: "auto",
						zIndex: 1060,
					}}
				>
					{allOptions.map((entity, index) => (
						<button
							key={entity?.value || "all"}
							className="w-100 text-start border-0 bg-transparent px-3 py-2 d-flex align-items-center"
							onClick={() => handleEntitySelect(entity)}
							style={{
								cursor: "pointer",
								backgroundColor:
									(entity === null && !selectedEntity) ||
									entity?.value === selectedEntity?.value
										? "#f8f9fa"
										: "transparent",
								transition: "background-color 0.15s ease",
							}}
							onMouseEnter={e => {
								e.currentTarget.style.backgroundColor =
									"#f8f9fa";
							}}
							onMouseLeave={e => {
								e.currentTarget.style.backgroundColor =
									(entity === null && !selectedEntity) ||
									entity?.value === selectedEntity?.value
										? "#f8f9fa"
										: "transparent";
							}}
						>
							<div style={{ width: "20px", marginRight: "12px" }}>
								{((entity === null && !selectedEntity) ||
									entity?.value === selectedEntity?.value) && (
									<i
										className="mi-check"
										style={{ fontSize: "16px", color: "#28a745" }}
									/>
								)}
							</div>
							<div className="flex-grow-1">
								<div
									style={{
										fontWeight:
											(entity === null && !selectedEntity) ||
											entity?.value === selectedEntity?.value
												? "600"
												: "500",
										fontSize: "14px",
									}}
								>
									{entity === null ? t.all : entity.displayName}
								</div>
								{entity === null && (
									<small
										className="text-muted"
										style={{ fontSize: "12px" }}
									>
										{t.select}
									</small>
								)}
							</div>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
