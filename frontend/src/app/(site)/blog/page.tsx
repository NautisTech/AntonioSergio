"use client";

import React from "react";
import Area from "@/components/site/Blog/Area";
import BreadCrumb from "@/components/site/BreadCrumb";
import { useTranslation } from "react-i18next";

const Blog = () => {
  const { t } = useTranslation("content");

  return (
    <>
      <BreadCrumb title={t("blogs.title")} subtitle={t("blogs.subtitle")} />
      <Area />
    </>
  );
};

export default Blog;
