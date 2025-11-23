import Footer1 from "@/components/footers/Footer1";
import ParallaxContainer from "@/components/common/ParallaxContainer";
import Hero1 from "@/components/home/heros/Hero1";
import Header from "@/components/site/Header";
import HomeSchool from "@/components/site/HomeSchool";
import { schoolIdentity } from "@/data/aesContent";

export const metadata = {
	title: `${schoolIdentity.name} | Excelência educativa em Vila Nova de Gaia`,
	description:
		"Agrupamento de Escolas António Sérgio — percursos educativos completos, projetos inovadores e ligação à comunidade.",
};

export default function Home1MainDemoMultiPage() {
	return (
		<>
			<div className="theme-main">
				<div className="page" id="top">
					<nav className="main-nav transparent stick-fixed wow-menubar">
						<Header />
					</nav>
					<main id="main">
						<ParallaxContainer
							className="home-section bg-gray-light-1 bg-light-alpha-90 parallax-5 parallax-mousemove-scene scrollSpysection"
							style={{
								backgroundImage:
									"url(/assets/school/campus/campus-6.jpg)",
							}}
							id="home"
						>
							<Hero1 />
						</ParallaxContainer>
						<HomeSchool />
					</main>
					<Footer1 />
				</div>
			</div>
		</>
	);
}
