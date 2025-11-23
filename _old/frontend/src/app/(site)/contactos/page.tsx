"use client";

import React from "react";
import BreadCrumb from "@/components/site/BreadCrumb";
import ContactArea from "@/components/site/Contact/ContactArea";
import ContactInfoArea from "@/components/site/Contact/ContactInfoArea";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const { t } = useTranslation("contact");

  return (
    <>
      <BreadCrumb title={t("title")} subtitle={t("title")} />
      <ContactArea />
      <ContactInfoArea />
    </>
  );
};

export default Contact;
