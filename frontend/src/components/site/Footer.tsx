"use client";

import { mailerAPI } from "@/lib/api/mailer";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const Footer = () => {
	const { t, i18n } = useTranslation("footer");
	const { t: nav } = useTranslation("navigation");
	const { t: contact } = useTranslation("contact");

	const [email, setEmail] = useState("");

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		// simple validation
		if (!email?.trim()) {
			toast.error(
				t("newsletter.enter_email") || "Please enter your email"
			);
			return;
		}

		try {
			await mailerAPI.subscribeNewsletter({
				email: email.trim(),
				lang: i18n?.language ?? "pt",
			});

			toast.success(t("newsletter.subscribe_success"));
			setEmail("");
		} catch (err: any) {
			// Api client normalizes errors to { message, statusCode }
			toast.error(
				err?.message ||
					t("newsletter.subscribe_error") ||
					"Subscription failed"
			);
		}
	};

	return (
		<>
			<footer>
				<div className="footer__area footer-crimson">
					<div className="footer__top pt-95 pb-45">
						<div className="container">
							<div className="row">
								<div className="col-xxl-4 col-xl-4 col-lg-4 col-md-6 col-sm-7">
									<div className="footer__widget footer-col-1 mb-50">
										<div className="footer__logo">
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
															objectFit:
																"contain",
														}}
													/>
												</Link>
											</div>
										</div>
										<div className="footer__widget-content">
											<div className="footer__widget-info">
												<p>{t("description")}</p>
												<div className="contact__social">
													<h4>
														{contact(
															"info.social.title"
														)}
													</h4>
													<ul>
														<li>
															<a
																href="#"
																className="fb"
															>
																<i className="fa-brands fa-facebook-f"></i>
															</a>
														</li>
														<li>
															<a
																href="#"
																className="tw"
															>
																<i className="fa-brands fa-twitter"></i>
															</a>
														</li>
														<li>
															<a
																href="#"
																className="pin"
															>
																<i className="fa-brands fa-pinterest-p"></i>
															</a>
														</li>
													</ul>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="col-xxl-2 col-xl-2 col-lg-2 col-md-3 col-sm-5">
									<div className="footer__widget mb-50">
										<h3 className="footer__widget-title">
											{nav("school.title")}
										</h3>
										<div className="footer__widget-content">
											<ul>
												<li>
													<Link href="/sobre-nos">
														{nav("school.about_us")}
													</Link>
												</li>
												<li>
													<Link href="/instalacoes">
														{nav(
															"school.subItems.facilities"
														)}
													</Link>
												</li>
												<li>
													<Link href="/regulamento-interno">
														{nav(
															"school.subItems.internal_regulations"
														)}
													</Link>
												</li>
												<li>
													<Link href="/organograma">
														{nav(
															"school.subItems.organizational_chart"
														)}
													</Link>
												</li>
												<li>
													<Link href="/educacao">
														{nav(
															"school.education"
														)}
													</Link>
												</li>
												<li>
													<Link href="/associacao-pais">
														{nav(
															"school.parents_association"
														)}
													</Link>
												</li>
												<li>
													<Link href="/eqavet">
														{nav("school.eqavet")}
													</Link>
												</li>
												<li>
													<Link href="/contact">
														{nav("contacts.title")}
													</Link>
												</li>
												<li>
													<Link href="/projetos">
														{nav("media.projects")}
													</Link>
												</li>
												<li>
													<Link href="/blog">
														{nav("media.news")}
													</Link>
												</li>
												<li>
													<Link href="/eventos">
														{nav("media.events")}
													</Link>
												</li>
											</ul>
										</div>
									</div>
								</div>
								<div className="col-xxl-2 col-xl-2 col-lg-2 col-md-3 col-sm-5">
									<div className="footer__widget mb-50">
										<h3 className="footer__widget-title">
											{nav("secretary.title")}
										</h3>
										<div className="footer__widget-content">
											<ul>
												<li>
													<Link href="/exames-nacionais">
														{nav(
															"secretary.subItems.national_exams"
														)}
													</Link>
												</li>
												<li>
													<Link href="/manuais-escolares">
														{nav(
															"secretary.subItems.school_textbooks"
														)}
													</Link>
												</li>
												<li>
													<Link href="/plano-escolar">
														{nav(
															"secretary.subItems.school_plan"
														)}
													</Link>
												</li>
												<li>
													<Link href="/ementa">
														{nav(
															"secretary.subItems.menu"
														)}
													</Link>
												</li>
												<li>
													<Link href="/regulamento-cursos">
														{nav(
															"secretary.subItems.professional_courses_regulations"
														)}
													</Link>
												</li>
												<li>
													<Link href="/inscricoes">
														{nav(
															"secretary.subItems.registrations"
														)}
													</Link>
												</li>
												<li>
													<Link href="/legislacao">
														{nav(
															"secretary.subItems.legislation"
														)}
													</Link>
												</li>
												<li>
													<Link href="/informacoes">
														{nav(
															"secretary.subItems.information"
														)}
													</Link>
												</li>
												<li>
													<Link href="/tutoriais">
														{nav(
															"secretary.subItems.tutorials"
														)}
													</Link>
												</li>
												<li>
													<Link href="/faq">
														{nav(
															"secretary.subItems.faq"
														)}
													</Link>
												</li>
											</ul>
										</div>
									</div>
								</div>
								<div className="col-xxl-4 col-xl-4 col-lg-4 col-md-6 col-sm-7">
									<div className="footer__widget footer-col-4 mb-50">
										<h3 className="footer__widget-title">
											{t("newsletter.title")}
										</h3>

										<div className="footer__subscribe">
											<p>{t("newsletter.description")}</p>
											<form onSubmit={handleSubmit}>
												<div className="footer__subscribe-input">
													<input
														type="email"
														name="Email"
														placeholder={t(
															"newsletter.email_placeholder"
														)}
														value={email}
														onChange={e =>
															setEmail(
																e.target.value
															)
														}
													/>
													<button
														type="submit"
														className="tp-btn-subscribe"
													>
														{t(
															"newsletter.subscribe"
														)}
													</button>
												</div>
											</form>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="footer__bottom">
						<div className="container">
							<div className="footer__bottom-inner">
								<div className="row">
									<div className="col-xxl-12">
										<div className="footer__copyright text-center">
											<p>{t("copyright")}</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</footer>
		</>
	);
};

export default Footer;
