"use client";
import Faq from "@/components/common/Faq";
import { aesContent } from "@/data/aesContent";
import { useLanguage } from "@/context/LanguageContext";

export default function Faqs() {
	const { language } = useLanguage();
	const faqItems = aesContent[language].faqItems;

	return (
		<div className="call-action-2-text mb-50 mb-sm-40">
			{/* Accordion */}
			<dl className="accordion">
				<Faq faqData={faqItems} />
			</dl>
			{/* End Accordion */}
		</div>
	);
}
