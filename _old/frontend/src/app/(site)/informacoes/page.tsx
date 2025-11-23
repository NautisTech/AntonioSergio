
"use client";

import { PageTitle } from "@/components/site/common";
import { useTranslation } from 'react-i18next';

export default function Informacoes() {
    const { t } = useTranslation("secretary");

    return (
        <>
            <PageTitle title={t("informacoes.title")} subtitle={t("informacoes.subtitle")} />
            <section className="informacoes__area pt-120 pb-90">
            </section>
        </>
    );
}