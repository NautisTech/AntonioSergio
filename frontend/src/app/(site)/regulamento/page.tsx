
"use client";

import { PageTitle } from "@/components/site/common";
import { useTranslation } from 'react-i18next';

export default function Educacao() {
    const { t } = useTranslation("school");

    return (
        <>
            <PageTitle title={t("regulations.title")} subtitle={t("regulations.subtitle")} />
            <section className="regulations__area pt-120 pb-90">
            </section>
        </>
    );
}
