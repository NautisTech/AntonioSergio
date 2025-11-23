import { contactInfo } from "@/data/aesContent";

const iconMap = {
	facebook: "fa-facebook",
	instagram: "fa-instagram",
	youtube: "fa-youtube",
	linkedin: "fa-linkedin",
};

export default function FooterSocials() {
	return (
		<>
			{contactInfo.socials.map(social => (
				<li key={social.label}>
					<a
						href={social.href}
						rel="noopener nofollow"
						target="_blank"
					>
						<i
							className={
								iconMap[social.label.toLowerCase()] ||
								"fa-globe"
							}
						/>{" "}
						{social.label}
					</a>
				</li>
			))}
		</>
	);
}
