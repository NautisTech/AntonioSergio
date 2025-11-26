"use client";
import { faqDataMain } from "@/data/faqs";
import { useLanguage } from "@/context/LanguageContext";
import React, { useEffect, useRef, useState } from "react";

export default function Faq({
	faqData = null,
	data = null,
	loading = false,
	error = null,
}) {
	const { language } = useLanguage();
	const questionRefs = useRef([]);
	const answerRefs = useRef([]);
	const [currentIndex, setCurrentIndex] = useState(-1);

	// Convert API data to FAQ format if using API
	let faqs = faqData || faqDataMain;
	if (data?.data) {
		faqs = data.data.map(item => ({
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
	}, [currentIndex, faqs]);

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

	if (!faqs || faqs.length === 0) {
		return (
			<div className="text-center py-5">
				<p className="text-gray">{translations.noResults[language]}</p>
			</div>
		);
	}

	return (
		<dl className="toggle">
			{faqs.map((item, index) => (
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
