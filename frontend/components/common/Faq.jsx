"use client";
import { faqDataMain } from "@/data/faqs";
import { useLanguage } from "@/context/LanguageContext";
import React, { useEffect, useRef, useState } from "react";

export default function Faq({
	faqData = null,
	faqs = null,
	loading = false,
	error = null,
	totalCount = 0,
}) {
	const { language } = useLanguage();
	const questionRefs = useRef([]);
	const answerRefs = useRef([]);
	const [currentIndex, setCurrentIndex] = useState(-1);

	// Convert API data to FAQ format if using API
	let faqList = faqData || faqDataMain;
	if (faqs) {
		faqList = faqs.map(item => ({
			question: item.title,
			answer: item.content || item.excerpt,
		}));
	}

	useEffect(() => {
		questionRefs.current.forEach(el => {
			el?.classList.remove("active");
		});
		answerRefs.current.forEach(el => {
			if (el) {
				el.style.height = "0px";
				el.style.overflow = "hidden";
				el.style.transition = "all 0.5s ease-in-out";
				el.style.marginBottom = "0px";
			}
		});
		if (currentIndex !== -1 && questionRefs.current[currentIndex]) {
			questionRefs.current[currentIndex].classList.add("active");
			const element = answerRefs.current[currentIndex];
			if (element) {
				element.style.height = element.scrollHeight + "px";
				element.style.overflow = "hidden";
				element.style.transition = "all 0.5s ease-in-out";
				element.style.marginBottom = "1.55em";
			}
		}
	}, [currentIndex, faqList]);

	const translations = {
		loading: {
			pt: "Carregando perguntas frequentes...",
			en: "Loading FAQs...",
		},
		error: {
			pt: "Erro ao carregar perguntas frequentes.",
			en: "Error loading FAQs.",
		},
		noResults: {
			pt: "Nenhuma pergunta encontrada.",
			en: "No questions found.",
		},
		noFilterResults: {
			pt: "Nenhuma pergunta encontrada com a pesquisa aplicada.",
			en: "No questions found with the applied search.",
		},
	};

	if (loading) {
		return (
			<div className="text-center py-5">
				<p className="text-gray">{translations.loading[language]}</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center py-5">
				<p className="text-gray">{translations.error[language]}</p>
			</div>
		);
	}

	if (!faqList || faqList.length === 0) {
		return (
			<div className="text-center py-5">
				<p className="text-gray">
					{totalCount === 0
						? translations.noResults[language]
						: translations.noFilterResults[language]}
				</p>
			</div>
		);
	}

	return (
		<dl className="toggle">
			{faqList.map((item, index) => (
				<React.Fragment key={index}>
					<dt
						onClick={() => {
							setCurrentIndex(pre => (pre == index ? -1 : index));
						}}
					>
						<a ref={el => (questionRefs.current[index] = el)}>
							{typeof item.question === "object"
								? item.question[language]
								: item.question}
						</a>
					</dt>
					<dd
						ref={el => (answerRefs.current[index] = el)}
						className="black faqAnswer"
					>
						{typeof item.answer === "object" ? (
							item.answer[language]
						) : (
							<div
								dangerouslySetInnerHTML={{ __html: item.answer }}
							/>
						)}
					</dd>
				</React.Fragment>
			))}
		</dl>
	);
}
