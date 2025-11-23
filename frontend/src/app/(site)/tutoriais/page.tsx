
"use client";

import { PageTitle } from "@/components/site/common";
import { useTranslation } from 'react-i18next';

export default function Tutoriais() {
    const { t } = useTranslation("secretary");

    return (
        <>
            <PageTitle title={t("tutoriais.title")} subtitle={t("tutoriais.subtitle")} />
            <section className="tutoriais__area pt-120 pb-90">
            </section>
        </>
    );
}