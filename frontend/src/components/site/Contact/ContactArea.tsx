"use client";

import { mailerAPI } from "@/lib/api/mailer";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const ContactArea = () => {
	const { t } = useTranslation("contact");
	const [formData, setFormData] = useState<{
		to: string;
		subject: string;
		text: string;
		from: string;
		name: string;
	}>({ to: "geral@nautis.pt", subject: "", text: "", from: "", name: "" });
	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const payload: { to: string; subject: string; text: string } = {
			to: formData.to,
			subject: formData.subject,
			text: `${formData.text}\n\nEmail de: ${formData.name}, ${formData.from}`,
		};

		try {
			const result = await mailerAPI.enviarEmail(payload);
			if (result && result.status === 200) {
				toast.success("Email sent successfully!");
				setFormData(prev => ({
					...prev,
					subject: "",
					text: "",
					from: "",
				}));
			}
		} catch (error) {
			console.error(error);
			toast.error("Failed to send email. Please try again later.");
		}
	};

	return (
		<>
			<section className="contact__area pt-115 pb-120">
				<div className="container">
					<div className="row">
						<div className="col-xxl-7 col-xl-7 col-lg-6">
							<div
								className="contact__wrapper"
								id="contact-section"
							>
								<div className="section__title-wrapper mb-40">
									<h2 className="section__title">
										{t("form.title")}
									</h2>
									<p>{t("form.subtitle")}</p>
								</div>
								<div
									className="contact__form"
									id="contact-form"
								>
									<form onSubmit={handleSubmit}>
										<div className="row">
											<div className="col-xxl-6 col-xl-6 col-md-6">
												<div className="contact__form-input">
													<input
														required
														type="text"
														name="Name"
														placeholder={t(
															"form.name"
														)}
														style={{
															backgroundColor:
																"white",
														}}
														value={formData.name}
														onChange={e =>
															setFormData(
																prev => ({
																	...prev,
																	name: e
																		.target
																		.value,
																})
															)
														}
													/>
												</div>
											</div>
											<div className="col-xxl-6 col-xl-6 col-md-6">
												<div className="contact__form-input">
													<input
														required
														type="email"
														name="Email"
														placeholder={t(
															"form.email"
														)}
														style={{
															backgroundColor:
																"white",
														}}
														value={formData.from}
														onChange={e =>
															setFormData(
																prev => ({
																	...prev,
																	from: e
																		.target
																		.value,
																})
															)
														}
													/>
												</div>
											</div>
											<div className="col-xxl-12">
												<div className="contact__form-input">
													<input
														required
														type="text"
														name="Subject"
														placeholder={t(
															"form.subject"
														)}
														style={{
															backgroundColor:
																"white",
														}}
														value={formData.subject}
														onChange={e =>
															setFormData(
																prev => ({
																	...prev,
																	subject:
																		e.target
																			.value,
																})
															)
														}
													/>
												</div>
											</div>
											<div className="col-xxl-12">
												<div className="contact__form-input">
													<textarea
														required
														name="Message"
														placeholder={t(
															"form.message"
														)}
														style={{
															backgroundColor:
																"white",
														}}
														value={formData.text}
														onChange={e =>
															setFormData(
																prev => ({
																	...prev,
																	text: e
																		.target
																		.value,
																})
															)
														}
													></textarea>
												</div>
											</div>
											<div className="col-xxl-12">
												<div className="contact__form-agree  d-flex align-items-center mb-20">
													<input
														required
														className="e-check-input"
														type="checkbox"
														id="e-agree"
													/>
													<label
														className="e-check-label"
														htmlFor="e-agree"
														dangerouslySetInnerHTML={{
															__html: t(
																"form.terms"
															),
														}}
													></label>
												</div>
											</div>
											<div className="col-xxl-12">
												<div className="contact__btn">
													<button
														type="submit"
														className="tp-btn"
													>
														{t("form.send")}
													</button>
												</div>
											</div>
										</div>
									</form>
								</div>
							</div>
						</div>
						<div className="col-xxl-4 offset-xxl-1 col-xl-4 offset-xl-1 col-lg-5 offset-lg-1">
							<div className="contact__info white-bg p-relative z-index-1">
								<div className="contact__shape"></div>
								<div className="contact__info-inner white-bg">
									<ul>
										<li>
											<div className="contact__info-item d-flex align-items-start mb-35">
												<div className="contact__info-icon mr-15">
													<svg
														className="map"
														viewBox="0 0 24 24"
													>
														<path
															className="st0"
															d="M21,10c0,7-9,13-9,13s-9-6-9-13c0-5,4-9,9-9S21,5,21,10z"
														/>
														<circle
															className="st0"
															cx="12"
															cy="10"
															r="3"
														/>
													</svg>
												</div>
												<div className="contact__info-text">
													<h4>
														{t(
															"info.location.title"
														)}
													</h4>
													<p>
														<a
															target="_blank"
															rel="noreferrer"
															href="https://maps.app.goo.gl/P5FH1486pmRcgeFF6"
														>
															{t(
																"info.location.line1"
															)}
														</a>
													</p>
												</div>
											</div>
										</li>
										<li>
											<div className="contact__info-item d-flex align-items-start mb-35">
												<div className="contact__info-icon mr-15">
													<svg
														className="mail"
														viewBox="0 0 24 24"
													>
														<path
															className="st0"
															d="M4,4h16c1.1,0,2,0.9,2,2v12c0,1.1-0.9,2-2,2H4c-1.1,0-2-0.9-2-2V6C2,4.9,2.9,4,4,4z"
														/>
														<polyline
															className="st0"
															points="22,6 12,13 2,6 "
														/>
													</svg>
												</div>
												<div className="contact__info-text">
													<h4>
														{t("info.email.title")}
													</h4>
													<p>
														<a
															href={`mailto:${t(
																"info.email.line1"
															)}`}
														>
															{t(
																"info.email.line1"
															)}
														</a>
													</p>
												</div>
											</div>
										</li>
										<li>
											<div className="contact__info-item d-flex align-items-start mb-35">
												<div className="contact__info-icon mr-15">
													<svg
														className="call"
														viewBox="0 0 24 24"
													>
														<path
															className="st0"
															d="M22,16.9v3c0,1.1-0.9,2-2,2c-0.1,0-0.1,0-0.2,0c-3.1-0.3-6-1.4-8.6-3.1c-2.4-1.5-4.5-3.6-6-6  c-1.7-2.6-2.7-5.6-3.1-8.7C2,3.1,2.8,2.1,3.9,2C4,2,4.1,2,4.1,2h3c1,0,1.9,0.7,2,1.7c0.1,1,0.4,1.9,0.7,2.8c0.3,0.7,0.1,1.6-0.4,2.1  L8.1,9.9c1.4,2.5,3.5,4.6,6,6l1.3-1.3c0.6-0.5,1.4-0.7,2.1-0.4c0.9,0.3,1.8,0.6,2.8,0.7C21.3,15,22,15.9,22,16.9z"
														/>
													</svg>
												</div>
												<div className="contact__info-text">
													<h4>
														{t("info.phone.title")}
													</h4>
													<p>
														<a href="tel:+(351)-22-375-21-99">
															{t(
																"info.phone.line1"
															)}
														</a>
													</p>
													<p>
														<a href="tel:+(351)-22-375-70-58">
															{t(
																"info.phone.line2"
															)}
														</a>
													</p>
												</div>
											</div>
										</li>
									</ul>
									<div className="contact__social pl-30">
										<h4>{t("info.social.title")}</h4>
										<ul>
											<li>
												<a href="#" className="fb">
													<i className="fa-brands fa-facebook-f"></i>
												</a>
											</li>
											<li>
												<a href="#" className="tw">
													<i className="fa-brands fa-twitter"></i>
												</a>
											</li>
											<li>
												<a href="#" className="pin">
													<i className="fa-brands fa-pinterest-p"></i>
												</a>
											</li>
										</ul>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</>
	);
};

export default ContactArea;
