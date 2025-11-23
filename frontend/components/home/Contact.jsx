"use client";
import AnimatedText from "@/components/common/AnimatedText";
import { contactInfo } from "@/data/aesContent";
import React from "react";

export default function Contact() {
	return (
		<div className="container position-relative">
			<div className="row">
				<div className="col-lg-6">
					<div className="row mb-50">
						<div className="col-lg-10">
							<h2 className="section-caption mb-xs-10">
								{contactInfo.title}
							</h2>
							<h3 className="section-title mb-0">
								<span
									className="wow charsAnimIn"
									data-splitting="chars"
								>
									<AnimatedText text={contactInfo.subtitle} />
								</span>
							</h3>
						</div>
					</div>
				</div>
				<div className="col-lg-6">
					<div className="row mb-60 mb-sm-50">
						<div className="col-sm-6 mb-xs-30 d-flex align-items-stretch">
							<div
								className="alt-features-item border-left mt-0 wow fadeScaleIn"
								data-wow-delay=".3s"
							>
								<div className="alt-features-icon">
									<i className="mi-email" aria-hidden="true" />
								</div>
								<h4 className="alt-features-title">
									Secretaria
								</h4>
								<div className="alt-features-descr clearlinks">
									<div>
										<a href={`mailto:${contactInfo.email}`}>
											{contactInfo.email}
										</a>
									</div>
									<div>{contactInfo.phone}</div>
									<div>{contactInfo.officeHours}</div>
								</div>
							</div>
						</div>
						<div className="col-sm-6 d-flex align-items-stretch">
							<div
								className="alt-features-item border-left mt-0 wow fadeScaleIn"
								data-wow-delay=".5s"
							>
								<div className="alt-features-icon">
									<i
										className="mi-location"
										aria-hidden="true"
									/>
								</div>
								<h4 className="alt-features-title">
									Localização
								</h4>
								<div className="alt-features-descr">
									{contactInfo.address}
									<div className="mt-10">
										{contactInfo.fax}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="row wow fadeInUp" data-wow-delay="0.5s">
				<div className="col-md-6 mb-sm-50">
					<form
						onSubmit={e => e.preventDefault()}
						className="form contact-form pe-lg-5"
						id="contact_form"
					>
						<div className="row">
							<div className="col-lg-6">
								<div className="form-group">
									<label htmlFor="name">Nome</label>
									<input
										type="text"
										name="name"
										id="name"
										className="input-lg round form-control"
										placeholder="O teu nome"
										pattern=".{3,100}"
										required
										aria-required="true"
									/>
								</div>
							</div>
							<div className="col-lg-6">
								<div className="form-group">
									<label htmlFor="email">Email</label>
									<input
										type="email"
										name="email"
										id="email"
										className="input-lg round form-control"
										placeholder="Escreve o teu email"
										pattern=".{5,100}"
										required
										aria-required="true"
									/>
								</div>
							</div>
						</div>
						<div className="form-group">
							<label htmlFor="message">Mensagem</label>
							<textarea
								name="message"
								id="message"
								className="input-lg round form-control"
								style={{ height: 130 }}
								placeholder="Como podemos ajudar?"
								defaultValue=""
							/>
						</div>
						<div className="row">
							<div className="col-lg-5">
								<div className="pt-20">
									<button
										className="submit_btn btn btn-mod btn-large btn-round btn-hover-anim"
										id="submit_btn"
										aria-controls="result"
									>
										<span>Enviar mensagem</span>
									</button>
								</div>
							</div>
							<div className="col-lg-7">
								<div className="form-tip pt-20 pt-sm-0 mt-sm-20">
									<i className="icon-info size-16" />
									Todos os campos são obrigatórios. Ao
									submeter aceitas a nossa
									<a href="#"> Política de Privacidade</a>.
								</div>
							</div>
						</div>
						<div
							id="result"
							role="region"
							aria-live="polite"
							aria-atomic="true"
						/>
					</form>
				</div>
				<div className="col-md-6 d-flex align-items-stretch">
					<div className="map-boxed">
						<iframe
							src="https://www.google.com/maps?q=Av.+Nuno+%C3%81lvares,+Vila+Nova+de+Gaia&output=embed"
							width={600}
							height={450}
							style={{ border: 0 }}
							allowFullScreen
							loading="lazy"
							referrerPolicy="no-referrer-when-downgrade"
							title="Localização do Agrupamento"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
