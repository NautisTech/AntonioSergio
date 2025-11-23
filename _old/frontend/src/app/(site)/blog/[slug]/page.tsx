import React from "react";
import DetailsArea from "@/components/site/Blog/DetailsArea";
import { number } from "motion/react";

interface BlogDetailsProps {
	params: {
		slug: string;
	};
}

const BlogDetails = ({ params: { slug } }: BlogDetailsProps) => {
	return (
		<>
			<DetailsArea blogSlug={slug} />
		</>
	);
};

export default BlogDetails;
