"use client";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useLanguage } from "@/context/LanguageContext";
import { aesContent } from "@/data/aesContent";

// Icon mapping for feature items
const iconMap = {
	"mi-compass": (
		<svg
			width={24}
			height={24}
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
			focusable="false"
			xmlns="http://www.w3.org/2000/svg"
			fillRule="evenodd"
			clipRule="evenodd"
		>
			<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z" />
		</svg>
	),
	"mi-pulse": (
		<svg
			width={24}
			height={24}
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
			focusable="false"
			xmlns="http://www.w3.org/2000/svg"
			fillRule="evenodd"
			clipRule="evenodd"
		>
			<path d="M22 9.74l-2 1.02v7.24c-1.007 2.041-5.606 3-8.5 3-3.175 0-7.389-.994-8.5-3v-7.796l-3-1.896 12-5.308 11 6.231v8.769l1 3h-3l1-3v-8.26zm-18 1.095v6.873c.958 1.28 4.217 2.292 7.5 2.292 2.894 0 6.589-.959 7.5-2.269v-6.462l-7.923 4.039-7.077-4.473zm-1.881-2.371l9.011 5.694 9.759-4.974-8.944-5.066-9.826 4.346z" />
		</svg>
	),
	"mi-support": (
		<svg
			width={24}
			height={24}
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
			focusable="false"
			xmlns="http://www.w3.org/2000/svg"
			fillRule="evenodd"
			clipRule="evenodd"
		>
			<path d="M3.278 3.956c-.459 0-.883.211-1.103.552-.363.561-.218 1.315.352 1.832.383.346.888.546 1.385.546.581 0 1.093-.268 1.444-.755l3.208-4.373-.502-.366-2.928 3.966-.4-.557c-.39-.546-.908-.845-1.456-.845m.634 3.928c-.743 0-1.492-.293-2.056-.804-.578-.525-.883-1.211-.883-1.891 0-1.62 1.426-2.232 2.305-2.232.675 0 1.308.265 1.829.756l2.742-3.713 2.112 1.541-3.797 5.177c-.542.751-1.342 1.166-2.252 1.166m15.386-7.839l-1.2 2.215-2.476.455 1.735 1.825-.332 2.496 2.273-1.086 2.271 1.086-.331-2.496 1.735-1.825-2.476-.455-1.199-2.215zm0 2.098l.548 1.013 1.132.208-.793.834.152 1.142-1.039-.496-1.039.496.152-1.142-.794-.834 1.132-.208.549-1.013m-7.312 3.894c-2.48 0-4.494 2.014-4.494 4.494 0 2.482 2.014 4.494 4.494 4.494 2.481 0 4.495-2.012 4.495-4.494 0-2.48-2.014-4.494-4.495-4.494m0 .999c1.928 0 3.496 1.569 3.496 3.495 0 1.927-1.568 3.495-3.496 3.495-1.927 0-3.495-1.568-3.495-3.495 0-1.926 1.568-3.495 3.495-3.495m-4.983 15.965h9.974v-2.778c0-1.256.204-1.786.661-2.494l1.024-1.58c1.148-1.764 2.233-3.43 2.792-4.491.078-.148.03-.328-.112-.418-.168-.109-.403-.076-.536.07-.671.734-2.03 2.164-4.041 4.251l-.369.396c-.951 1.04-1.53 1.54-4.287 1.54h-.123c-2.859-.014-3.442-.515-4.391-1.554l-.356-.382c-1.999-2.074-3.359-3.504-4.042-4.251-.133-.146-.368-.177-.535-.07-.142.091-.189.271-.112.418.585 1.112 1.828 3.18 3.796 6.323.479.766.657 1.44.657 2.489v2.531zm10.973.999h-11.972v-3.53c0-.851-.132-1.363-.504-1.958-2.01-3.208-3.228-5.239-3.833-6.388-.321-.611-.126-1.352.455-1.725.565-.361 1.361-.258 1.812.236.668.731 2.059 2.195 4.024 4.233l.374.402c.786.86 1.111 1.216 3.659 1.228h.118c2.439 0 2.764-.355 3.55-1.215l.387-.415c2.005-2.08 3.358-3.504 4.024-4.232.452-.495 1.249-.598 1.811-.237.582.373.777 1.114.457 1.725-.582 1.101-1.677 2.786-2.839 4.57l-1.022 1.576c-.348.541-.501.889-.501 1.953v3.777z" />
		</svg>
	),
	"mi-lightbulb": (
		<svg
			width={24}
			height={24}
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
			focusable="false"
			xmlns="http://www.w3.org/2000/svg"
			fillRule="evenodd"
			clipRule="evenodd"
		>
			<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15h4v2h-4v-2zm0-6h4v4h-4v-4zm0-6h4v4h-4V5z" />
		</svg>
	),
};

export default function Features() {
	const { language } = useLanguage();
	const items = aesContent[language].featureHighlights.items;

	return (
		<div className="container position-relative">
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
						{/* Features items */}
						{items.map((item, index) => (
							<SwiperSlide key={index} className="owl-item">
								<div className="features-item">
									<div className="features-icon">
										{iconMap[item.icon] ||
											iconMap["mi-compass"]}
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
						{/* End Features items */}
					</Swiper>
				</div>
			</div>
		</div>
	);
}
