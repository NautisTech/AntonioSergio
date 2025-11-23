
"use client";

import { PageTitle } from "@/components/site/common";
import { useTranslation } from 'react-i18next';

export default function Inscricoes() {
    const { t } = useTranslation("secretary");

    return (
        <>
            <PageTitle title={t("inscricoes.title")} subtitle={t("inscricoes.subtitle")} />
            <section className="inscricoes__area pt-120 pb-90">
            </section>
        </>
    );
}