"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { aesContent } from "@/data/aesContent";
import { useLanguage } from "@/context/LanguageContext";
import { useNewsletterSubscribe } from "@/lib/api/public-newsletter";

export default function NewsLetter() {
	const { language } = useLanguage();
	const content = aesContent[language].newsletter;
	const [email, setEmail] = useState("");
	const { subscribe, loading } = useNewsletterSubscribe();

	const translations = {
		success: {
			pt: "Subscrição realizada com sucesso! Obrigado por se juntar à nossa newsletter.",
			en: "Successfully subscribed! Thank you for joining our newsletter.",
		},
		alreadySubscribed: {
			pt: "Este email já está subscrito à nossa newsletter.",
			en: "This email is already subscribed to our newsletter.",
		},
		error: {
			pt: "Erro ao subscrever. Por favor, tente novamente.",
			en: "Error subscribing. Please try again.",
		},
	};

	const handleSubmit = async e => {
		e.preventDefault();
		if (!email || loading) return;

		try {
			await subscribe({ email, language });
			toast.success(translations.success[language]);
			setEmail("");
		} catch (error) {
			if (error.response?.status === 409) {
				toast.info(translations.alreadySubscribed[language]);
			} else {
				toast.error(translations.error[language]);
			}
		}
	};

	return (
		<div className="container position-relative">
			<div className="row">
				<div className="col-md-8 offset-md-2 col-xl-6 offset-xl-3 wow fadeInUp">
					<h2 className="section-title-small text-center mb-40">
						{content.title}
					</h2>
					<form
						onSubmit={handleSubmit}
						id="mailchimp"
						className="form"
					>
						<div className="d-sm-flex justify-content-between mb-20">
							<label
								htmlFor="newsletter-email"
								className="visually-hidden"
							>
								{content.emailLabel}
							</label>
							<input
								placeholder={content.emailPlaceholder}
								className="newsletter-field input-lg round"
								id="newsletter-email"
								name="newsletter-email"
								type="email"
								pattern=".{5,100}"
								required
								aria-required="true"
								value={email}
								onChange={e => setEmail(e.target.value)}
								disabled={loading}
							/>
							<button
								type="submit"
								aria-controls="subscribe-result"
								className="newsletter-button btn btn-mod btn-large btn-round btn-hover-anim"
								style={{
									borderColor: "#A51C30",
									border: "2px solid #A51C30",
								}}
								disabled={loading}
							>
								<span>
									{loading
										? language === "pt"
											? "A enviar..."
											: "Sending..."
										: content.buttonText}
								</span>
							</button>
						</div>
						<div className="form-tip">
							<i className="icon-info size-16" />{" "}
							{content.disclaimer}
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
