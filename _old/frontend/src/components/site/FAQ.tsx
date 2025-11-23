import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
	ConteudoResumo,
	formatLanguageCode,
	useConteudos,
} from "@/lib/api/conteudos-public";
import { useEntidadeContext, useLanguageContext } from "@/context";

interface FAQItemProps {
	faq: ConteudoResumo;
	index: number;
	isOpen: boolean;
	onToggle: (index: number) => void;
}

const FAQItem = ({ faq, index, isOpen, onToggle }: FAQItemProps) => {
	return (
		<div className="faq__item">
			<button
				className={`faq__question ${isOpen ? "active" : ""}`}
				onClick={() => onToggle(index)}
				type="button"
				aria-expanded={isOpen}
				aria-controls={`faq-answer-${index}`}
			>
				<h4 className="faq__question-text">{faq.titulo}</h4>
				<div className="faq__icon">
					<i className="fa-solid fa-chevron-down"></i>
				</div>
			</button>
			<div
				className={`faq__answer ${isOpen ? "show" : ""}`}
				id={`faq-answer-${index}`}
				role="region"
				aria-labelledby={`faq-question-${index}`}
			>
				<div className="faq__answer-content">
					{faq.subtitulo && (
						<h5 className="faq__answer-subtitle">
							{faq.subtitulo}
						</h5>
					)}
					<div
						className="faq__text"
						dangerouslySetInnerHTML={{ __html: faq.conteudo || "" }}
					/>
				</div>
			</div>
		</div>
	);
};

export const FAQ = () => {
	const { t } = useTranslation("secretary");
	const [openIndex, setOpenIndex] = useState<number | null>(null);

	const { selectedEntidade } = useEntidadeContext();

	const { selectedLanguage } = useLanguageContext();
	const idioma = formatLanguageCode(selectedLanguage);

	const filtros = useMemo(() => {
		const baseFilters: any = { tipoConteudoId: 22 };

		if (selectedEntidade?.value) {
			baseFilters.campoCodigo = "entidades";
			baseFilters.campoValor = selectedEntidade.value;
		}

		return baseFilters;
	}, [selectedEntidade?.value]);

	const { data: faqsData, isLoading, error } = useConteudos(idioma, filtros);

	const faqs = faqsData?.data;

	const handleToggle = (index: number) => {
		setOpenIndex(openIndex === index ? null : index);
	};

	if (isLoading) {
		return (
			<section className="faq__area pt-120 pb-90">
				<div className="container">
					<div className="row">
						<div className="col-12">
							<div className="faq__wrapper">
								<div className="faq__loading">
									<div
										className="spinner-border"
										role="status"
									>
										<span className="visually-hidden">
											{t("faq.loading_spinner")}
										</span>
									</div>
									<p>{t("faq.loading")}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		);
	}

	if (!faqs || faqs.length === 0) {
		return (
			<section className="faq__area pt-120 pb-90">
				<div className="container">
					<div className="row">
						<div className="col-12">
							<div className="faq__wrapper">
								<div className="faq__empty">
									<h3>{t("faq.no_faqs_title")}</h3>
									<p>{t("faq.no_faqs_description")}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="faq__area pt-120 pb-90">
			<div className="container">
				<div className="row">
					<div className="col-12">
						<div className="faq__wrapper">
							<div className="faq__section-title">
								<h2 className="faq__main-title">
									{t("faq.page_title")}
								</h2>
								<p className="faq__subtitle">
									{t("faq.page_subtitle")}
								</p>
							</div>

							<div
								className="faq__accordion"
								role="region"
								aria-label={t("faq.page_title")}
							>
								{faqs.map(
									(faq: ConteudoResumo, index: number) => (
										<FAQItem
											key={faq.id}
											faq={faq}
											index={index}
											isOpen={openIndex === index}
											onToggle={handleToggle}
										/>
									)
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};
