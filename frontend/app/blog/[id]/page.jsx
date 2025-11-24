"use client";
import Footer1 from "@/components/footers/Footer1";
import ParallaxContainer from "@/components/common/ParallaxContainer";
import Header from "@/components/site/Header";
import AnimatedText from "@/components/common/AnimatedText";
import Widget1 from "@/components/blog/widgets/Widget1";
import { useLanguage } from "@/context/LanguageContext";
import { aesContent } from "@/data/aesContent";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default function BlogDetailPage({ params }) {
	const { language } = useLanguage();
	const content = aesContent[language];
	const blogPosts = content.blogPosts || [];

	// Find the blog post by slug (params.id is actually the slug)
	const blog = blogPosts.find(post => post.slug === params.id);

	if (!blog) {
		notFound();
	}

	const translations = {
		backToBlog: {
			pt: "Voltar ao blog",
			en: "Back to blog",
		},
		prevPost: {
			pt: "Artigo anterior",
			en: "Prev post",
		},
		nextPost: {
			pt: "Próximo artigo",
			en: "Next post",
		},
		readingTime: {
			pt: "Tempo de leitura",
			en: "Reading time",
		},
	};

	const formatDate = dateString => {
		const date = new Date(dateString);
		if (language === "pt") {
			return date.toLocaleDateString("pt-PT", {
				year: "numeric",
				month: "long",
				day: "numeric",
			});
		}
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	// Find previous and next posts
	const currentIndex = blogPosts.findIndex(post => post.slug === params.id);
	const prevPost = currentIndex > 0 ? blogPosts[currentIndex - 1] : null;
	const nextPost =
		currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null;

	return (
		<>
			<div className="theme-main">
				<div className="page" id="top">
					<nav className="main-nav transparent stick-fixed wow-menubar">
						<Header />
					</nav>
					<main id="main">
						<section className="page-section pt-0 pb-0" id="home">
							<ParallaxContainer
								className="page-section bg-dark-1 bg-dark-alpha-90 parallax-5 light-content"
								style={{
									backgroundImage:
										"url(/assets/school/campus/campus-2.jpg)",
								}}
							>
								<div className="container position-relative pt-30 pt-sm-50">
									{/* Section Content */}
									<div className="text-center">
										<div className="row">
											{/* Page Title */}
											<div className="col-md-8 offset-md-2">
												<div className="mb-20">
													<Link
														href="/blog"
														className="btn btn-mod btn-small btn-border-w btn-circle"
														data-btn-animate="y"
													>
														<i className="mi-arrow-left align-center size-18" />{" "}
														{translations.backToBlog[language]}
													</Link>
												</div>
												<h1 className="hs-title-1 mb-20">
													<span
														className="wow charsAnimIn"
														data-splitting="chars"
													>
														<AnimatedText text={blog.title} />
													</span>
												</h1>

												{/* Author, Date, Category */}
												<div
													className="blog-item-data mt-30 mt-sm-10 mb-0 wow fadeInUp"
													data-wow-delay="0.2s"
												>
													<div className="d-inline-block me-3">
														<i className="mi-clock size-16" />
														<span className="visually-hidden">
															{language === "pt" ? "Data:" : "Date:"}
														</span>{" "}
														{formatDate(blog.date)}
													</div>
													<div className="d-inline-block me-3">
														<i className="mi-user size-16" />
														<span className="visually-hidden">
															{language === "pt" ? "Autor:" : "Author:"}
														</span>{" "}
														{blog.author.name}
													</div>
													<div className="d-inline-block me-3">
														<i className="mi-folder size-16" />
														<span className="visually-hidden">
															{language === "pt"
																? "Categoria:"
																: "Category:"}
														</span>
														<span> {blog.category}</span>
													</div>
													{blog.readingTime && (
														<div className="d-inline-block me-3">
															<i className="mi-book size-16" />
															<span className="visually-hidden">
																{translations.readingTime[language]}:
															</span>{" "}
															{blog.readingTime}
														</div>
													)}
												</div>
											</div>
											{/* End Page Title */}
										</div>
									</div>
									{/* End Section Content */}
								</div>
							</ParallaxContainer>
						</section>
						<>
							{/* Section */}
							<section className="page-section">
								<div className="container relative">
									<div className="row">
										{/* Content */}
										<div className="col-md-8 mb-sm-80">
											{/* Post */}
											<div className="blog-item mb-80 mb-xs-40">
												<div className="blog-item-body">
													{/* Image */}
													{blog.cover && (
														<div className="blog-media mb-40 mb-xs-30">
															<Image
																src={blog.cover}
																width={1350}
																height={865}
																alt={blog.title}
															/>
														</div>
													)}

													{/* Content */}
													{blog.content &&
														blog.content.map((paragraph, index) => (
															<p key={index}>{paragraph}</p>
														))}
												</div>
											</div>
											{/* End Post */}

											{/* Prev/Next Post */}
											<div className="clearfix mt-40">
												{prevPost && (
													<Link
														href={`/blog/${prevPost.slug}`}
														className="blog-item-more left"
													>
														<i className="mi-chevron-left" />
														&nbsp;{translations.prevPost[language]}
													</Link>
												)}
												{nextPost && (
													<Link
														href={`/blog/${nextPost.slug}`}
														className="blog-item-more right"
													>
														{translations.nextPost[language]}&nbsp;
														<i className="mi-chevron-right" />
													</Link>
												)}
											</div>
										</div>
										{/* End Content */}

										{/* Sidebar */}
										<div className="col-md-4 col-lg-3 offset-lg-1">
											<Widget1 searchInputClass="form-control input-lg search-field round" />
										</div>
										{/* End Sidebar */}
									</div>
								</div>
							</section>
							{/* End Section */}
						</>
					</main>
					<Footer1 />
				</div>
			</div>
		</>
	);
}
