
"use client";

import { PageTitle } from "@/components/site/common";
import { useTranslation } from 'react-i18next';
import Image from 'next/image';

export default function Ementa() {
    const { t } = useTranslation("secretary");

    return (
        <>
            <PageTitle title={t("menu.title")} subtitle={t("menu.subtitle")} />
            <section className="menu__area pt-120 pb-90">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-12">
                            <div className="menu">
                                {/* <Image
                                    src="/images/menu.png"
                                    alt={t("menu.alt_text", "Ementa")}
                                    width={1200}
                                    height={800}
                                    className="img-fluid"
                                    priority
                                /> */}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
