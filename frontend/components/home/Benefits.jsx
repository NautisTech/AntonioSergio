"use client";
import { aesContent } from "@/data/aesContent";
import { useLanguage } from "@/context/LanguageContext";
import React from "react";

export default function Benefits() {
  const { language } = useLanguage();
  const content = aesContent[language].benefitsContent;

  return (
    <div className="container position-relative">
      {/* Grid */}
      <div className="row">
        {/* Text */}
        <div className="col-md-12 col-lg-3 mb-md-50">
          <h2 className="section-caption mb-xs-10">{content.caption}</h2>
          <h3 className="section-title-small mb-40">{content.title}</h3>
          <div className="section-line" />
        </div>
        {/* End Text */}
        {/* Feature Item */}
        {content.items.map((item, index) => (
          <div key={index} className="col-md-6 col-lg-3 d-flex align-items-stretch mb-sm-30">
            <div className="alt-features-item border-left mt-0">
              <div className="alt-features-icon">
                <svg
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  focusable="false"
                  xmlns="http://www.w3.org/2000/svg"
                  fillRule="evenodd"
                  clipRule="evenodd"
                >
                  <path d={item.svgPath} />
                </svg>
              </div>
              <h4 className="alt-features-title">{item.title}</h4>
              <div className="alt-features-descr">{item.description}</div>
            </div>
          </div>
        ))}
        {/* End Feature Item */}
      </div>
      {/* End Grid */}
    </div>
  );
}
