"use client";
import Footer1 from "@/components/footers/Footer1";
import ParallaxContainer from "@/components/common/ParallaxContainer";
import Hero1 from "@/components/home/heros/Hero1";
import Header from "@/components/site/Header";
import HomeSchool from "@/components/site/HomeSchool";
import { schoolIdentity } from "@/data/aesContent";
import { useTheme } from "@/context/ThemeContext";

export default function Home1MainDemoMultiPage() {
	const { theme } = useTheme();
	const isDark = theme === "dark";

	return (
		<>
			<div className="theme-main">
				<div className={isDark ? "dark-mode" : ""}>
					<div className={`page ${isDark ? "bg-dark-1" : ""}`} id="top">
						<nav
							className={`main-nav transparent stick-fixed wow-menubar ${
								isDark ? "" : "dark"
							}`}
						>
							<Header />
						</nav>
						<main id="main">
							<ParallaxContainer
								className={`home-section ${
									isDark
										? "bg-dark-1 bg-dark-alpha-80 light-content"
										: "bg-gray-light-1 bg-light-alpha-90"
								} parallax-5 parallax-mousemove-scene scrollSpysection`}
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
						<Footer1 dark={isDark} />
					</div>
				</div>
			</div>
		</>
	);
}
