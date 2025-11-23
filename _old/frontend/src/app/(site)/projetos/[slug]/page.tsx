import React from "react";
import DetailsArea from "@/components/site/Projects/DetailsArea";
import { number } from "motion/react";

interface ProjectDetailsProps {
	params: {
		slug: string;
	};
}

const ProjectDetails = ({ params: { slug } }: ProjectDetailsProps) => {
	return (
		<>
			<DetailsArea projetoSlug={slug} />
		</>
	);
};

export default ProjectDetails;
