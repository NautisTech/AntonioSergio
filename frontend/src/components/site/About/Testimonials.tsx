"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { useTranslation } from "react-i18next";

import "swiper/css";
import "swiper/css/pagination";

const Testimonials = () => {
  const { t } = useTranslation("about");

  const testimonialData = [
    {
      id: 1,
      img: "assets/img/testimonial/testimonial-1.jpg",
      review: t("testimonials.items.0.review"),
      description: t("testimonials.items.0.description"),
      name: t("testimonials.items.0.name"),
      title: t("testimonials.items.0.title"),
    },
    {
      id: 2,
      img: "assets/img/testimonial/testimonial-2.jpg",
      review: t("testimonials.items.1.review"),
      description: t("testimonials.items.1.description"),
      name: t("testimonials.items.1.name"),
      title: t("testimonials.items.1.title"),
    },
    {
      id: 3,
      img: "assets/img/testimonial/testimonial-3.jpg",
      review: t("testimonials.items.2.review"),
      description: t("testimonials.items.2.description"),
      name: t("testimonials.items.2.name"),
      title: t("testimonials.items.2.title"),
    },
    {
      id: 4,
      img: "assets/img/testimonial/testimonial-4.jpg",
      review: t("testimonials.items.3.review"),
      description: t("testimonials.items.3.description"),
      name: t("testimonials.items.3.name"),
      title: t("testimonials.items.3.title"),
    },
    {
      id: 5,
      img: "assets/img/testimonial/testimonial-2.jpg",
      review: t("testimonials.items.4.review"),
      description: t("testimonials.items.4.description"),
      name: t("testimonials.items.4.name"),
      title: t("testimonials.items.4.title"),
    },
  ];
  return (
    <>
      <section className="testimonial__area pb-120 fix">
        <div className="container">
          <div className="row">
            <div className="col-xxl-12">
              <div className="section__title-wrapper-2 mb-40 text-center">
                <span className="section__title-pre-2">
                  {t("testimonials.pre_title")}
                </span>
                <h3 className="section__title-2">{t("testimonials.title")}</h3>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-xxl-12">
              <div
                className="testimonial__slider"
                style={{ position: "relative" }}
              >
                <Swiper
                  spaceBetween={30}
                  slidesPerView={3}
                  className="testimonial__slider"
                  pagination={{
                    clickable: true,
                    type: "bullets",
                    el: ".swiper-pagination",
                    renderBullet: function (index, className) {
                      return '<span class="' + className + '"></span>';
                    },
                  }}
                  autoplay={{
                    delay: 6000,
                    disableOnInteraction: false,
                  }}
                  modules={[Pagination, Autoplay]}
                  loop={true}
                  breakpoints={{
                    320: {
                      slidesPerView: 1,
                    },
                    768: {
                      slidesPerView: 2,
                    },
                    992: {
                      slidesPerView: 3,
                    },
                  }}
                >
                  {testimonialData.map((testimonial) => {
                    return (
                      <SwiperSlide key={testimonial.id}>
                        <div className="testimonial__item transition-3 text-center white-bg">
                          <div className="testimonial__avater">
                            <img src={testimonial.img} alt="" />
                          </div>
                          <div className="testimonial__text">
                            <h4>{testimonial.review}</h4>
                            <p>{testimonial.description}</p>
                          </div>
                          <div className="testimonial__avater-info mb-5">
                            <h3>{testimonial.name}</h3>
                            <span>{testimonial.title}</span>
                          </div>
                          <div className="testimonial__rating">
                            <ul>
                              <li>
                                <a href="#">
                                  <i className="fa-solid fa-star"></i>
                                </a>
                              </li>
                              <li>
                                <a href="#">
                                  <i className="fa-solid fa-star"></i>
                                </a>
                              </li>
                              <li>
                                <a href="#">
                                  <i className="fa-solid fa-star"></i>
                                </a>
                              </li>
                              <li>
                                <a href="#">
                                  <i className="fa-solid fa-star"></i>
                                </a>
                              </li>
                              <li>
                                <a href="#">
                                  <i className="fa-solid fa-star"></i>
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
                <div className="swiper-pagination"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Testimonials;
