"use client";

import React from "react";
import BreadCrumb from "@/components/site/BreadCrumb";
import HomeCourses from "@/components/site/Home/HomeCourses";
import AboutArea from "@/components/site/About/About";
import BrandArea from "@/components/site/About/BrandArea";
import TeamArea from "@/components/site/About/TeamArea";
import ResearchArea from "@/components/site/About/ResearchArea";
import Testimonials from "@/components/site/About/Testimonials";
import { useTranslation } from "react-i18next";

const About = () => {
  const { t } = useTranslation("about");
  return (
    <>
      <BreadCrumb title={t("title")} subtitle={t("title")} />
      <AboutArea about_pt="pt-120" />
      <HomeCourses />
      <BrandArea />
      <ResearchArea />
      <Testimonials />
    </>
  );
};

export default About;
