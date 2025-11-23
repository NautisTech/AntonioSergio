"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { useMenuItems } from "./menuItems";
import { EntidadeSelector } from "@/components/common";
import LanguageSelector from "@/components/common/LanguageSelector";
// import { useAuthContext } from "@/context";

const Navbar = () => {
	const router = useRouter();
	const { t } = useTranslation(["navigation"]);
	const menuItems = useMenuItems();
	const [openDropdown, setOpenDropdown] = useState<string | null>(null);
	const [hoveringDropdown, setHoveringDropdown] = useState<boolean>(false);
	const [screenWidth, setScreenWidth] = useState<number>(0);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleResize = () => {
			setScreenWidth(window.innerWidth);
		};

		handleResize();

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const getDropdownStyle = () => {
		const isSmallDesktop = screenWidth < 1400;
		const isMediumDesktop = screenWidth < 1600;

		return {
			isSmallDesktop,
			isMediumDesktop,
			maxColumns: isSmallDesktop ? 2 : isMediumDesktop ? 3 : 4,
			columnWidth: isSmallDesktop ? "250px" : "200px",
		};
	};

	const handleDropdown = (menu: string) => {
		const selected = menuItems.find(m => m.title === menu);
		if (!selected?.items || selected.items.length === 0) {
			setOpenDropdown(null);
			return;
		}
		const hasContent = selected.items.length > 0;

		if (!hasContent) {
			setOpenDropdown(null);
			return;
		}

		if (openDropdown === menu) return;
		setOpenDropdown(menu);
	};

	const getNavItemStyle = () => {
		const isSmallDesktop = screenWidth < 1400;
		const isMediumDesktop = screenWidth < 1600;

		return {
			fontSize: isSmallDesktop
				? "1rem"
				: isMediumDesktop
				? "1.05rem"
				: "1.1rem",
			marginRight: isSmallDesktop ? "0.5rem" : "1rem",
		};
	};

	return (
		<div
			className="sticky-top navbar-crimson"
			style={{ zIndex: 1041 }}
			onMouseLeave={() => setOpenDropdown(null)}
		>
			<div
				className={`container-fluid py-3 border-bottom ${
					screenWidth < 1400 ? "px-2" : "px-4"
				}`}
			>
				<div className="row align-items-center">
					<div className="col d-flex justify-content-center">
						<div
							className="d-flex align-items-center"
							style={{
								gap: screenWidth < 1400 ? "0.5rem" : "1rem",
							}}
						>
							<div className="logo">
								<Link href="/">
									<img
										src="/assets/img/logo/logo-trw.svg"
										alt="Agrupamento de Escolas António Sérgio"
										style={{
											maxWidth: "100%",
											maxHeight: "100px",
											width: "auto",
											height: "auto",
											objectFit: "contain",
										}}
									/>
								</Link>
							</div>
							{menuItems.map((menu, index) =>
								menu.items ? (
									<div
										key={index}
										className="nav-link px-3 py-2 fw-semibold position-relative navbar-item"
										style={getNavItemStyle()}
										onMouseEnter={() =>
											handleDropdown(menu.title)
										}
									>
										{menu.title}
									</div>
								) : menu.url ? (
									<Link
										href={menu.url}
										key={index}
										className="text-decoration-none"
									>
										<div
											className="nav-link px-3 py-2 fw-semibold navbar-item"
											style={getNavItemStyle()}
										>
											{menu.title}
										</div>
									</Link>
								) : (
									<div
										key={index}
										className="nav-link px-3 py-2 fw-semibold navbar-item"
										style={getNavItemStyle()}
									>
										{menu.title}
									</div>
								)
							)}
						</div>
					</div>

					<div
						className="col-auto d-flex align-items-center"
						style={{ gap: "1rem" }}
					>
						<LanguageSelector variant="desktop" className="" />
						<EntidadeSelector variant="desktop" className="" />
					</div>
				</div>
			</div>

			<AnimatePresence>
				{openDropdown && (
					<motion.div
						key={openDropdown}
						initial={{ opacity: 0, y: -10, height: 0 }}
						animate={{ opacity: 1, y: 0, height: "auto" }}
						exit={{ opacity: 0, y: -10, height: 0 }}
						transition={{ duration: 0.25, ease: "easeInOut" }}
						className="position-absolute w-100 bg-white border-top shadow overflow-hidden navbar-dropdown-scrollable"
						style={{
							left: 0,
							zIndex: 1050,
							maxHeight: "70vh",
							overflowY: "auto",
						}}
						onMouseEnter={() => setHoveringDropdown(true)}
						onMouseLeave={() => setHoveringDropdown(false)}
						ref={dropdownRef}
					>
						<div className="container-fluid">
							<div
								className={`row justify-content-center py-4 ${
									getDropdownStyle().isSmallDesktop
										? "px-2"
										: "px-3"
								}`}
							>
								<div
									className={`${
										getDropdownStyle().isSmallDesktop
											? "col-12"
											: "col-auto"
									}`}
								>
									{(() => {
										const current =
											menuItems.find(
												menu =>
													menu.title === openDropdown
											)?.items ?? [];
										const grouped = current.filter(
											item => "subItems" in item
										);
										const singles = current.filter(
											item => !("subItems" in item)
										);

										const {
											isSmallDesktop,
											columnWidth,
											maxColumns,
										} = getDropdownStyle();
										const allColumns = [];

										grouped.forEach((item, idx) => {
											allColumns.push(
												<motion.div
													key={`group-${idx}`}
													className={`${
														isSmallDesktop
															? "me-3 mb-3"
															: "me-5"
													}`}
													style={{
														minWidth: columnWidth,
														flex: isSmallDesktop
															? "1 1 auto"
															: "none",
													}}
													variants={{
														hidden: {
															opacity: 0,
															y: 10,
														},
														visible: {
															opacity: 1,
															y: 0,
														},
													}}
												>
													{item.isLink && item.url ? (
														<Link
															href={item.url}
															className="text-decoration-none"
														>
															<div
																className={`fw-bold mb-2 px-2 navbar-dropdown-header ${
																	item.subItems &&
																	item
																		.subItems
																		.length ===
																		0
																		? "text-center"
																		: ""
																}`}
															>
																{item.title}
															</div>
														</Link>
													) : (
														<div
															className={`fw-bold text-dark mb-2 px-2 ${
																item.subItems &&
																item.subItems
																	.length ===
																	0
																	? "text-center"
																	: ""
															}`}
														>
															{item.title}
														</div>
													)}
													<div
														className="d-flex flex-column"
														style={{
															gap: "0.25rem",
														}}
													>
														{item.subItems &&
															item.subItems
																.length > 0 &&
															item.subItems.map(
																(sub, sidx) => (
																	<Link
																		href={
																			sub.url
																		}
																		key={
																			sidx
																		}
																		className="text-decoration-none"
																	>
																		<div className="d-flex align-items-center justify-content-between px-3 py-2 rounded-1 navbar-dropdown-item">
																			<span
																				className={
																					isSmallDesktop
																						? "text-truncate"
																						: ""
																				}
																			>
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
										});

										if (
											grouped.length > 0 &&
											singles.length > 0 &&
											!isSmallDesktop
										) {
											allColumns.push(
												<div
													key="divider"
													className="border-start mx-3"
													style={{
														borderColor:
															"var(--tp-secondary-shade)",
													}}
												></div>
											);
										}

										if (singles.length > 0) {
											allColumns.push(
												<motion.div
													key="singles"
													className={`d-flex flex-column ${
														isSmallDesktop
															? "mt-3 w-100"
															: ""
													}`}
													style={{
														gap: "0.5rem",
														minWidth: columnWidth,
														flex: isSmallDesktop
															? "1 1 auto"
															: "none",
													}}
													variants={{
														hidden: {
															opacity: 0,
															y: 10,
														},
														visible: {
															opacity: 1,
															y: 0,
														},
													}}
												>
													{singles.map((item, idx) =>
														item.isLink &&
														item.url ? (
															<Link
																href={item.url}
																key={idx}
																className="text-decoration-none"
															>
																<div className="d-flex align-items-center justify-content-between px-3 py-2 rounded-1 navbar-dropdown-item">
																	<span
																		className={
																			isSmallDesktop
																				? "text-truncate"
																				: ""
																		}
																	>
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
																href={item.url}
																key={idx}
																className="text-decoration-none"
															>
																<div className="d-flex align-items-center justify-content-between px-3 py-2 rounded-1 navbar-dropdown-item">
																	<span
																		className={
																			isSmallDesktop
																				? "text-truncate"
																				: ""
																		}
																	>
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
																key={idx}
																className="d-flex align-items-center justify-content-between px-3 py-2 rounded-1 navbar-dropdown-item"
															>
																<span
																	className={
																		isSmallDesktop
																			? "text-truncate"
																			: ""
																	}
																>
																	{item.title}
																</span>
																<ChevronRight
																	size={16}
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
												className="d-flex"
												style={{
													flexWrap: isSmallDesktop
														? "wrap"
														: "nowrap",
													justifyContent:
														isSmallDesktop
															? "flex-start"
															: "flex-start",
													gap: isSmallDesktop
														? "0.5rem"
														: "1rem",
													maxWidth: "100%",
													width: isSmallDesktop
														? "100%"
														: "auto",
												}}
												initial="hidden"
												animate="visible"
												variants={{
													hidden: {},
													visible: {
														transition: {
															staggerChildren: 0.05,
														},
													},
												}}
											>
												{allColumns}
											</motion.div>
										);
									})()}
								</div>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default Navbar;
