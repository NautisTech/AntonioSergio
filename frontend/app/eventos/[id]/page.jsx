"use client";
import Footer1 from "@/components/footers/Footer1";
import Image from "next/image";
import Link from "next/link";
import ParallaxContainer from "@/components/common/ParallaxContainer";
import Header from "@/components/site/Header";
import AnimatedText from "@/components/common/AnimatedText";
import { useLanguage } from "@/context/LanguageContext";
import { events } from "@/data/aesContent";
import { notFound } from "next/navigation";

export default function EventDetailPage({ params }) {
	const { language } = useLanguage();

	// Find the event by slug
	const event = events.find(evt => evt.slug === params.id);

	if (!event) {
		notFound();
	}

	const translations = {
		backToEvents: {
			pt: "Voltar aos eventos",
			en: "Back to events",
		},
		eventDetails: {
			pt: "Detalhes do Evento",
			en: "Event Details",
		},
		date: {
			pt: "Data",
			en: "Date",
		},
		location: {
			pt: "Local",
			en: "Location",
		},
		description: {
			pt: "Descrição",
			en: "Description",
		},
		agenda: {
			pt: "Agenda",
			en: "Agenda",
		},
		previous: {
			pt: "Anterior",
			en: "Previous",
		},
		next: {
			pt: "Próximo",
			en: "Next",
		},
		allEvents: {
			pt: "Todos os eventos",
			en: "All events",
		},
	};

	const formatDate = dateString => {
		const date = new Date(dateString);
		if (language === "pt") {
			return date.toLocaleDateString("pt-PT", {
				year: "numeric",
				month: "long",
				day: "numeric",
			});
		}
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	// Find previous and next events
	const currentIndex = events.findIndex(evt => evt.slug === params.id);
	const prevEvent = currentIndex > 0 ? events[currentIndex - 1] : null;
	const nextEvent =
		currentIndex < events.length - 1 ? events[currentIndex + 1] : null;

	return (
		<>
			<div className="theme-main">
				<div className="page" id="top">
					<nav className="main-nav dark transparent light-after-scroll stick-fixed wow-menubar">
						<Header />
					</nav>
					<main id="main">
						<section className="page-section pt-0 pb-0" id="home">
							<ParallaxContainer
								className="home-section bg-dark-1 bg-dark-alpha-30 light-content parallax-5"
								style={{
									backgroundImage: `url(${event.cover})`,
								}}
							>
								<>
									<div className="position-absolute top-0 bottom-0 start-0 end-0 bg-gradient-dark opacity-07" />
									<div className="container position-relative min-height-100vh d-flex align-items-end pt-100 pb-100">
										{/* Section Content */}
										<div className="home-content text-center">
											<div className="row">
												{/* Page Title */}
												<div className="col-md-8 offset-md-2">
													<div className="mb-20">
														<Link
															href="/eventos"
															className="btn btn-mod btn-small btn-border-w btn-circle"
															data-btn-animate="y"
														>
															<i className="mi-arrow-left align-center size-18" />{" "}
															{translations.backToEvents[language]}
														</Link>
													</div>
													<h1 className="hs-title-1 mb-20">
														<span
															className="wow charsAnimIn"
															data-splitting="chars"
														>
															<AnimatedText text={event.title} />
														</span>
													</h1>
													<div className="row">
														<div className="col-md-10 offset-md-1 col-lg-8 offset-lg-2">
															<p
																className="section-descr mb-0 wow fadeIn"
																data-wow-delay="0.2s"
																data-wow-duration="1.2s"
															>
																{event.summary}
															</p>
														</div>
													</div>
												</div>
												{/* End Page Title */}
											</div>
										</div>
										{/* End Section Content */}
										{/* Scroll Down */}
										<div
											className="local-scroll scroll-down-wrap wow fadeInUp"
											data-wow-offset={0}
										>
											<a href="#start" className="scroll-down">
												<i className="mi-chevron-down" />
												<span className="visually-hidden">
													{language === "pt"
														? "Rolar para a próxima secção"
														: "Scroll to the next section"}
												</span>
											</a>
										</div>
										{/* End Scroll Down */}
									</div>
								</>
							</ParallaxContainer>
						</section>
						<>
							<>
								{/* Section */}
								<section className="page-section" id="start">
									<div className="container relative">
										<div className="row mb-80 mb-sm-40">
											{/* Event Details */}
											<div className="col-md-6 mb-sm-40">
												<h2 className="h3 mb-20">
													{translations.eventDetails[language]}
												</h2>
												<div className="row text-gray">
													<div className="col-sm-4">
														<b>{translations.date[language]}:</b>
													</div>
													<div className="col-sm-8">
														{formatDate(event.date)}
													</div>
												</div>
												<hr className="mb-20" />
												<div className="row text-gray">
													<div className="col-sm-4">
														<b>{translations.location[language]}:</b>
													</div>
													<div className="col-sm-8">{event.location}</div>
												</div>
												<hr className="mb-20" />

												{/* Agenda */}
												{event.agenda && event.agenda.length > 0 && (
													<>
														<h3 className="h4 mt-40 mb-20">
															{translations.agenda[language]}
														</h3>
														{event.agenda.map((item, index) => (
															<div key={index}>
																<div className="row text-gray">
																	<div className="col-sm-4">
																		<b>{item.time}</b>
																	</div>
																	<div className="col-sm-8">{item.title}</div>
																</div>
																{index < event.agenda.length - 1 && (
																	<hr className="mb-20" />
																)}
															</div>
														))}
													</>
												)}
											</div>
											{/* End Event Details */}

											{/* Event Description */}
											<div className="col-md-6">
												<h2 className="h3 mb-20">
													{translations.description[language]}
												</h2>
												<p className="text-gray mb-0">{event.description}</p>
											</div>
											{/* End Event Description */}
										</div>
									</div>
								</section>
								{/* End Section */}

								{/* Divider */}
								<hr className="mt-0 mb-0" />
								{/* End Divider */}
							</>

							{/* End Divider */}

							{/* Divider */}
							<hr className="mt-0 mb-0" />
							{/* End Divider */}

							{/* Work Navigation */}
							<div className="work-navigation clearfix">
								{prevEvent && (
									<Link
										href={`/eventos/${prevEvent.slug}`}
										className="work-prev"
									>
										<span>
											<i className="mi-arrow-left size-24 align-middle" />{" "}
											{translations.previous[language]}
										</span>
									</Link>
								)}
								<Link href="/eventos" className="work-all">
									<span>
										<i className="mi-close size-24 align-middle" />{" "}
										{translations.allEvents[language]}
									</span>
								</Link>
								{nextEvent && (
									<Link
										href={`/eventos/${nextEvent.slug}`}
										className="work-next"
									>
										<span>
											{translations.next[language]}{" "}
											<i className="mi-arrow-right size-24 align-middle" />
										</span>
									</Link>
								)}
							</div>
						</>
					</main>
					<Footer1 />
				</div>
			</div>
		</>
	);
}
