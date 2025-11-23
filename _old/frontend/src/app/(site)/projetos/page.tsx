"use client";

import React from "react";
import Area from "@/components/site/Projects/Area";
import BreadCrumb from "@/components/site/BreadCrumb";
import { useTranslation } from "react-i18next";

const Projeto = () => {
  const { t } = useTranslation("content");

  return (
    <>
      <BreadCrumb title={t("projects.title")} subtitle={t("projects.subtitle")} />
      <Area />
    </>
  );
};

export default Projeto;
