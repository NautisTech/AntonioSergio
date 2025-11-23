"use client";
import { aesContent } from "@/data/aesContent";
import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";

export default function About() {
	const { language } = useLanguage();
	const content = aesContent[language];
	const missionBlock = content.missionBlock;
	const schoolIdentity = content.schoolIdentity;

	return (
		<div className="row wow fadeInUp" data-wow-delay="0.5s">
			<div className="col-lg-6 mb-md-60">
				<div className="position-relative">
					{/* Image */}
					<div className="position-relative overflow-hidden">
						<Image
							width={960}
							height={539}
							src="/assets/school/about/about-1.jpg"
							className="image-fullwidth relative"
							alt={`Comunidade educativa do ${schoolIdentity.shortName}`}
						/>
					</div>
					{/* End Image */}
					{/* Decorative Waves */}
					<div
						className="decoration-1 d-none d-sm-block"
						data-rellax-y=""
						data-rellax-speed={1}
						data-rellax-percentage="0.1"
					>
						<Image
							width={159}
							height={74}
							src="/assets/images/decoration-1.svg"
							className="svg-shape"
							alt=""
						/>
					</div>
					{/* End Decorative Waves */}
				</div>
			</div>
			<div className="col-lg-6 col-xl-5 offset-xl-1">
				<h4 className="h5">{missionBlock.missionLabel}</h4>
				<p className="text-gray">{missionBlock.missionDescription}</p>
				<h4 className="h5">{missionBlock.visionLabel}</h4>
				<p className="text-gray">{missionBlock.visionDescription}</p>
				<a
					href={missionBlock.button.href}
					className="btn btn-mod btn-border btn-round btn-small mt-20"
				>
					{missionBlock.button.label}
				</a>
			</div>
		</div>
	);
}
