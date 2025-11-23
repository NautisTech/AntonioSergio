"use client";
import AnimatedText from "@/components/common/AnimatedText";
import ModalVideo from "@/components/common/ModalVideo";
import { aesContent } from "@/data/aesContent";
import { useLanguage } from "@/context/LanguageContext";
import { parallaxMouseMovement } from "@/utlis/parallax";
import Image from "next/image";

import { useEffect, useState } from "react";

export default function Hero1() {
	useEffect(() => {
		parallaxMouseMovement();
	}, []);
	const [isOpen, setOpen] = useState(false);
	const { language } = useLanguage();
	const heroContent = aesContent[language].heroContent;

	return (
		<>
			<div className="container min-height-100vh d-flex align-items-center pt-100 pb-100 pt-sm-120 pb-sm-120">
				<div className="home-content text-start w-100">
					<div className="row">
						<div className="col-md-6 d-flex align-items-center mb-sm-60">
							<div>
								<h2
									className="section-caption mb-30 mb-xs-10 wow fadeInUp"
									data-wow-duration="1.2s"
								>
									{heroContent.eyebrow}
								</h2>
								<h1 className="hs-title-1 mb-30">
									<AnimatedText text={heroContent.title} />
								</h1>
								<p
									className="section-descr mb-50 wow fadeInUp"
									data-wow-delay="0.6s"
									data-wow-duration="1.2s"
								>
									{heroContent.description}
								</p>
								<div
									className="local-scroll mt-n10 wow fadeInUp wch-unset"
									data-wow-delay="0.7s"
									data-wow-duration="1.2s"
									data-wow-offset={0}
								>
									<a
										href={heroContent.primaryCta.href}
										className="btn btn-mod btn-large btn-round btn-hover-anim align-middle me-2 me-sm-5 mt-10"
									>
										<span>
											{heroContent.primaryCta.label}
										</span>
									</a>
									<a
										href={heroContent.secondaryCta.href}
										className="btn btn-mod btn-border btn-round align-middle me-2 me-sm-5 mt-10"
									>
										{heroContent.secondaryCta.label}
									</a>
									<button
										type="button"
										onClick={() => setOpen(true)}
										className="link-hover-anim align-middle lightbox mfp-iframe mt-10"
										data-link-animate="y"
									>
										<i className="icon-play size-13 me-1" />{" "}
										{heroContent.videoCta.label}
									</button>
								</div>
							</div>
						</div>
						<div className="col-md-5 offset-md-1 d-flex align-items-center">
							<div className="stack-images">
								<div
									className="stack-images-1 parallax-mousemove"
									data-offset={30}
								>
									<div
										className="wow clipRightIn"
										data-wow-delay="1.2s"
										data-wow-duration="1.75s"
									>
										<Image
											src="/assets/school/campus/campus-1.jpg"
											alt="Estudantes no campus"
											width={600}
											height={800}
										/>
									</div>
								</div>
								<div
									className="stack-images-2 parallax-mousemove"
									data-offset={60}
								>
									<div
										className="wow clipRightIn"
										data-wow-delay="1.7s"
										data-wow-duration="1.75s"
									>
										<Image
											width={600}
											height={800}
											src="/assets/school/campus/campus-2.jpg"
											alt="Laboratórios e oficinas"
										/>
									</div>
								</div>
								<div
									className="stack-images-3 parallax-mousemove"
									data-offset={90}
								>
									<div
										className="wow clipRightIn"
										data-wow-delay="2.2s"
										data-wow-duration="1.75s"
									>
										<Image
											width={600}
											height={800}
											src="/assets/school/campus/campus-5.jpg"
											alt="Comunidade educativa"
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div
					className="local-scroll scroll-down-wrap-type-1 wow fadeInUp"
					data-wow-offset={0}
				>
					<div className="container">
						<a href="#sobre" className="scroll-down-1">
							<div className="scroll-down-1-icon">
								<i className="mi-arrow-down" />
							</div>
							<div className="scroll-down-1-text">{heroContent.scrollLabel}</div>
						</a>
					</div>
				</div>
			</div>
			<ModalVideo
				channel="youtube"
				youtube={{ mute: 0, autoplay: 0 }}
				isOpen={isOpen}
				videoId={heroContent.videoCta.videoId}
				setIsOpen={() => setOpen(false)}
			/>
		</>
	);
}
