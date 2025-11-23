"use client";
import { aesContent } from "@/data/aesContent";
import { useLanguage } from "@/context/LanguageContext";

export default function NewsLetter() {
  const { language } = useLanguage();
  const content = aesContent[language].newsletter;

  return (
    <div className="container position-relative">
      <div className="row">
        <div className="col-md-8 offset-md-2 col-xl-6 offset-xl-3 wow fadeInUp">
          <h2 className="section-title-small text-center mb-40">
            {content.title}
          </h2>
          <form
            onSubmit={(e) => e.preventDefault()}
            id="mailchimp"
            className="form"
          >
            <div className="d-sm-flex justify-content-between mb-20">
              <label htmlFor="newsletter-email" className="visually-hidden">
                {content.emailLabel}
              </label>
              <input
                placeholder={content.emailPlaceholder}
                className="newsletter-field input-lg round"
                id="newsletter-email"
                name="newsletter-email"
                type="email"
                pattern=".{5,100}"
                required
                aria-required="true"
              />
              <button
                type="submit"
                aria-controls="subscribe-result"
                className="newsletter-button btn btn-mod btn-large btn-round btn-hover-anim"
              >
                <span>{content.buttonText}</span>
              </button>
            </div>
            <div className="form-tip">
              <i className="icon-info size-16" /> {content.disclaimer}
            </div>
            <div
              id="subscribe-result"
              role="region"
              aria-live="polite"
              aria-atomic="true"
            />
          </form>
        </div>
      </div>
    </div>
  );
}
