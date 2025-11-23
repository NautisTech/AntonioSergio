import React from "react";
import DetailsArea from "@/components/site/Events/DetailsArea";
import { number } from "motion/react";

interface EventDetailsProps {
	params: {
		slug: string;
	};
}

const EventDetails = ({ params: { slug } }: EventDetailsProps) => {
	return (
		<>
			<DetailsArea eventoSlug={slug} />
		</>
	);
};

export default EventDetails;
