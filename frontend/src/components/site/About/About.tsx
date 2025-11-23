"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

const AboutArea = ({ about_pt = "" }) => {
  const { t } = useTranslation("about");

  return (
    <>
      <section
        id="welcome"
        className={`about__area pb-120 pt-60 p-relative ${about_pt && about_pt}`}
      >
        <div className="container">
          <div className="row">
            <div className="col-xxl-7 col-xl-7 col-lg-7">
              <div className="about__thumb-wrapper d-sm-flex mr-20 p-relative">
                <div className="about__shape">
                  <img
                    className="about__shape-1 d-none d-sm-block"
                    src="assets/img/about/about-shape-1.png"
                    alt="Decorative shape"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                  <img
                    className="about__shape-2 d-none d-sm-block"
                    src="assets/img/about/about-shape-2.png"
                    alt="Decorative shape"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                  <img
                    className="about__shape-3"
                    src="assets/img/about/about-shape-3.png"
                    alt="Decorative shape"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </div>
                <div className="about__thumb-left mr-10">
                  <div className="about__thumb-1 mb-10">
                    <img
                      src="assets/img/about/about-1.jpg"
                      alt="About us - Campus view 1"
                      style={{ maxWidth: '100%', height: 'auto', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="about__thumb-1 mb-10 text-end">
                    <img
                      src="assets/img/about/about-3.jpg"
                      alt="About us - Campus view 3"
                      style={{ maxWidth: '100%', height: 'auto', objectFit: 'cover' }}
                    />
                  </div>
                </div>
                <div className="about__thumb-2 mb-10">
                  <img
                    src="assets/img/about/about-2.jpg"
                    alt="About us - Campus view 2"
                    style={{ maxWidth: '100%', height: 'auto', objectFit: 'cover' }}
                  />
                </div>
              </div>
            </div>
            <div className="col-xxl-5 col-xl-5 col-lg-5">
              <div className="about__content pl-70 pr-25">
                <div className="section__title-wrapper mb-15">
                  <span className="section__title-pre">
                    {t("section.pre_title")}
                  </span>
                  <h2 className="section__title">{t("section.main_title")}</h2>
                </div>
                <p>{t("section.description")}</p>

                <div className="about__list mb-40">
                  <ul>
                    <li>
                      <i className="fa-solid fa-check"></i>
                      {t("section.features.0")}
                    </li>
                    <li>
                      <i className="fa-solid fa-check"></i>
                      {t("section.features.1")}
                    </li>
                    <li>
                      <i className="fa-solid fa-check"></i>
                      {t("section.features.2")}
                    </li>
                  </ul>
                </div>

                <div className="about__btn">
                  <Link href="/sobre-nos" className="tp-btn tp-btn-2">
                    {t("section.read_more")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutArea;
