"use client";
import { featureHighlights } from "@/data/aesContent";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

export default function Features() {
	return (
		<div className="container position-relative">
			<div className="row mb-60 align-items-end">
				<div className="col-lg-6">
					<h2 className="section-caption mb-xs-10">
						{featureHighlights.preTitle}
					</h2>
					<h3 className="section-title mb-20">
						{featureHighlights.title}
					</h3>
				</div>
				<div className="col-lg-6 text-lg-end">
					<p className="section-descr mb-0 text-gray">
						{featureHighlights.description}
					</p>
				</div>
			</div>
			<div className="wow fadeInUp">
				<div className="relative">
					<Swiper
						spaceBetween={0}
						breakpoints={{
							1199: {
								slidesPerView: 3, // When window width is <= 1199px
							},
							768: {
								slidesPerView: 2, // When window width is <= 768px
							},
							480: {
								slidesPerView: 1, // When window width is <= 480px
							},
							200: {
								slidesPerView: 1, // When window width is <= 200px
							},
						}}
						modules={[Navigation, Pagination]}
						loop
						navigation={{
							prevEl: ".snbp3",
							nextEl: ".snbn3",
						}}
						pagination={{
							el: ".sp1",
							clickable: true,
							bulletActiveClass: "active",
							renderBullet: (index, className) => {
								return `<div class=" owl-page ${className}">
                   <span></span>
                  </div>`;
							},
						}}
						watchSlidesProgress
						resizeObserver
						className="item-carousel owl-carousel owl-theme overflow-hidden position-static"
						style={{
							opacity: 1,
							display: "block",
						}}
					>
						{featureHighlights.items.map(item => (
							<SwiperSlide className="owl-item" key={item.title}>
								<div className="features-item">
									<div className="features-icon">
										<i className={item.icon} />
									</div>
									<div className="features-title">
										{item.title}
									</div>
									<div className="features-descr">
										{item.description}
									</div>
								</div>
							</SwiperSlide>
						))}

						<div className="owl-controls clickable">
							<div className="owl-pagination sp1"></div>
							<div className="owl-buttons">
								<div
									className="owl-prev snbp3"
									role="button"
									tabIndex="0"
								>
									<span className="visually-hidden">
										Previous Slide
									</span>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										//   xmlns:xlink="http://www.w3.org/1999/xlink"
										width="27px"
										height="57px"
										viewBox="0 0 27 57"
										fill="currentColor"
										aria-hidden="true"
										focusable="false"
									>
										<path d="M5.005,28.500 L27.000,54.494 L24.000,56.994 L0.005,28.500 L24.000,0.006 L27.000,2.506 L5.005,28.500 Z"></path>
									</svg>
								</div>
								<div
									className="owl-next snbn3"
									role="button"
									tabIndex="0"
								>
									<span className="visually-hidden">
										Next Slide
									</span>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										//   xmlns:xlink="http://www.w3.org/1999/xlink"
										width="27px"
										height="57px"
										viewBox="0 0 27 57"
										fill="currentColor"
										aria-hidden="true"
										focusable="false"
									>
										<path d="M21.995,28.500 L-0.000,54.494 L3.000,56.994 L26.995,28.500 L3.000,0.006 L-0.000,2.506 L21.995,28.500 Z"></path>
									</svg>
								</div>
							</div>
						</div>
						{/* End Team item */}
					</Swiper>
				</div>
			</div>
		</div>
	);
}
