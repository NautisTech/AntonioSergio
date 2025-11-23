"use client";
import { useTranslation } from 'react-i18next';

const ResearchArea = () => {
  const { t } = useTranslation('about');

  const researchData = [
    {
      id: 1,
      img: "/assets/img/about/mission-1.jpg",
      title: t('values.items.0.title'),
      border: "research__item-border",
      description: t('values.items.0.description')
    },
    {
      id: 2,
      img: "/assets/img/about/mission-2.jpg",
      title: t('values.items.1.title'),
      border: "research__item-border",
      description: t('values.items.1.description')
    },
    {
      id: 3,
      img: "/assets/img/about/mission-3.jpg",
      title: t('values.items.2.title'),
      description: t('values.items.2.description')
    },
  ];
  return (
    <>
      <section className="research__area research__border white-bg pt-115 pb-90 p-relative z-index-1" id="mission-values">
        <div className="research__shape">
          <img
            className="research__shape-1 d-none d-sm-block"
            src="assets/img/about/research-shape-1.png"
            alt=""
          />
          <img
            className="research__shape-2 d-none d-sm-block"
            src="assets/img/about/research-shape-2.png"
            alt=""
          />
          <img
            className="research__shape-3"
            src="assets/img/about/research-shape-3.png"
            alt=""
          />
        </div >
        <div className="container">
          <div className="row">
            <div className="col-xxl-12">
              <div className="section__title-wrapper mb-50 text-center">
                <span className="section__title-pre">{t('values.pre_title')}</span>
                <h2 className="section__title section__title-44 text-dark">
                  {t('values.title')}
                </h2>
              </div>
            </div>
          </div>
          <div className="row">
            {researchData.map((research) => {
              return (
                <div
                  key={research.id}
                  className="col-xxl-4 col-xl-4 col-lg-4 col-md-6"
                >
                  <div
                    className={`research__item ${research.border ? research.border : ""
                      } text-center mb-30 transition-3 hover:bg-crimson hover:text-white`}
                  >
                    <div className="research__thumb mb-35">
                      <img src={research.img} alt="" />
                    </div>
                    <div className="research__content">
                      <h3 className="research__title">{research.title}</h3>
                      <p>
                        {research.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section >
    </>
  );
};

export default ResearchArea;
