"use client";

import React from "react";
import Area from "@/components/site/Events/Area";
import BreadCrumb from "@/components/site/BreadCrumb";
import { useTranslation } from "react-i18next";

const Evento = () => {
  const { t } = useTranslation("content");

  return (
    <>
      <BreadCrumb title={t("events.title")} subtitle={t("events.subtitle")} />
      <Area />
    </>
  );
};

export default Evento;
