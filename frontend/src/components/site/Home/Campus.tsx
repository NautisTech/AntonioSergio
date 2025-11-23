"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

const Campus = () => {
  const { t } = useTranslation("home");
  const [open, setOpen] = useState(false);
  const onOpenModal = () => setOpen(true);
  const onCloseModal = () => setOpen(false);

  return (
    <>
      <section className="campus__area pt-120 pb-120">
        <div className="container">
          <div className="row grid">
            <div className="col-xxl-4 col-xl-4 col-lg-6 col-md-6">
              <div className="campus__wrapper">
                <div className="section__title-wrapper mb-25">
                  <span className="section__title-pre">{t("campus.pre_title")}</span>
                  <h2 className="section__title section__title-40">
                    {t("campus.title")}
                  </h2>
                  <p className="mt-3">
                    {t("campus.description")}
                  </p>
                </div>
                <div className="campus__btn mb-80">
                  <Link href="/sobre-nos#mission-values" className="tp-btn tp-btn-border">
                    {t("campus.button_text")}
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-xxl-4 col-xl-4 col-lg-4 col-md-6">
              <div className="campus__thumb campus__media mb-30">
                <video
                  controls
                  preload="metadata"
                  className="campus__video"
                  style={{ maxWidth: '100%', height: 'auto', width: '100%', objectFit: 'cover' }}
                >
                  <source src="assets/img/campus/campus-1.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
            <div className="col-xxl-4 col-xl-4 col-lg-6 col-md-6">
              <div className="campus__thumb campus__media mb-25">
                <img
                  src="assets/img/campus/campus-2.jpg"
                  alt="Campus view 2"
                  className="campus__image"
                  style={{ maxWidth: '100%', height: 'auto', objectFit: 'cover' }}
                />
              </div>
            </div>
            <div className="col-xxl-4 col-xl-4 col-lg-6 col-md-6">
              <div className="campus__thumb campus__media mb-30">
                <img
                  src="assets/img/campus/campus-3.jpg"
                  alt="Campus view 3"
                  className="campus__image"
                  style={{ maxWidth: '100%', height: 'auto', objectFit: 'cover' }}
                />
              </div>
            </div>
            <div className="col-xxl-4 col-xl-4 col-lg-6 col-md-6">
              <div className="campus__thumb campus__media mb-30">
                <img
                  src="assets/img/campus/campus-4.jpg"
                  alt="Campus view 4"
                  className="campus__image"
                  style={{ maxWidth: '100%', height: 'auto', objectFit: 'cover' }}
                />
              </div>
            </div>
            <div className="col-xxl-4 col-xl-4 col-lg-6 col-md-6">
              <div className="campus__thumb campus__media mb-30">
                <img
                  src="assets/img/campus/campus-5.jpg"
                  alt="Campus view 5"
                  className="campus__image"
                  style={{ maxWidth: '100%', height: 'auto', objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Campus;
