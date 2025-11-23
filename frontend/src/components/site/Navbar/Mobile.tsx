"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useMenuItems } from "./menuItems";
import { EntidadeSelector } from "@/components/common";
import LanguageSelector from "@/components/common/LanguageSelector";
// import { useAuthContext } from "@/context";

const Navbar = ({ onClose }: { onClose: () => void }) => {
	const router = useRouter();
	const { t } = useTranslation(["navigation"]);
	const menuItems = useMenuItems();
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [openSubDropdown, setOpenSubDropdown] = useState<string | null>(null);
	const [screenWidth, setScreenWidth] = useState<number>(0);
	const dropdownRef = useRef<HTMLDivElement>(null);
	// const { isAuthenticated } = useAuthContext();
	const isAuthenticated = false; // Mock value

	// Track screen width for responsive behavior
	useEffect(() => {
		const handleResize = () => {
			setScreenWidth(window.innerWidth);
		};

		handleResize();

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Calculate dropdown styling (matching desktop)
	const getDropdownStyle = () => {
		const isMobile = screenWidth < 1024;

		return {
			isMobile,
			columnWidth: "100%",
			maxColumns: 1,
		};
	};

	const handleMainMenuToggle = () => {
		setIsOpen(!isOpen);
		setOpenSubDropdown(null); // Close any open sub-dropdown
	};

	const handleSubDropdown = (menu: string) => {
		const selected = menuItems.find(m => m.title === menu);
		if (!selected?.items || selected.items.length === 0) {
			setOpenSubDropdown(null);
			return;
		}

		if (openSubDropdown === menu) {
			setOpenSubDropdown(null);
		} else {
			setOpenSubDropdown(menu);
		}
	};

	const handleLinkClick = () => {
		setIsOpen(false);
		setOpenSubDropdown(null);
		onClose();
	};

	return (
		<div
			className="sticky-top navbar-crimson mobile-navbar"
			style={{ zIndex: 1041 }}
		>
			{/* Mobile Header with Logo and Hamburger */}
			<div className="container-fluid px-3 py-3 border-bottom">
				<div className="row align-items-center">
					<div className="col">
						{/* Logo placeholder - replace with your actual logo */}
						<Link href="/" className="text-decoration-none">
							<img
								src="/assets/img/logo/logo-trw.svg"
								alt="Logo"
								style={{ height: "80px" }}
							/>
						</Link>
					</div>
					<div className="col-auto">
						<button
							className="btn p-2"
							onClick={handleMainMenuToggle}
							aria-label="Toggle menu"
						>
							{isOpen ? (
								<X size={24} className="text-white" />
							) : (
								<Menu size={24} className="text-white" />
							)}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile Main Dropdown Menu */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.25, ease: "easeInOut" }}
						className="position-absolute w-100 bg-white border-top shadow navbar-dropdown-scrollable"
						style={{
							left: 0,
							top: "100%",
							zIndex: 1050,
							maxHeight: "80vh",
							overflowY: "auto",
						}}
						ref={dropdownRef}
					>
						<div className="container-fluid py-3">
							<div className="mb-3 px-3">
								<LanguageSelector
									variant="mobile"
									className=""
								/>
							</div>

							{/* Entidade Selector */}
							<div className="mb-3 px-3">
								<EntidadeSelector
									variant="mobile"
									className=""
								/>
							</div>

							{/* Divider */}
							<div className="border-top mx-3 mb-3 border-light-subtle"></div>

							{/* Main menu items */}
							<div
								className="d-flex flex-column"
								style={{ gap: "0.5rem" }}
							>
								{menuItems.map((menu, index) => (
									<div key={index}>
										{menu.items ? (
											<div
												className="d-flex align-items-center justify-content-between px-3 py-3 navbar-dropdown-item rounded-1"
												onClick={() =>
													handleSubDropdown(
														menu.title
													)
												}
											>
												<span className="fw-semibold">
													{menu.title}
												</span>
												<ChevronRight
													size={16}
													className={`opacity-50 ${
														openSubDropdown ===
														menu.title
															? ""
															: ""
													}`}
													style={{
														transform:
															openSubDropdown ===
															menu.title
																? "rotate(90deg)"
																: "rotate(0deg)",
														transition:
															"transform 0.2s ease",
													}}
												/>
											</div>
										) : menu.url ? (
											<Link
												href={menu.url}
												className="text-decoration-none"
												onClick={handleLinkClick}
											>
												<div className="d-flex align-items-center justify-content-between px-3 py-3 navbar-dropdown-item rounded-1">
													<span className="fw-semibold">
														{menu.title}
													</span>
													<ChevronRight
														size={16}
														className="opacity-50"
													/>
												</div>
											</Link>
										) : (
											<div className="d-flex align-items-center justify-content-between px-3 py-3 navbar-dropdown-item rounded-1">
												<span className="fw-semibold">
													{menu.title}
												</span>
												<ChevronRight
													size={16}
													className="opacity-50"
												/>
											</div>
										)}

										{/* Sub-dropdown with desktop styling */}
										<AnimatePresence>
											{openSubDropdown === menu.title &&
												menu.items && (
													<motion.div
														initial={{
															opacity: 0,
															y: -5,
														}}
														animate={{
															opacity: 1,
															y: 0,
														}}
														exit={{
															opacity: 0,
															y: -5,
														}}
														transition={{
															duration: 0.25,
															ease: "easeInOut",
														}}
														className="ms-3 mt-2"
													>
														<div className="rounded p-3">
															{(() => {
																const current =
																	menu.items ??
																	[];
																const grouped =
																	current.filter(
																		item =>
																			"subItems" in
																			item
																	);
																const singles =
																	current.filter(
																		item =>
																			!(
																				"subItems" in
																				item
																			)
																	);
																const allColumns =
																	[];

																// Render grouped items (same logic as desktop)
																grouped.forEach(
																	(
																		item,
																		idx
																	) => {
																		allColumns.push(
																			<motion.div
																				key={`group-${idx}`}
																				className="mb-4"
																				variants={{
																					hidden: {
																						opacity: 0,
																						y: 10,
																					},
																					visible:
																						{
																							opacity: 1,
																							y: 0,
																						},
																				}}
																			>
																				{item.isLink &&
																				item.url ? (
																					<Link
																						href={
																							item.url
																						}
																						className="text-decoration-none"
																						onClick={
																							handleLinkClick
																						}
																					>
																						<div className="fw-bold mb-2 px-2 navbar-dropdown-header">
																							{
																								item.title
																							}
																						</div>
																					</Link>
																				) : (
																					<div className="fw-bold text-dark mb-2 px-2">
																						{
																							item.title
																						}
																					</div>
																				)}
																				<div
																					className="d-flex flex-column"
																					style={{
																						gap: "0.25rem",
																					}}
																				>
																					{item.subItems &&
																						item
																							.subItems
																							.length >
																							0 &&
																						item.subItems.map(
																							(
																								sub,
																								sidx
																							) => (
																								<Link
																									href={
																										sub.url
																									}
																									key={
																										sidx
																									}
																									className="text-decoration-none"
																									onClick={
																										handleLinkClick
																									}
																								>
																									<div className="d-flex align-items-center justify-content-between px-3 py-2 rounded-1 navbar-dropdown-item">
																										<span className="text-truncate">
																											{
																												sub.title
																											}
																										</span>
																										<ChevronRight
																											size={
																												16
																											}
																											className="opacity-25"
																											style={{
																												flexShrink: 0,
																											}}
																										/>
																									</div>
																								</Link>
																							)
																						)}
																				</div>
																			</motion.div>
																		);
																	}
																);

																// Add divider between grouped and single items if both exist
																if (
																	grouped.length >
																		0 &&
																	singles.length >
																		0
																) {
																	allColumns.push(
																		<div
																			key="divider"
																			className="border-top my-3 border-light-subtle"
																		></div>
																	);
																}

																// Render single items (same logic as desktop)
																if (
																	singles.length >
																	0
																) {
																	allColumns.push(
																		<motion.div
																			key="singles"
																			className="d-flex flex-column"
																			style={{
																				gap: "0.5rem",
																			}}
																			variants={{
																				hidden: {
																					opacity: 0,
																					y: 10,
																				},
																				visible:
																					{
																						opacity: 1,
																						y: 0,
																					},
																			}}
																		>
																			{singles.map(
																				(
																					item,
																					idx
																				) =>
																					item.isLink &&
																					item.url ? (
																						<Link
																							href={
																								item.url
																							}
																							key={
																								idx
																							}
																							className="text-decoration-none"
																							onClick={
																								handleLinkClick
																							}
																						>
																							<div className="d-flex align-items-center justify-content-between px-3 py-2 rounded-1 navbar-dropdown-item">
																								<span className="text-truncate">
																									{
																										item.title
																									}
																								</span>
																								<ChevronRight
																									size={
																										16
																									}
																									className="opacity-25"
																									style={{
																										flexShrink: 0,
																									}}
																								/>
																							</div>
																						</Link>
																					) : item.url ? (
																						<Link
																							href={
																								item.url
																							}
																							key={
																								idx
																							}
																							className="text-decoration-none"
																							onClick={
																								handleLinkClick
																							}
																						>
																							<div className="d-flex align-items-center justify-content-between px-3 py-2 rounded-1 navbar-dropdown-item">
																								<span className="text-truncate">
																									{
																										item.title
																									}
																								</span>
																								<ChevronRight
																									size={
																										16
																									}
																									className="opacity-25"
																									style={{
																										flexShrink: 0,
																									}}
																								/>
																							</div>
																						</Link>
																					) : (
																						<div
																							key={
																								idx
																							}
																							className="d-flex align-items-center justify-content-between px-3 py-2 rounded-1 navbar-dropdown-item"
																						>
																							<span className="text-truncate">
																								{
																									item.title
																								}
																							</span>
																							<ChevronRight
																								size={
																									16
																								}
																								className="opacity-25"
																								style={{
																									flexShrink: 0,
																								}}
																							/>
																						</div>
																					)
																			)}
																		</motion.div>
																	);
																}

																return (
																	<motion.div
																		className="d-flex flex-column"
																		style={{
																			gap: "1rem",
																		}}
																		initial="hidden"
																		animate="visible"
																		variants={{
																			hidden: {},
																			visible:
																				{
																					transition:
																						{
																							staggerChildren: 0.05,
																						},
																				},
																		}}
																	>
																		{
																			allColumns
																		}
																	</motion.div>
																);
															})()}
														</div>
													</motion.div>
												)}
										</AnimatePresence>
									</div>
								))}
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default Navbar;
