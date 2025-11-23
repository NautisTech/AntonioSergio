
"use client";

import { PageTitle } from "@/components/site/common";
import { useTranslation } from 'react-i18next';

export default function AssociacaoPais() {
    const { t } = useTranslation("school");

    return (
        <>
            <PageTitle title={t("parentsAssociation.title")} subtitle={t("parentsAssociation.subtitle")} />
            <section className="parents-association__area pt-120 pb-90">
            </section>
        </>
    );
}