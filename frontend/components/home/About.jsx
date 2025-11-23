"use client";
import { missionBlock, schoolIdentity } from "@/data/aesContent";
import Image from "next/image";

export default function About() {
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
				<h4 className="h5">Missão</h4>
				<p className="text-gray">{missionBlock.description}</p>
				<h4 className="h5">Visão</h4>
				<p className="text-gray">
					Somos uma comunidade escolar que trabalha em rede com
					famílias, parceiros científicos e empresas para garantir
					percursos flexíveis e relevantes em todas as etapas de
					formação.
				</p>
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
