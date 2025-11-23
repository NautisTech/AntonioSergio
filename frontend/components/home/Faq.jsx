import Faq from "@/components/common/Faq";
import { faqItems } from "@/data/aesContent";

export default function Faqs() {
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
