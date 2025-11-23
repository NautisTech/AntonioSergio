import AboutArea from "@/components/site/About/About";
import Campus from "@/components/site/Home/Campus";
import CounterArea from "@/components/site/Home/CounterArea";
import Features from "@/components/site/Home/Features";
import HeroArea from "@/components/site/Home/HeroArea";
import LiveEvent from "@/components/site/Home/LiveEvent";
import NewsFeed from "@/components/site/Home/NewsFeed";
import Cta from "@/components/site/Home/Cta";
import Testimonials from "@/components/site/About/Testimonials";

export default function Home() {
	return (
		<>
			<NewsFeed />
			<HeroArea />
			<Features />
			<LiveEvent />
			<AboutArea />
			<CounterArea />
			<Campus />
			{/* <Cta /> */}
			<Testimonials />
		</>
	);
}
