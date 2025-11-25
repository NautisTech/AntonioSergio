"use client";
import { aesContent } from "@/data/aesContent";
import { useLanguage } from "@/context/LanguageContext";
import React from "react";

export default function Facts() {
  const { language } = useLanguage();

  // Use default language if not ready
  const currentLanguage = language && aesContent[language] ? language : "pt";
  const highlights = aesContent[currentLanguage].heroContent.highlights;

  return (
    <div className="col-lg-7 offset-lg-1">
      {/* Numbers Grid */}
      <div className="row mt-n50 mt-xs-n30">
        {/* Number Item */}
        {highlights.map((item, index) => (
          <div
            key={index}
            className={`col-sm-6 col-lg-5 mt-50 mt-xs-30 wow fadeScaleIn ${
              index % 2 !== 0 ? "offset-lg-2" : ""
            }`}
            data-wow-delay={`${0.1 + index * 0.1}s`}
          >
            <div className="number-title mb-10">{item.value}</div>
            <div className="number-descr">{item.label}</div>
          </div>
        ))}
        {/* End Number Item */}
      </div>
      {/* End Numbers Grid */}
    </div>
  );
}
