"use client";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useBanners } from "@/lib/api/public-content";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import AnimatedText from "@/components/common/AnimatedText";

export default function BannerSlider() {
	const { language } = useLanguage();
	const { theme } = useTheme();
	const isDark = theme === "dark";

	// Fetch banners from API
	const {
		data: bannersData,
		loading,
		error,
	} = useBanners({
		pageSize: 10,
		featuredOnly: false,
	});

	const banners = bannersData?.data || [];

	// Show skeleton while loading
	if (loading) {
		return (
			<section
				className={`home-section fullwidth-slider-fade ${
					isDark ? "bg-dark light-content" : "bg-light dark-content"
				} overflow-hidden position-relative p-0`}
				style={{ height: "100vh" }}
			>
				<div
					className="d-flex align-items-center justify-content-center"
					style={{ height: "100%" }}
				>
					<div className="container">
						<div className="home-content text-center w-100">
							<div className="row">
								<div className="col-md-10 offset-md-1 col-lg-8 offset-lg-2">
									{/* Title skeleton */}
									<div
										className="mb-30 mb-sm-20"
										style={{
											height: "80px",
											backgroundColor: isDark
												? "rgba(255, 255, 255, 0.1)"
												: "rgba(0, 0, 0, 0.1)",
											borderRadius: "8px",
											animation:
												"pulse 1.5s ease-in-out infinite",
										}}
									></div>
									{/* Subtitle skeleton */}
									<div
										className="mb-0"
										style={{
											height: "40px",
											backgroundColor: isDark
												? "rgba(255, 255, 255, 0.08)"
												: "rgba(0, 0, 0, 0.08)",
											borderRadius: "8px",
											animation:
												"pulse 1.5s ease-in-out infinite",
											animationDelay: "0.2s",
										}}
									></div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<style jsx>{`
					@keyframes pulse {
						0%,
						100% {
							opacity: 1;
						}
						50% {
							opacity: 0.5;
						}
					}
				`}</style>
			</section>
		);
	}

	// Don't render if error or no banners
	if (error || banners.length === 0) {
		return null;
	}

	return (
		<section
			className="home-section fullwidth-slider-fade bg-dark light-content overflow-hidden position-relative p-0"
			style={{ height: "100vh" }}
		>
			<Swiper
				spaceBetween={0}
				slidesPerView={1}
				modules={[Navigation, Pagination, Autoplay]}
				autoplay={{
					delay: 5000,
					disableOnInteraction: false,
					pauseOnMouseEnter: true,
				}}
				navigation={{
					prevEl: ".banner-prev",
					nextEl: ".banner-next",
				}}
				pagination={{
					el: ".banner-pagination",
					clickable: true,
					bulletActiveClass: "active",
					renderBullet: (index, className) => {
						return `<div class="owl-page ${className}">
						<span></span>
					</div>`;
					},
				}}
				watchSlidesProgress
				resizeObserver
				loop={banners.length > 1}
				grabCursor={true}
				touchRatio={1}
				simulateTouch={true}
				className="fullwidth-slider-fade bg-dark light-content owl-carousel owl-theme overflow-hidden"
				style={{
					opacity: 1,
					display: "block",
					height: "100%",
				}}
			>
				{banners.map((banner, index) => (
					<SwiperSlide
						className="owl-item"
						key={banner.id || index}
						style={{ height: "100vh" }}
					>
						<section
							className="home-section bg-scroll bg-dark-alpha-50 light-content d-flex align-items-center"
							style={{
								backgroundImage: banner.featured_image
									? `url(${banner.featured_image})`
									: "none",
								backgroundSize: "cover",
								backgroundPosition: "center",
								height: "100%",
							}}
						>
							<div className="container">
								{/* Banner Content */}
								<div className="home-content text-center w-100">
									<div className="row">
										<div className="col-md-10 offset-md-1 col-lg-8 offset-lg-2">
											{banner.title && (
												<h1 className="hs-title-9 mb-30 mb-sm-20">
													<AnimatedText
														text={banner.title}
													/>
												</h1>
											)}
											{banner.excerpt && (
												<h2 className="section-descr mb-0">
													<AnimatedText
														text={banner.excerpt}
													/>
												</h2>
											)}
										</div>
									</div>
								</div>
								{/* End Banner Content */}
							</div>
						</section>
					</SwiperSlide>
				))}

				{/* Navigation Controls */}
				{banners.length > 1 && (
					<div className="owl-controls clickable">
						<div className="owl-pagination banner-pagination"></div>
						<div className="owl-buttons">
							<div
								className="owl-prev banner-prev"
								role="button"
								tabIndex={0}
								style={{
									position: "absolute",
									top: "50%",
									left: "20px",
									transform: "translateY(-50%)",
									zIndex: 10,
								}}
							>
								<span className="visually-hidden">
									Previous Slide
								</span>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="27px"
									height="57px"
									viewBox="0 0 27 57"
									fill="currentColor"
									aria-hidden="true"
									focusable="false"
								>
									<path d="M5.005,28.500 L27.000,54.494 L24.000,56.994 L0.005,28.500 L24.000,0.006 L27.000,2.506 L5.005,28.500 Z" />
								</svg>
							</div>
							<div
								className="owl-next banner-next"
								role="button"
								tabIndex={0}
								style={{
									position: "absolute",
									top: "50%",
									right: "20px",
									transform: "translateY(-50%)",
									zIndex: 10,
								}}
							>
								<span className="visually-hidden">
									Next Slide
								</span>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="27px"
									height="57px"
									viewBox="0 0 27 57"
									fill="currentColor"
									aria-hidden="true"
									focusable="false"
								>
									<path d="M21.995,28.500 L-0.000,54.494 L3.000,56.994 L26.995,28.500 L3.000,0.006 L-0.000,2.506 L21.995,28.500 Z" />
								</svg>
							</div>
						</div>
					</div>
				)}
			</Swiper>
		</section>
	);
}
