
"use client";

import { PageTitle } from "@/components/site/common";
import { useTranslation } from 'react-i18next';

export default function Legislacao() {
    const { t } = useTranslation("secretary");

    return (
        <>
            <PageTitle title={t("legislacao.title")} subtitle={t("legislacao.subtitle")} />
            <section className="legislacao__area pt-120 pb-90">
            </section>
        </>
    );
}