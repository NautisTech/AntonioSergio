"use client"

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';

const HomeCourses = () => {
  const { t } = useTranslation("home");

  const courses = [
    {
      _id: "1",
      img_bg: "/assets/img/courses/course-1.jpg",
      title: t("courses.items.0.title"),
      description: t("courses.items.0.description"),
      pdfFile: "/assets/pdf/ciberseguranca-redes.pdf"
    },
    {
      _id: "2",
      img_bg: "/assets/img/courses/course-2.jpg",
      title: t("courses.items.1.title"),
      description: t("courses.items.1.description"),
      pdfFile: "/assets/pdf/microcontroladores-hardware.pdf"
    },
    {
      _id: "3",
      img_bg: "/assets/img/courses/course-3.jpg",
      title: t("courses.items.2.title"),
      description: t("courses.items.2.description"),
      pdfFile: "/assets/pdf/programacao.pdf"
    },
    {
      _id: "4",
      img_bg: "/assets/img/courses/course-4.jpg",
      title: t("courses.items.3.title"),
      description: t("courses.items.3.description"),
      pdfFile: "/assets/pdf/mecanica.pdf"
    },
    {
      _id: "5",
      img_bg: "/assets/img/courses/course-5.jpg",
      title: t("courses.items.4.title"),
      description: t("courses.items.4.description"),
      pdfFile: "/assets/pdf/eletrotecnia.pdf"
    },
    {
      _id: "6",
      img_bg: "/assets/img/courses/course-6.jpg",
      title: t("courses.items.5.title"),
      description: t("courses.items.5.description"),
      pdfFile: "/assets/pdf/energias-renovaveis.pdf"
    },
  ];

  const handlePdfDownload = (pdfFile: string, courseName: string) => {
    // For now, show an alert since PDFs aren't available yet
    alert(`${t("courses.download_not_available")} ${courseName}. ${t("courses.file")}: ${pdfFile}`);
  };

  return (
    <>
      <section id="educational-project" className="course__area pt-115 pb-90 crimson-bg">
        <div className="container">
          <div className="row">
            <div className="col-xxl-12">
              <div className="section__title-wrapper text-center mb-60">
                <span className="section__title-pre text-white">{t("courses.pre_title")}</span>
                <h2 className="section__title section__title-44 text-white">
                  {t("courses.title")}
                </h2>
                <p className="text-white">
                  {t("courses.description")}
                </p>
              </div>
            </div>
          </div>
          <div className="row">
            {courses.slice(0, 6).map((course) => {
              return (
                <div key={course?._id} className="col-xxl-4 col-xl-4 col-lg-6 col-md-6">
                  <div className="course__item white-bg transition-3 mb-30">
                    <div className="course__thumb w-img fix course_thumb_height">
                      <Link href={`/course-details/${course?._id}`}>
                        <img src={course?.img_bg} alt="" />
                      </Link>
                    </div>
                    <div className="course__content p-relative">
                      <h3 className="course__title">
                        <Link href={`/course-details/${course?._id}`}>
                          {course?.title?.substring(0, 30)}
                        </Link>
                      </h3>
                      <p>
                        {course?.description || ""}
                      </p>

                      <div className="course__bottom d-sm-flex align-items-center justify-content-between">
                        <div className="course__tutor">
                          <Link href={`/course-details/${course?._id}`}>
                            <Download />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};

export default HomeCourses;
